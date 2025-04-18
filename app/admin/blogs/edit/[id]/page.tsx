import { BlogEditor } from "@/components/blog-editor"
import { AdminHeader } from "@/components/admin-header"
import { getBlogById } from "@/lib/data/blog"
import { redirect, notFound } from "next/navigation"

interface EditBlogPageProps {
  params: {
    id: string
  }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  // In a real implementation, you would check if the user is an admin
  // For now, we'll use a placeholder check
  const isAdmin = true

  if (!isAdmin) {
    redirect("/auth/login")
  }

  const blog = await getBlogById(params.id)

  if (!blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container py-8">
        <BlogEditor initialData={blog} isEditing={true} />
      </main>
    </div>
  )
}
