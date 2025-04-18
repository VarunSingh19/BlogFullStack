import dbConnect from "@/lib/db/connect"
import { Transaction, User, Blog } from "@/lib/db/models"

export async function getAllTransactions() {
  await dbConnect()

  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      model: User,
      select: "name email",
    })
    .populate({
      path: "blogId",
      model: Blog,
      select: "title",
    })
    .lean()

  return transactions.map((transaction) => ({
    ...transaction,
    _id: transaction._id.toString(),
    user: {
      name: transaction.userId.name,
      email: transaction.userId.email,
    },
    blog: {
      title: transaction.blogId.title,
    },
    userId: undefined,
    blogId: undefined,
    pdfId: undefined,
  }))
}

export async function getUserTransactions(userId: string) {
  await dbConnect()

  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "blogId",
      model: Blog,
      select: "title",
    })
    .lean()

  return transactions.map((transaction) => ({
    ...transaction,
    _id: transaction._id.toString(),
    blog: {
      title: transaction.blogId.title,
    },
    blogId: undefined,
    pdfId: undefined,
  }))
}

export async function createTransaction(transactionData: any) {
  await dbConnect()

  const transaction = new Transaction(transactionData)
  await transaction.save()

  return transaction
}

export async function updateTransactionStatus(id: string, status: string, receiptUrl?: string) {
  await dbConnect()

  const updateData: any = { paymentStatus: status }
  if (receiptUrl) {
    updateData.receiptUrl = receiptUrl
  }

  const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true })

  return transaction
}
