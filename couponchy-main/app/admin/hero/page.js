import AdminTopbar from "@/features/admin/components/AdminTopbar";
import AdminHeroManager from "@/features/admin/components/AdminHeroManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = {
  title: "Hero | Couponchy Admin",
};

export default function AdminHeroPage() {
  return (
    <div>
      <AdminTopbar title="Hero" breadcrumbTrail={["Admin", "Hero"]} />
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Hero Management</CardTitle>
            <CardDescription>Control homepage hero copy and right-side slide campaigns from a dedicated section.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <p className="text-sm text-[var(--muted)]">
              Update only the homepage hero from here.
            </p>
          </CardContent>
        </Card>
        <AdminHeroManager />
      </main>
    </div>
  );
}
