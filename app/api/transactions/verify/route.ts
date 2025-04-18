import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Transaction } from "@/lib/db/models"
import { verifyPaymentSignature, checkPaymentStatus } from "@/lib/payment"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { orderId, paymentId, signature, transactionId } = await request.json()

    // Validate input
    if (!orderId || !paymentId || !signature || !transactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify payment signature
    const verificationResult = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    })

    if (!verificationResult.success) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Double-check payment status directly with Razorpay
    const statusCheck = await checkPaymentStatus(paymentId)
    if (!statusCheck.success || !statusCheck.isPaymentSuccessful) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    await dbConnect()

    // Update transaction status
    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email")
      .populate("blogId", "title")
      .exec()

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    transaction.paymentStatus = "Paid"
    transaction.receiptUrl = `https://dashboard.razorpay.com/app/payments/${paymentId}`
    await transaction.save()

    // Send confirmation email
    await sendEmail({
      to: transaction.userId.email,
      template: "purchaseConfirmation",
      data: {
        userName: transaction.userId.name,
        blogTitle: transaction.blogId.title,
        amount: transaction.amount,
        receiptUrl: transaction.receiptUrl,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      redirectUrl: `/blogs/${transaction.blogId}/pdf?transactionId=${transaction._id}`,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
