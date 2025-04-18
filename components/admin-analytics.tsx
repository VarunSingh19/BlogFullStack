"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AdminAnalyticsProps {
  analytics: {
    totalRevenue: number
    revenueGrowth: number
    totalBlogs: number
    blogGrowth: number
    totalDownloads: number
    downloadGrowth: number
    activeUsers: number
    userGrowth: number
    revenueData: {
      month: string
      revenue: number
    }[]
    topPDFs: {
      title: string
      downloads: number
      revenue: number
    }[]
    paidVsFree: {
      name: string
      value: number
    }[]
  }
}

export function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics.revenueData}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, "Revenue"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top PDFs</CardTitle>
          <CardDescription>Most downloaded and highest revenue PDFs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.topPDFs}>
              <XAxis dataKey="title" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `$${value}` : value,
                  name === "revenue" ? "Revenue" : "Downloads",
                ]}
                labelFormatter={(label) => `PDF: ${label}\`}  : "Downloads",
                ]}
                labelFormatter={(label) => \`PDF: ${label}`}
              />
              <Bar dataKey="downloads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
