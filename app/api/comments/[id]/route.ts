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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()

    // Validate input
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    await dbConnect()

    // Find comment
    const comment = await Comment.findById(id)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user is the comment author
    if (comment.userId.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update comment
    comment.text = text
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
      updatedAt: comment.updatedAt,
      user: {
        _id: comment.userId._id,
        name: comment.userId.name,
        profilePhotoUrl: comment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
      },
      userId: undefined,
      blogId: undefined,
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find comment
    const comment = await Comment.findById(id)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user is the comment author or an admin
    if (comment.userId.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete comment
    await Comment.findByIdAndDelete(id)

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
