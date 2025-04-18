import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Comment } from "@/lib/db/models"
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

    const { blogId, text } = await request.json()

    // Validate input
    if (!blogId || !text) {
      return NextResponse.json({ error: "Blog ID and text are required" }, { status: 400 })
    }

    await dbConnect()

    // Create comment
    const comment = new Comment({
      blogId,
      userId: user.id,
      text,
    })

    await comment.save()

    // Populate user information
    await comment.populate({
      path: "userId",
      select: "name profilePhotoUrl",
    })

    return NextResponse.json({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      user: {
        _id: comment.userId._id,
        name: comment.userId.name,
        profilePhotoUrl: comment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
      },
      userId: undefined,
      blogId: undefined,
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
