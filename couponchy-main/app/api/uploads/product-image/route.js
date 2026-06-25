import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/server/supabase-storage";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = String(formData.get("slug") || "product-image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Product image file is required." }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Product image must be PNG, JPG, WEBP, or SVG." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Product image must be 2MB or smaller." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadImageBuffer(buffer, {
      folder: "couponchy/products",
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
    return NextResponse.json({ error: error.message || "Unable to upload product image." }, { status: 500 });
  }
}
