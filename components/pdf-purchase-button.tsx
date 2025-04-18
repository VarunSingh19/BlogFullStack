"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Script from "next/script"

interface PDFPurchaseButtonProps {
  blogId: string
  pdfId: string
  price: number
}

export function PDFPurchaseButton({ blogId, pdfId, price }: PDFPurchaseButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const handlePurchase = async () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.href))
      return
    }

    setIsLoading(true)

    try {
      // Initiate transaction
      const response = await fetch("/api/transactions/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfId,
          blogId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to initiate transaction")
      }

      const { orderId, amount, currency, key, transactionId } = await response.json()

      // Check if Razorpay is loaded
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page and try again.")
      }

      // Open Razorpay checkout
      const options = {
        key,
        amount: amount * 100, // Convert to smallest currency unit
        currency,
        name: "BlogHub",
        description: "Premium PDF Purchase",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/transactions/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                transactionId,
              }),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            const { redirectUrl } = await verifyResponse.json()

            // Show success message
            toast({
              title: "Purchase Successful",
              description: "Your PDF is now available for download.",
            })

            // Redirect to PDF download page
            router.push(redirectUrl)
          } catch (error) {
            console.error("Payment verification error:", error)
            toast({
              title: "Payment Error",
              description: "There was an error verifying your payment. Please contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#000000",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Error initiating transaction:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayLoaded(true)} />
      <Button onClick={handlePurchase} disabled={isLoading} className="flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Download PDF (${price.toFixed(2)})
          </>
        )}
      </Button>
    </>
  )
}
