import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Comment, User } from "@/lib/db/models"

export async function GET(request: Request, { params }: { params: { blogId: string } }) {
  try {
    const blogId = params.blogId

    await dbConnect()

    const comments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: User,
        select: "name profilePhotoUrl",
      })
      .lean()

    // Format the response
    const formattedComments = comments.map((comment) => ({
      _id: comment._id.toString(),
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        _id: comment.userId._id.toString(),
        name: comment.userId.name,
        profilePhotoUrl: comment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
      },
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
