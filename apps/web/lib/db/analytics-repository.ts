import { getDb } from "./client";
import { COLLECTIONS } from "./collections";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/types";

export async function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, "id" | "createdAt"> & { id?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const record: AnalyticsEvent = {
    ...event,
    id: event.id ?? `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date(),
  };

  await db.collection<AnalyticsEvent>(COLLECTIONS.analyticsEvents).insertOne(record);
}

/** Basic stats for a future admin dashboard */
export async function getAnalyticsSummary(days = 7): Promise<{
  totalPageViews: number;
  uniqueSessions: number;
  topPaths: { path: string; count: number }[];
  devices: { device: string; count: number }[];
}> {
  const db = await getDb();
  if (!db) {
    return { totalPageViews: 0, uniqueSessions: 0, topPaths: [], devices: [] };
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const collection = db.collection<AnalyticsEvent>(COLLECTIONS.analyticsEvents);
  const match = { createdAt: { $gte: since }, type: "page_view" as AnalyticsEventType };

  const [totals, topPaths, devices] = await Promise.all([
    collection
      .aggregate<{ pageViews: number; uniqueSessions: number }>([
        { $match: match },
        {
          $group: {
            _id: null,
            pageViews: { $sum: 1 },
            uniqueSessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            pageViews: 1,
            uniqueSessions: { $size: "$uniqueSessions" },
          },
        },
      ])
      .toArray(),
    collection
      .aggregate<{ path: string; count: number }>([
        { $match: match },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, path: "$_id", count: 1 } },
      ])
      .toArray(),
    collection
      .aggregate<{ device: string; count: number }>([
        { $match: match },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, device: "$_id", count: 1 } },
      ])
      .toArray(),
  ]);

  const summary = totals[0];
  return {
    totalPageViews: summary?.pageViews ?? 0,
    uniqueSessions: summary?.uniqueSessions ?? 0,
    topPaths,
    devices,
  };
}
