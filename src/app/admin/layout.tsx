import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth/config";
import { db } from "~/server/db";
import { AdminSidebar } from "~/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const isAdmin = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: "blackdog-admin",
      },
    },
  });

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={{ name: session.user.name, email: session.user.email }} />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
