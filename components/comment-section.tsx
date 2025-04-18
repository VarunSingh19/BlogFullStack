"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

interface Comment {
  _id: string
  text: string
  createdAt: string
  user: {
    _id: string
    name: string
    profilePhotoUrl: string
  }
}

interface CommentSectionProps {
  blogId: string
  comments: Comment[]
}

export function CommentSection({ blogId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId,
          text: newComment,
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: editText,
        }),
      })

      if (response.ok) {
        const updatedComment = await response.json()
        setComments(comments.map((comment) => (comment._id === commentId ? updatedComment : comment)))
        setEditingComment(null)
      }
    } catch (error) {
      console.error("Error updating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment._id)
    setEditText(comment.text)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      {session ? (
        <div className="mb-8">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      ) : (
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">Please sign in to leave a comment.</p>
          <Button onClick={() => router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))}>
            Sign In
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.profilePhotoUrl || "/placeholder.svg"} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{comment.user.name}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</div>
                      </div>

                      {(session?.user.id === comment.user._id || session?.user.role === "admin") && (
                        <div className="flex gap-2">
                          {session?.user.id === comment.user._id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(comment)}
                              disabled={editingComment === comment._id}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(comment._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {editingComment === comment._id ? (
                      <div className="mt-2">
                        <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="mb-2" />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                            disabled={isSubmitting || !editText.trim()}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2">{comment.text}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
