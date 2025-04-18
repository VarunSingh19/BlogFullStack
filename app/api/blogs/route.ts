import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Blog, User } from "@/lib/db/models";
import { generateAISummary } from "@/lib/ai";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper function to get user from JWT token
async function getUserFromToken() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { userId: string; role: string };
    return { id: decoded.userId, role: decoded.role };
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const tags = searchParams.get("tags")?.split(",");
    const author = searchParams.get("author");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    await dbConnect();

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (author) {
      const authorUser = await User.findOne({
        name: { $regex: author, $options: "i" },
      });
      if (authorUser) {
        query.authorId = authorUser._id;
      }
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Get blogs
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "authorId",
        model: User,
        select: "name profilePhotoUrl",
      })
      .lean();

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get user from token
    const user = await getUserFromToken();

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, tags } = await request.json();

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate AI summary
    let summary = "";
    try {
      summary = await generateAISummary(content);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      summary = "Summary not available.";
    }

    // Generate TTS audio (in a real implementation)
    const audioUrl = ""; // This would be implemented with actual TTS service

    // Create blog
    const blog = new Blog({
      title,
      content,
      authorId: user.id,
      tags: tags || [],
      summary,
      audioUrl,
    });

    await blog.save();

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
