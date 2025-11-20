import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth/config";
import { db } from "~/server/db";
import Link from "next/link";
import { SignOutButton } from "~/components/auth/sign-out-button";

export default async function DashboardLayout({
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
  
  // Fetch user's organizations to display name
  // We fallback to DB call if api.listOrganizations isn't easily available on server side
  // or just for reliability.
  const memberships = await db.member.findMany({
    where: { userId: session.user.id },
    include: { organization: true }
  });

  const activeOrgId = session.session.activeOrganizationId;
  const activeOrg = memberships.find(m => m.organizationId === activeOrgId)?.organization || memberships[0]?.organization;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b h-16 flex items-center">
          <div>
             <h1 className="font-bold text-xl tracking-tight">Retriever AI</h1>
             {activeOrg && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{activeOrg.name}</p>}
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            Home
          </Link>
          <Link href="/dashboard/weather" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            Weather & Demand
          </Link>
          <Link href="/dashboard/competitors" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            Competitors
          </Link>
        </nav>
        <div className="p-4 border-t bg-gray-50">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                    {session.user.name?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium truncate text-gray-900">{session.user.name}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate max-w-[80px]">{session.user.email}</p>
                        <SignOutButton />
                    </div>
                </div>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
