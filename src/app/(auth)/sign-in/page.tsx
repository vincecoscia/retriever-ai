'use client';

import { useState } from 'react';
import { authClient } from "~/server/better-auth/client"; // Updated import
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
        onSuccess: () => {
            router.push('/admin'); 
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
          <CardDescription>Enter your credentials to access the Admin Hub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@blackdog.com"
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