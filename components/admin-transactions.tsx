"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface AdminTransactionsProps {
  transactions: {
    _id: string
    amount: number
    paymentStatus: "Paid" | "Failed" | "Pending"
    paymentMethod: string
    createdAt: string
    receiptUrl: string | null
    user: {
      name: string
      email: string
    }
    blog: {
      title: string
    }
  }[]
}

export function AdminTransactions({ transactions }: AdminTransactionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500"
      case "Failed":
        return "bg-red-500"
      case "Pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Blog</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>
                <div>
                  <div className="font-medium">{transaction.user.name}</div>
                  <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                </div>
              </TableCell>
              <TableCell>{transaction.blog.title}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(transaction.paymentStatus)}>{transaction.paymentStatus}</Badge>
              </TableCell>
              <TableCell>{transaction.paymentMethod}</TableCell>
              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
              <TableCell>
                {transaction.receiptUrl ? (
                  <a
                    href={transaction.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}

          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
