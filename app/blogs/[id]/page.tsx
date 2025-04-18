import { getBlogById } from "@/lib/data/blog"
import { getCommentsByBlogId } from "@/lib/data/comment"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon } from "lucide-react"
import { CommentSection } from "@/components/comment-section"
import { PDFPurchaseButton } from "@/components/pdf-purchase-button"
import { AudioPlayer } from "@/components/audio-player"
import { notFound } from "next/navigation"

export default async function BlogPage({ params }: { params: { id: string } }) {
  const blog = await getBlogById(params.id)

  if (!blog) {
    notFound()
  }

  const comments = await getCommentsByBlogId(params.id)

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <article className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={blog.author.profilePhotoUrl || "/placeholder.svg"} alt={blog.author.name} />
                <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{blog.author.name}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-4">{blog.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {blog.summary && (
              <Card className="p-4 mb-6 bg-muted/50">
                <p className="text-sm italic">{blog.summary}</p>
              </Card>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              {blog.audioUrl && <AudioPlayer audioUrl={blog.audioUrl} />}

              {blog.hasPaidPdf && <PDFPurchaseButton blogId={blog._id} pdfId={blog.pdfId} price={blog.pdfPrice} />}
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

          <Separator className="my-8" />

          <CommentSection blogId={blog._id} comments={comments} />
        </article>
      </main>
    </div>
  )
}
