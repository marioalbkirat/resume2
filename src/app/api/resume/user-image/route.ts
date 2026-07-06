import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const safeExtension = (name: string, type: string) => {
  const extension = path.extname(name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(extension)) return extension;
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json({ error: "A valid image file is required." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "user-resumes");
  await mkdir(uploadDir, { recursive: true });
  const filename = `resume-image-${Date.now()}-${crypto.randomUUID()}${safeExtension(image.name, image.type)}`;
  await writeFile(path.join(uploadDir, filename), Buffer.from(await image.arrayBuffer()));
  return NextResponse.json({ path: `/user-resumes/${filename}` });
}
