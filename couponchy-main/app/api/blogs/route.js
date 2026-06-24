import { NextResponse } from "next/server";
import { getAllBlogs, createBlog } from "@/server/repositories/blogs-repository";
import { requirePermission } from "@/server/auth";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({ data: blogs });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to fetch blogs." }, { status: 500 });
  }
}

export async function POST(request) {
  const access = await requirePermission("blogs");
  if (access.error) {
    return access.error;
  }

  try {
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

    const blog = await createBlog(payload);
    return NextResponse.json({ data: blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to create blog post." }, { status: 400 });
  }
}
