"use server";

import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { z } from "zod";

const CreateOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export async function createOrganization(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = CreateOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await db.organization.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
      },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create organization. Slug might be taken." };
  }
}

const CreateCompanySchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
});

export async function createCompany(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = CreateCompanySchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await db.company.create({
      data: {
        organizationId: parsed.data.organizationId,
        name: parsed.data.name,
      },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create company." };
  }
}

const CreateLocationSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

export async function createLocation(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const rawData = {
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    zip: formData.get("zip") || undefined,
  };

  const parsed = CreateLocationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await db.location.create({
      data: {
        companyId: parsed.data.companyId,
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        zip: parsed.data.zip,
      },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create location." };
  }
}

