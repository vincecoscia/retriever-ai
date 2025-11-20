'use server'

import { db } from "~/server/db";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { z } from "zod";

const OnboardSchema = z.object({
  orgName: z.string().min(2),
  companyName: z.string().min(2),
  locationName: z.string().min(2),
  city: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
});

export async function onboardClient(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const rawData = {
    orgName: formData.get('orgName'),
    companyName: formData.get('companyName'),
    locationName: formData.get('locationName'),
    city: formData.get('city'),
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
  };

  const data = OnboardSchema.parse(rawData);

  await db.$transaction(async (tx) => {
    // 1. Create Organization
    const org = await tx.organization.create({
      data: {
        name: data.orgName,
        slug: data.orgName.toLowerCase().replace(/\s+/g, '-'),
        members: {
          create: {
            userId: session.user.id,
            role: "owner"
          }
        }
      }
    });

    // 2. Create Company
    const company = await tx.company.create({
      data: {
        name: data.companyName,
        organizationId: org.id
      }
    });

    // 3. Create Location (Pipeline Trigger)
    await tx.location.create({
      data: {
        name: data.locationName,
        companyId: company.id,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        isActive: true
      }
    });
  });

  return { success: true };
}