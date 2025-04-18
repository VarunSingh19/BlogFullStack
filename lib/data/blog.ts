// lib/data/blog.ts
import dbConnect from "@/lib/db/connect";
import { getBlog, getUser, getComment, getPDF } from "@/lib/db/models";

export async function getAllBlogs(filters: Record<string, any> = {}) {
  await dbConnect();
  const Blog = getBlog();
  const User = getUser();
  const Comment = getComment();
  const PDF = getPDF();

  const query = { ...filters };

  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: "authorId",
      model: User,
      select: "name profilePhotoUrl",
    })
    .lean();

  const blogIds = blogs.map((b) => b._id);
  const commentCounts = await Comment.aggregate([
    { $match: { blogId: { $in: blogIds } } },
    { $group: { _id: "$blogId", count: { $sum: 1 } } },
  ]);

  const pdfInfo = await PDF.find({ blogId: { $in: blogIds } })
    .select("blogId isPaid")
    .lean();

  const commentMap = Object.fromEntries(
    commentCounts.map((c) => [c._id.toString(), c.count])
  );
  const pdfMap = Object.fromEntries(
    pdfInfo.map((p) => [p.blogId.toString(), { hasPaidPdf: p.isPaid }])
  );

  return blogs.map((blog) => {
    const id = blog._id.toString();
    return {
      ...blog,
      _id: id,
      author: {
        name: blog.authorId.name,
        profilePhotoUrl:
          blog.authorId.profilePhotoUrl ||
          "/placeholder.svg?height=32&width=32",
      },
      commentCount: commentMap[id] || 0,
      hasPaidPdf: pdfMap[id]?.hasPaidPdf || false,
      hasAudio: Boolean(blog.audioUrl),
    };
  });
}

export async function getBlogById(id: string) {
  await dbConnect();
  const Blog = getBlog();
  const User = getUser();
  const Comment = getComment();
  const PDF = getPDF();

  const blog = await Blog.findById(id)
    .populate({ path: "authorId", model: User, select: "name profilePhotoUrl" })
    .lean();
  if (!blog) return null;

  const commentCount = await Comment.countDocuments({ blogId: id });
  const pdf = await PDF.findOne({ blogId: id }).lean();

  return {
    ...blog,
    _id: blog._id.toString(),
    author: {
      name: blog.authorId.name,
      profilePhotoUrl:
        blog.authorId.profilePhotoUrl || "/placeholder.svg?height=32&width=32",
    },
    commentCount,
    hasPaidPdf: pdf?.isPaid || false,
    pdfId: pdf?._id.toString(),
    pdfPrice: pdf?.price,
  };
}

export async function createBlogData(blogData: any, userId: string) {
  await dbConnect();
  const Blog = getBlog();

  const blog = new Blog({ ...blogData, authorId: userId });
  await blog.save();
  return blog;
}

export async function updateBlogData(id: string, blogData: any) {
  await dbConnect();
  const Blog = getBlog();

  const updated = await Blog.findByIdAndUpdate(id, blogData, { new: true });
  return updated;
}

export async function deleteBlogData(id: string) {
  await dbConnect();
  const Blog = getBlog();

  await Blog.findByIdAndDelete(id);
  return { success: true };
}
