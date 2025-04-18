import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminAnalytics } from "@/components/admin-analytics"
import { AdminBlogList } from "@/components/admin-blog-list"
import { AdminTransactions } from "@/components/admin-transactions"
import { getAdminAnalytics } from "@/lib/data/admin"
import { getAllBlogs } from "@/lib/data/blog"
import { getAllTransactions } from "@/lib/data/transaction"

export default async function AdminDashboard() {
  const analytics = await getAdminAnalytics()
  const blogs = await getAllBlogs()
  const transactions = await getAllTransactions()

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+{analytics.revenueGrowth}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBlogs}</div>
              <p className="text-xs text-muted-foreground">+{analytics.blogGrowth}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDF Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">+{analytics.downloadGrowth}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">+{analytics.userGrowth}% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalytics analytics={analytics} />
          </TabsContent>

          <TabsContent value="blogs" className="space-y-4">
            <AdminBlogList blogs={blogs} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <AdminTransactions transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
