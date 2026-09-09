import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload an image (Buffer, Base64 data URI, or URL) to Cloudinary.
 * Returns the secure HTTPS URL.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "psht_smkndu"
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials belum lengkap di .env.local (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)."
    );
  }

  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Gagal mengupload ke Cloudinary"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(file);
    } else {
      cloudinary.uploader.upload(
        file,
        {
          folder,
          resource_type: "auto",
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(error || new Error("Gagal mengupload ke Cloudinary"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
    }
  });
}
