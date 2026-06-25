import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/server/supabase-storage";
import { requirePermission } from "@/server/auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for high-res blog covers
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request) {
  const access = await requirePermission("blogs");
  if (access.error) {
    return access.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = String(formData.get("slug") || "blog-cover");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Cover image must be PNG, JPG, or WEBP." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Cover image must be 5MB or smaller." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadImageBuffer(buffer, {
      folder: "couponchy/blogs",
      public_id: slug,
      contentType: file.type,
    });

    return NextResponse.json({
      data: {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to upload blog cover image." }, { status: 500 });
  }
}
