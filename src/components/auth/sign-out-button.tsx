"use client";

import { authClient } from "~/server/better-auth/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/sign-in");
      }}
      className="text-xs text-red-600 hover:text-red-800 font-medium"
    >
      Sign Out
    </button>
  );
}

