import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "mysql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization()
  ],
  socialProviders: {

  },
});

export type Session = typeof auth.$Infer.Session;
