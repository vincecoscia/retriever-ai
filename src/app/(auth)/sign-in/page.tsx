'use client';

import { useState } from 'react';
import { authClient } from "~/server/better-auth/client"; 
import { useRouter } from 'next/navigation';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await authClient.signIn.email({
        email,
        password,
    }, {
        onSuccess: async () => {
            try {
                // Fetch organizations to check if the user is part of the Admin Org
                // Note: For now we hardcode the admin org check or role check.
                // Since we don't have the full membership list in the session object by default
                // unless we extended it, we might need to rely on the active organization 
                // or fetch organizations list.
                
                const orgs = await authClient.organization.list();
                const adminOrgSlug = "blackdog-admin";
                
                const isAdmin = orgs.data?.some(org => org.slug === adminOrgSlug);
                
                if (isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error("Navigation error:", error);
                alert("Failed to redirect after sign in.");
                setLoading(false);
            }
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setLoading(false);
        }
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>BlackDog Platform</CardTitle>
          <CardDescription>Enter your credentials to access the Hub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSignIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
