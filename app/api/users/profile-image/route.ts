import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { User } from "@/lib/db/models"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Helper function to get user from JWT token
async function getUserFromToken() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string; role: string }
    return { id: decoded.userId, role: decoded.role }
  } catch (error) {
    return null
  }
}

export async function POST(request: Request) {
  try {
    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get image data from request
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    await dbConnect()

    // Find user
    const userDoc = await User.findById(user.id)

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user already has a profile photo, delete it from Cloudinary
    if (userDoc.profilePhotoPublicId) {
      await deleteImage(userDoc.profilePhotoPublicId)
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadImage(imageData, "profile-photos")

    if (!uploadResult.success) {
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }

    // Update user with new profile photo URL and public ID
    userDoc.profilePhotoUrl = uploadResult.url
    userDoc.profilePhotoPublicId = uploadResult.publicId
    await userDoc.save()

    return NextResponse.json({
      message: "Profile photo updated successfully",
      profilePhotoUrl: uploadResult.url,
    })
  } catch (error) {
    console.error("Error updating profile photo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find user
    const userDoc = await User.findById(user.id)

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user has a profile photo, delete it from Cloudinary
    if (userDoc.profilePhotoPublicId) {
      await deleteImage(userDoc.profilePhotoPublicId)
    }

    // Update user to remove profile photo
    userDoc.profilePhotoUrl = ""
    userDoc.profilePhotoPublicId = ""
    await userDoc.save()

    return NextResponse.json({
      message: "Profile photo removed successfully",
    })
  } catch (error) {
    console.error("Error removing profile photo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
