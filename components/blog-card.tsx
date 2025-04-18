"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MessageSquare, Headphones, FileText, Bookmark, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface BlogCardProps {
  blog: {
    _id: string
    title: string
    summary: string
    tags: string[]
    createdAt: string
    author: {
      name: string
      profilePhotoUrl: string
    }
    commentCount: number
    hasPaidPdf: boolean
    hasAudio: boolean
  }
}

export function BlogCard({ blog }: BlogCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Implement share functionality
    alert(`Sharing article: ${blog.title}`)
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Link href={`/blogs/${blog._id}`}>
        <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors duration-200">
          <CardHeader className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={blog.author.profilePhotoUrl || "/placeholder.svg"} alt={blog.author.name} />
                <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">{blog.author.name}</div>
            </div>
            <h3 className="font-bold text-xl line-clamp-2 hover:text-primary transition-colors">{blog.title}</h3>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{blog.summary}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{blog.commentCount}</span>
              </div>
              {blog.hasAudio && (
                <div className="text-xs text-muted-foreground">
                  <Headphones className="h-3 w-3" />
                </div>
              )}
              {blog.hasPaidPdf && (
                <div className="text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSave}
                aria-label={isSaved ? "Unsave article" : "Save article"}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare} aria-label="Share article">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
