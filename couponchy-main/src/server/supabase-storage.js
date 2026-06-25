import "server-only";
import { supabase } from "@/lib/supabase";

function getExtensionFromMimeType(mimeType) {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    default:
      return "";
  }
}

/**
 * Uploads an image buffer to Supabase Storage.
 * Drops in as a replacement for Cloudinary's uploadImageBuffer.
 * 
 * @param {Buffer} buffer - The file buffer to upload
 * @param {Object} options - Options containing folder, public_id, and contentType
 * @returns {Promise<Object>} - Object with secure_url and public_id (filePath)
 */
export async function uploadImageBuffer(buffer, options = {}) {
  // Ensure the public bucket "couponchy" exists
  const bucketName = "couponchy";
  
  // Clean folder path (e.g. "couponchy/stores" -> "stores")
  let cleanFolder = (options.folder || "uploads").replace(/^couponchy\/?/, "");
  
  // Resolve filename with proper extension
  let publicId = options.public_id || "image";
  const ext = getExtensionFromMimeType(options.contentType);
  if (ext && !publicId.endsWith(ext)) {
    publicId = `${publicId}${ext}`;
  }
  
  const filePath = `${cleanFolder}/${publicId}`.replace(/\/+/g, "/");

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: options.contentType || "image/png",
      upsert: true,
    });

  if (error) {
    // If the bucket doesn't exist, we'll try to create it and upload again
    if (error.message?.includes("Bucket not found")) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createBucketError) {
        throw new Error(`Failed to create Supabase storage bucket: ${createBucketError.message}`);
      }

      // Retry upload
      const { data: retryData, error: retryError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: options.contentType || "image/png",
          upsert: true,
        });

      if (retryError) {
        throw new Error(`Upload failed after creating bucket: ${retryError.message}`);
      }
    } else {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
  }

  // Get the public URL of the uploaded object
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    public_id: filePath,
    secure_url: urlData.publicUrl,
  };
}
