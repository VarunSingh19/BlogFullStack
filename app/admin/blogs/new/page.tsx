import { BlogEditor } from "@/components/blog-editor"
import { AdminHeader } from "@/components/admin-header"
import { redirect } from "next/navigation"

export default async function NewBlogPage() {
  // In a real implementation, you would check if the user is an admin
  // For now, we'll use a placeholder check
  const isAdmin = true

  if (!isAdmin) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container py-8">
        <BlogEditor />
      </main>
    </div>
  )
}
