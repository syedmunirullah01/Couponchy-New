import AdminTopbar from "@/features/admin/components/AdminTopbar";
import AdminBlogsManager from "@/features/admin/components/AdminBlogsManager";

export const metadata = {
  title: "Blog Posts | Couponchy Admin",
};

export default function AdminBlogsPage() {
  return (
    <div>
      <AdminTopbar title="Blog Posts" breadcrumbTrail={["Admin", "Blog Posts"]} />
      <main className="p-4 sm:p-6 lg:p-8">
        <AdminBlogsManager />
      </main>
    </div>
  );
}
