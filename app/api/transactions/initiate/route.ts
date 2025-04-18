import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Transaction, PDF, Blog } from "@/lib/db/models"
import { createPaymentOrder } from "@/lib/payment"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Helper function to get user from JWT token
async function getUserFromToken() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string; role: string }
    return { id: decoded.userId, role: decoded.role }
  } catch (error) {
    return null
  }
}

export async function POST(request: Request) {
  try {
    // Get user from token
    const user = await getUserFromToken()

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pdfId, blogId } = await request.json()

    // Validate input
    if (!pdfId || !blogId) {
      return NextResponse.json({ error: "PDF ID and Blog ID are required" }, { status: 400 })
    }

    await dbConnect()

    // Get PDF details
    const pdf = await PDF.findById(pdfId)
    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    // Get blog details
    const blog = await Blog.findById(blogId)
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Check if PDF is paid
    if (!pdf.isPaid) {
      return NextResponse.json({ error: "This PDF is not a paid resource" }, { status: 400 })
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: user.id,
      pdfId: pdf._id,
      blogId: blog._id,
      amount: pdf.price,
      paymentStatus: "Pending",
      paymentMethod: "Razorpay",
    })

    await transaction.save()

    // Create Razorpay order
    const orderResult = await createPaymentOrder({
      amount: pdf.price,
      currency: "USD",
      receipt: transaction._id.toString(),
      notes: {
        transactionId: transaction._id.toString(),
        userId: user.id,
        blogId: blog._id.toString(),
        pdfId: pdf._id.toString(),
      },
    })

    if (!orderResult.success) {
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
    }

    // Return order details
    return NextResponse.json({
      orderId: orderResult.order.id,
      amount: orderResult.order.amount / 100, // Convert back to dollars
      currency: orderResult.order.currency,
      transactionId: transaction._id,
      key: process.env.RAZORPAY_KEY_ID,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/checkout?orderId=${orderResult.order.id}&transactionId=${transaction._id}`,
    })
  } catch (error) {
    console.error("Error initiating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
