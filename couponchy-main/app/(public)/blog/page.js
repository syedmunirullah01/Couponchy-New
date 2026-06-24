import { getMetadataDefaults } from "@/server/services/settings-service";
import { getAllBlogs } from "@/server/repositories/blogs-repository";
import BlogClientPage from "./BlogClientPage";

export async function generateMetadata() {
  return getMetadataDefaults("Smart Saving Insights | Blog");
}

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let blogs = [];
  try {
    blogs = await getAllBlogs();
  } catch (error) {
    console.error("Error loading blogs from database:", error);
  }
  return <BlogClientPage initialBlogs={blogs} />;
}
