// lib/db/models.ts
import mongoose, { Schema, model, Model } from "mongoose";

// Define interfaces for your schemas
interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  profilePhotoUrl: string;
  profilePhotoPublicId: string;
  role: "admin" | "user";
}

// USER
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profilePhotoUrl: { type: String, default: "" },
    profilePhotoPublicId: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

// BLOG
const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [String],
    summary: { type: String, default: "" },
    audioUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// PDF
const PDFSchema = new Schema(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    url: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: null },
  },
  { timestamps: true }
);

// TRANSACTION
const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pdfId: { type: Schema.Types.ObjectId, ref: "PDF", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Failed", "Pending"],
      default: "Pending",
    },
    paymentMethod: { type: String },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// COMMENT
const CommentSchema = new Schema(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// SAVED BLOG & PDF
const SavedBlogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  },
  { timestamps: true }
);

const SavedPDFSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pdfId: { type: Schema.Types.ObjectId, ref: "PDF", required: true },
  },
  { timestamps: true }
);

// Define model getter functions to ensure models are only created once
export const getUser = (): Model<any> => {
  return mongoose.models.User || mongoose.model("User", UserSchema);
};

export const getBlog = (): Model<any> => {
  return mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
};

export const getPDF = (): Model<any> => {
  return mongoose.models.PDF || mongoose.model("PDF", PDFSchema);
};

export const getTransaction = (): Model<any> => {
  return (
    mongoose.models.Transaction ||
    mongoose.model("Transaction", TransactionSchema)
  );
};

export const getComment = (): Model<any> => {
  return mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
};

export const getSavedBlog = (): Model<any> => {
  return (
    mongoose.models.SavedBlog || mongoose.model("SavedBlog", SavedBlogSchema)
  );
};

export const getSavedPDF = (): Model<any> => {
  return mongoose.models.SavedPDF || mongoose.model("SavedPDF", SavedPDFSchema);
};

// Remove all the direct exports - THEY ARE CAUSING THE ERROR
// at the very bottom of lib/db/models.ts
export const User = getUser();
export const Blog = getBlog();
export const PDF = getPDF();
export const Transaction = getTransaction();
export const Comment = getComment();
export const SavedBlog = getSavedBlog();
export const SavedPDF = getSavedPDF();
