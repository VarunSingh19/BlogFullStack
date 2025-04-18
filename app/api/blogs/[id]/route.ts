import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Blog } from "@/lib/db/models"
import { generateAISummary } from "@/lib/ai"
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await dbConnect()

    const blog = await Blog.findById(id)
      .populate({
        path: "authorId",
        select: "name profilePhotoUrl",
      })
      .lean()

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    await dbConnect()

    // Find blog
    const blog = await Blog.findById(id)

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Check if content has changed significantly
    const contentChanged = content !== blog.content

    // Update blog
    blog.title = title
    blog.content = content
    blog.tags = tags || []

    // If content changed significantly, regenerate AI summary
    if (contentChanged) {
      try {
        blog.summary = await generateAISummary(content)
      } catch (error) {
        console.error("Error generating AI summary:", error)
        // Keep the existing summary if generation fails
      }
    }

    await blog.save()

    return NextResponse.json(blog)
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find and delete blog
    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
