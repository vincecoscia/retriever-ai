'use client';

import { useActionState, useState } from "react";
import { createUserForOrg } from "~/app/actions/users";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function CreateUserPage({ organizations }: { organizations: { id: string; name: string }[] }) {
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [newUserStatus, setNewUserStatus] = useState<boolean>(false);

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      setGeneratedPassword(null); // Reset on new submission
      const result = await createUserForOrg(formData);
      
      if (result.success) {
        if (result.password) {
            setGeneratedPassword(result.password);
            setNewUserStatus(true);
        } else {
            setNewUserStatus(false);
        }
        return { success: true, error: undefined };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Something went wrong" };
    }
  }, null);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Provision New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input name="email" type="email" placeholder="user@example.com" required />
            </div>

            <div className="space-y-2">
               <Label>Organization</Label>
               <select 
                 name="organizationId" 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 required
                 defaultValue=""
                >
                   <option value="" disabled>Select an organization...</option>
                   {organizations.map((org) => (
                       <option key={org.id} value={org.id}>{org.name}</option>
                   ))}
               </select>
            </div>

            <div className="space-y-2">
               <Label>Role</Label>
               <select 
                 name="role" 
                 className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 defaultValue="member"
                 required
                >
                   <option value="member">Member</option>
                   <option value="admin">Admin</option>
                   <option value="owner">Owner</option>
               </select>
            </div>

            {state?.error && (
              <div className="p-3 rounded bg-red-50 text-red-500 text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="p-4 rounded bg-green-50 border border-green-200">
                 <p className="text-green-800 font-medium mb-2">
                    {newUserStatus ? "User Created Successfully!" : "Existing User Added to Organization!"}
                 </p>
                 
                 {newUserStatus && generatedPassword && (
                     <div className="bg-white p-3 rounded border border-green-200 mt-2">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Temporary Password</p>
                        <code className="text-lg font-mono select-all bg-gray-100 px-2 py-1 rounded">
                            {generatedPassword}
                        </code>
                        <p className="text-xs text-gray-500 mt-2">
                            Please copy this password now. It will not be shown again.
                        </p>
                     </div>
                 )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Provisioning..." : "Provision User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

