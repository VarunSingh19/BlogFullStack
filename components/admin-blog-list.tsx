"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { MoreHorizontal, Edit, Trash2, FileText } from "lucide-react"

interface AdminBlogListProps {
  blogs: {
    _id: string
    title: string
    tags: string[]
    createdAt: string
    author: {
      name: string
    }
    commentCount: number
    hasPaidPdf: boolean
  }[]
}

export function AdminBlogList({ blogs: initialBlogs }: AdminBlogListProps) {
  const router = useRouter()
  const [blogs, setBlogs] = useState(initialBlogs)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    setIsDeleting(id)

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBlogs(blogs.filter((blog) => blog._id !== id))
      } else {
        alert("Failed to delete blog. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      alert("Failed to delete blog. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Blogs</h2>
        <Button onClick={() => router.push("/admin/blogs/new")}>Add New Blog</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog._id}>
              <TableCell className="font-medium">
                <Link href={`/blogs/${blog._id}`} className="hover:underline">
                  {blog.title}
                </Link>
              </TableCell>
              <TableCell>{blog.author.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {blog.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{blog.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(blog.createdAt)}</TableCell>
              <TableCell>{blog.commentCount}</TableCell>
              <TableCell>
                {blog.hasPaidPdf ? (
                  <Badge variant="default" className="bg-green-500">
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="outline">None</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/admin/blogs/edit/${blog._id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/admin/pdfs/manage/${blog._id}`)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Manage PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(blog._id)}
                      disabled={isDeleting === blog._id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === blog._id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {blogs.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No blogs found. Create your first blog!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
