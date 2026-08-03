/**
 * File uploads via Cloudinary (recommended free tier for dev).
 * MongoDB stores URLs only — never binary files.
 *
 * Setup: cloudinary.com → Dashboard → copy cloud name, API key, secret.
 * Optional folder: find-near-doctor/dev
 */
import { v2 as cloudinary } from "cloudinary";

export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  fileName: string;
}

function getCloudinaryConfig() {
  const url = (process.env["CLOUDINARY_URL"] ?? "").trim();
  if (url) {
    return { url };
  }

  const cloudName = (process.env["CLOUDINARY_CLOUD_NAME"] ?? "").trim();
  const apiKey = (process.env["CLOUDINARY_API_KEY"] ?? "").trim();
  const apiSecret = (process.env["CLOUDINARY_API_SECRET"] ?? "").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
}

export function doctorUploadFolder(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `find-near-doctor/dev/doctors/${digits}`;
}

export async function uploadFile(
  file: File,
  folder = "find-near-doctor/dev"
): Promise<UploadResult> {
  const config = getCloudinaryConfig();

  if (!config) {
    if (process.env["UPLOAD_DEV_MODE"] === "true") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mime = file.type || "application/octet-stream";
      return {
        url: `data:${mime};base64,${base64}`,
        publicId: `dev-${Date.now()}`,
        mimeType: mime,
        fileName: file.name,
      };
    }
    throw new Error(
      "Cloudinary not configured. Set CLOUDINARY_* env vars or UPLOAD_DEV_MODE=true for local testing."
    );
  }

  if ("url" in config) {
    cloudinary.config({ url: config.url });
  } else {
    cloudinary.config(config);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: file.type,
      fileName: file.name,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("invalid signature")) {
      throw new Error(
        "Cloudinary credentials are invalid. In cloudinary.com → Dashboard, copy a fresh API Key + API Secret into .env.local and restart npm run dev."
      );
    }
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
}
