import dbConnect from "@/lib/db/connect"
import { Comment, User } from "@/lib/db/models"
import { revalidatePath } from "next/cache"

export async function getCommentsByBlogId(blogId: string) {
  await dbConnect()

  const comments = await Comment.find({ blogId })
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      model: User,
      select: "name profilePhotoUrl",
    })
    .lean()

  return comments.map((comment) => ({
    ...comment,
    _id: comment._id.toString(),
    user: {
      _id: comment.userId._id.toString(),
      name: comment.userId.name,
      profilePhotoUrl: comment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
    },
    userId: undefined,
    blogId: undefined,
  }))
}

export async function createComment(commentData: any) {
  await dbConnect()

  const comment = new Comment(commentData)
  await comment.save()

  // Get the populated comment
  const populatedComment = await Comment.findById(comment._id)
    .populate({
      path: "userId",
      model: User,
      select: "name profilePhotoUrl",
    })
    .lean()

  // Revalidate the blog page
  revalidatePath(`/blogs/${commentData.blogId}`)

  return {
    ...populatedComment,
    _id: populatedComment._id.toString(),
    user: {
      _id: populatedComment.userId._id.toString(),
      name: populatedComment.userId.name,
      profilePhotoUrl: populatedComment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
    },
    userId: undefined,
    blogId: undefined,
  }
}

export async function updateComment(id: string, text: string) {
  await dbConnect()

  const comment = await Comment.findByIdAndUpdate(id, { text }, { new: true })
    .populate({
      path: "userId",
      model: User,
      select: "name profilePhotoUrl",
    })
    .lean()

  if (!comment) {
    return null
  }

  // Revalidate the blog page
  revalidatePath(`/blogs/${comment.blogId}`)

  return {
    ...comment,
    _id: comment._id.toString(),
    user: {
      _id: comment.userId._id.toString(),
      name: comment.userId.name,
      profilePhotoUrl: comment.userId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
    },
    userId: undefined,
    blogId: undefined,
  }
}

export async function deleteComment(id: string) {
  await dbConnect()

  const comment = await Comment.findById(id)

  if (!comment) {
    return null
  }

  const blogId = comment.blogId

  await Comment.findByIdAndDelete(id)

  // Revalidate the blog page
  revalidatePath(`/blogs/${blogId}`)

  return { success: true }
}
