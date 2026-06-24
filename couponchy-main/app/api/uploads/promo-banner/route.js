import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/server/cloudinary";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // Banners can be up to 4MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = String(formData.get("slug") || "promo-banner");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Promo banner image file is required." }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Promo banner image must be PNG, JPG, WEBP, or SVG." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Promo banner image must be 4MB or smaller." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadImageBuffer(buffer, {
      folder: "couponchy/banners",
      public_id: slug,
      overwrite: true,
      resource_type: "image",
    });

    return NextResponse.json({
      data: {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to upload banner image." }, { status: 500 });
  }
}
