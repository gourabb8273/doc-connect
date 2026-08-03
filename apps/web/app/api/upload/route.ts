import { NextResponse } from "next/server";
import { getDoctorSession, getAdminSession } from "@/lib/auth/session";
import { uploadFile, doctorUploadFolder } from "@/lib/storage/upload";

export async function POST(request: Request) {
  const [doctorSession, adminSession] = await Promise.all([
    getDoctorSession(),
    getAdminSession(),
  ]);

  if (!doctorSession && !adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `File must be under ${maxMb}MB` }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (file.type && !allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, PDF allowed" }, { status: 400 });
    }

    const folderField = form.get("folder");
    const folder =
      typeof folderField === "string" && folderField.startsWith("find-near-doctor/")
        ? folderField
        : doctorSession
          ? doctorUploadFolder(doctorSession.phone)
          : "find-near-doctor/dev/admin";

    const result = await uploadFile(file, folder);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
