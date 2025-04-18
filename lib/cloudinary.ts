import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export async function uploadImage(file: any, folder = "profile-photos") {
  try {
    // For server-side uploads (when we have a file path)
    if (typeof file === "string") {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto:good" }],
      })
      return { success: true, url: result.secure_url, publicId: result.public_id }
    }

    // For client-side uploads (when we have a base64 string)
    else if (file && file.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto:good" }],
      })
      return { success: true, url: result.secure_url, publicId: result.public_id }
    }

    throw new Error("Invalid file format")
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error)
    return { success: false, error }
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return { success: result.result === "ok", result }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    return { success: false, error }
  }
}

// Generate Cloudinary URL with transformations
export function getImageUrl(publicId: string, options = {}) {
  const defaultOptions = {
    width: 300,
    height: 300,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
  }

  const mergedOptions = { ...defaultOptions, ...options }

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: mergedOptions.width,
        height: mergedOptions.height,
        crop: mergedOptions.crop,
        gravity: mergedOptions.gravity,
        quality: mergedOptions.quality,
      },
    ],
  })
}
