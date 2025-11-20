import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 1. Protect /admin routes
  if (path.startsWith("/admin")) {
    const sessionToken = request.cookies.get("better-auth.session_token");
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // 2. Protect /dashboard routes (assuming dashboard lives here)
  // The user plan mentions src/app/(dashboard)/page.tsx so the route might be / or /dashboard depending on folder structure.
  // If (dashboard) is a route group, the path is just /. 
  // But usually dashboard is /dashboard.
  // I will assume explicit /dashboard path or check if (dashboard) affects URL.
  // Route groups (dashboard) do NOT affect URL. So /page.tsx in there is /.
  // But if there is also app/page.tsx, that conflicts.
  // The project structure has src/app/page.tsx.
  // So src/app/(dashboard)/page.tsx would be conflict if it's also root.
  // The plan says "Create src/app/(dashboard)/page.tsx".
  // I'll assume the user wants the dashboard at /dashboard, so I should probably rename the folder to `dashboard` OR keep it in a group but ensure paths don't conflict.
  // OR, `src/app/page.tsx` is the landing page, and `src/app/(dashboard)/dashboard/page.tsx`?
  // The user said "The Client Dashboard ... View: A table...".
  // "Client Auth: Allow users to log in and see an empty dashboard."
  // I'll assume the dashboard is at `/dashboard`.
  
  if (path.startsWith("/dashboard")) {
    const sessionToken = request.cookies.get("better-auth.session_token");
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*"
  ],
};

