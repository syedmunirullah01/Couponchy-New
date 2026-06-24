import { NextResponse } from "next/server";
import { getBlogById, updateBlog, deleteBlog } from "@/server/repositories/blogs-repository";
import { requirePermission } from "@/server/auth";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const blog = await getBlogById(resolvedParams.id);
    if (!blog) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }
    return NextResponse.json({ data: blog });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to fetch blog post." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const access = await requirePermission("blogs");
  if (access.error) {
    return access.error;
  }

  try {
    const resolvedParams = await params;
    const payload = await request.json();
    
    // Basic validation
    if (!payload.title || !payload.title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!payload.slug || !payload.slug.trim()) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }
    if (!payload.category || !payload.category.trim()) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }

    const blog = await updateBlog(resolvedParams.id, payload);
    if (!blog) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }
    return NextResponse.json({ data: blog });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update blog post." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const access = await requirePermission("blogs");
  if (access.error) {
    return access.error;
  }

  try {
    const resolvedParams = await params;
    const success = await deleteBlog(resolvedParams.id);
    if (!success) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Blog post deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to delete blog post." }, { status: 400 });
  }
}
