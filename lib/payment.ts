import Razorpay from "razorpay"
import crypto from "crypto"

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create a new payment order
export async function createPaymentOrder({
  amount,
  currency = "USD",
  receipt,
  notes = {},
}: {
  amount: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}) {
  try {
    // Amount should be in smallest currency unit (cents for USD)
    const amountInSmallestUnit = Math.round(amount * 100)

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency,
      receipt,
      notes,
    })

    return { success: true, order }
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return { success: false, error }
  }
}

// Verify payment signature
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}) {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    const isValid = expectedSignature === signature

    return { success: isValid }
  } catch (error) {
    console.error("Error verifying payment signature:", error)
    return { success: false, error }
  }
}

// Process webhook event (NOT USED)
export async function processWebhookEvent(payload: any, signature: string) {
  return { success: false, error: "Webhooks are not used in this implementation" }
}

// Replace it with a function to check payment status directly
export async function checkPaymentStatus(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)

    // Check if payment is captured/authorized
    const isSuccessful = payment.status === "captured" || payment.status === "authorized"

    return {
      success: true,
      isPaymentSuccessful: isSuccessful,
      payment,
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return { success: false, error }
  }
}

// Get payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return { success: true, payment }
  } catch (error) {
    console.error("Error fetching payment details:", error)
    return { success: false, error }
  }
}
