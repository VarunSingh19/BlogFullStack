import dbConnect from "@/lib/db/connect"
import { Blog, Transaction, User, PDF } from "@/lib/db/models"

export async function getAdminAnalytics() {
  await dbConnect()

  // Get total revenue
  const totalRevenueResult = await Transaction.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ])

  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0

  // Get monthly revenue data for the past 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyRevenue = await Transaction.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const revenueData = monthlyRevenue.map((item) => ({
    month: months[item._id.month - 1],
    revenue: item.revenue,
  }))

  // Get top PDFs by downloads and revenue
  const topPDFs = await Transaction.aggregate([
    { $match: { paymentStatus: "Paid" } },
    {
      $group: {
        _id: "$pdfId",
        downloads: { $sum: 1 },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { downloads: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "pdfs",
        localField: "_id",
        foreignField: "_id",
        as: "pdf",
      },
    },
    {
      $unwind: "$pdf",
    },
    {
      $lookup: {
        from: "blogs",
        localField: "pdf.blogId",
        foreignField: "_id",
        as: "blog",
      },
    },
    {
      $unwind: "$blog",
    },
    {
      $project: {
        _id: 1,
        title: "$blog.title",
        downloads: 1,
        revenue: 1,
      },
    },
  ])

  // Get paid vs free PDF ratio
  const pdfCounts = await PDF.aggregate([
    {
      $group: {
        _id: "$isPaid",
        count: { $sum: 1 },
      },
    },
  ])

  const paidVsFree = pdfCounts.map((item) => ({
    name: item._id ? "Paid" : "Free",
    value: item.count,
  }))

  // Get total counts and growth
  const totalBlogs = await Blog.countDocuments()
  const totalDownloads = await Transaction.countDocuments({ paymentStatus: "Paid" })
  const activeUsers = await User.countDocuments()

  // Mock growth percentages (in a real app, you'd calculate these)
  const revenueGrowth = 12.5
  const blogGrowth = 8.3
  const downloadGrowth = 15.7
  const userGrowth = 5.2

  return {
    totalRevenue,
    revenueGrowth,
    totalBlogs,
    blogGrowth,
    totalDownloads,
    downloadGrowth,
    activeUsers,
    userGrowth,
    revenueData,
    topPDFs,
    paidVsFree,
  }
}
