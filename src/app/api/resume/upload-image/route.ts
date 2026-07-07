import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const SAFE_FILENAME_PATTERN = /[^a-zA-Z0-9._-]/g;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image");

        if (!(image instanceof File) || image.size === 0) {
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        if (image.size > MAX_IMAGE_SIZE_BYTES) {
            return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "user-resumes");
        await mkdir(uploadDir, { recursive: true });

        const extension = path.extname(image.name) || `.${image.type.split("/")[1] || "png"}`;
        const baseName = path.basename(image.name, extension).replace(SAFE_FILENAME_PATTERN, "-") || "resume-image";
        const filename = `${Date.now()}-${baseName}${extension.toLowerCase()}`;
        const destination = path.join(uploadDir, filename);

        await writeFile(destination, Buffer.from(await image.arrayBuffer()));

        return NextResponse.json({ path: `/user-resumes/${filename}` }, { status: 201 });
    } catch (error) {
        console.error("Failed to upload resume image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
