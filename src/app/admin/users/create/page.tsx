import { db } from "~/server/db";
import CreateUserForm from "./create-user-form";

export default async function CreateUserPageWrapper() {
  // Fetch organizations for dropdown
  const organizations = await db.organization.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return <CreateUserForm organizations={organizations} />;
}

