'use client';

import { useActionState } from "react";
import { onboardClient } from "~/app/actions/onboarding";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const result = await onboardClient(formData);
      return { success: result.success, error: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Something went wrong" };
    }
  }, null);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Onboard New Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            
            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium mb-2">Organization Details</h3>
              <div className="space-y-2">
                <Label>Client Name (Paying Entity)</Label>
                <Input name="orgName" placeholder="e.g. Marriott International" required />
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium mb-2">Brand Details</h3>
              <div className="space-y-2">
                <Label>Company Name (Brand)</Label>
                <Input name="companyName" placeholder="e.g. Courtyard by Marriott" required />
              </div>
            </div>

            <div className="pb-4">
              <h3 className="font-medium mb-2">First Location (Pipeline Trigger)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location Name</Label>
                  <Input name="locationName" placeholder="e.g. Downtown Miami" required />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="city" placeholder="Miami" required />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input name="latitude" type="number" step="any" placeholder="25.7617" required />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input name="longitude" type="number" step="any" placeholder="-80.1918" required />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Entering these coordinates will trigger the Weather Pipeline for this location.
              </p>
            </div>

            {state?.error && (
              <div className="p-3 rounded bg-red-50 text-red-500 text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="p-3 rounded bg-green-50 text-green-600 text-sm">
                Client onboarded successfully!
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Client & Trigger Pipeline"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
