import AdminTopbar from "@/features/admin/components/AdminTopbar";
import AdminCompanyPagesManager from "@/features/admin/components/AdminCompanyPagesManager";

export const metadata = {
  title: "Company Pages | Couponchy Admin",
};

export default function AdminCompanyPagesPage() {
  return (
    <div>
      <AdminTopbar title="Company Pages" breadcrumbTrail={["Admin", "Company Pages"]} />
      <main className="p-4 sm:p-6 lg:p-8">
        <AdminCompanyPagesManager />
      </main>
    </div>
  );
}
