"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase } from "lucide-react";
import { cn } from "~/lib/utils";
import { SignOutButton } from "~/components/auth/sign-out-button";

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/clients", label: "Clients", icon: Briefcase },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b h-16 flex items-center">
          <Link href="/admin" className="flex items-center gap-2">
             <h1 className="font-bold text-xl text-gray-900 tracking-tight">Retriever AI</h1>
             <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t bg-gray-50">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
                    {user.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium truncate text-gray-900">{user.name}</p>
                    <div className="flex items-center justify-between">
                         <p className="text-xs text-gray-500 truncate max-w-[80px]">{user.email}</p>
                         <SignOutButton />
                    </div>
                </div>
             </div>
        </div>
      </aside>
  );
}

