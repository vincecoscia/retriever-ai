import { headers } from "next/headers";
import { auth } from "~/server/better-auth/config"; // Adjusted path based on your folder structure
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) redirect('/sign-in');

  const organizations = await db.organization.findMany({
    include: {
      companies: true,
      _count: {
        select: { members: true }
      },
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Hub</h1>
          <p className="text-muted-foreground">Manage Data Pipeline & Clients</p>
        </div>
        <Link href="/admin/onboarding">
          <Button>+ Onboard New Client</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Link key={org.id} href={`/admin/org/${org.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  {org.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Brands: {org.companies.length}</p>
                  <p>Users: {org._count.members}</p>
                  <p className="text-xs text-gray-400 mt-2">ID: {org.id}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}