import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">BlogHub Admin</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/admin/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/admin/blogs/new" className="text-sm font-medium transition-colors hover:text-primary">
              New Blog
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline">View Site</Button>
          </Link>
          <Link href="/api/auth/logout">
            <Button variant="ghost">Logout</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
