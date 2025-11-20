"use server";

import { db } from "~/server/db";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { z } from "zod";
import { randomBytes } from "crypto";

const CreateUserSchema = z.object({
  email: z.string().email(),
  organizationId: z.string().min(1, "Organization is required"),
  role: z.enum(["admin", "member", "owner"]),
});

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function createUserForOrg(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // TODO: Add check to ensure current user is an admin/owner of the Admin Org

  const rawData = {
    email: formData.get("email"),
    organizationId: formData.get("organizationId"),
    role: formData.get("role"),
  };

  const result = CreateUserSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, organizationId, role } = result.data;
  let password = null;
  let isNewUser = false;

  try {
    // 1. Check if user exists
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // 2. Create new user
      isNewUser = true;
      password = generatePassword();
      
      // We use auth.api.signUpEmail to properly hash password and create session/account
      // Since we are on server, we need to be careful about headers if it tries to set cookies
      // But for simple user creation without logging them in immediately in this context, we might just create the user directly via DB or use internal BetterAuth method if exposed.
      // However, using signUpEmail is the standard way. It might try to set a session cookie for the requester, which we don't want (we are already logged in as admin).
      // BetterAuth doesn't easily support "admin creates user" out of the box without logging them in.
      // Workaround: Use `auth.api.signUpEmail` but ignore the session result.
      
      const signUpRes = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name: email.split("@")[0], // Default name
        },
        asResponse: false
      });
      
      // Fetch the user again to be sure we have the ID
      user = await db.user.findUnique({ where: { email } });
      if (!user) throw new Error("Failed to create user");
    }

    // 3. Add to Organization
    // Check if already a member
    const existingMember = await db.member.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId
      }
    });

    if (existingMember) {
      return { success: false, error: "User is already a member of this organization." };
    }

    await db.member.create({
      data: {
        userId: user.id,
        organizationId,
        role
      }
    });

    return { 
        success: true, 
        password: isNewUser ? password : null,
        isNewUser
    };

  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create user" };
  }
}

