import { db } from "~/server/db";
import { ClientsList } from "./clients-list";

export default async function ClientsPage() {
  const clients = await db.organization.findMany({
    where: {
        slug: { not: "blackdog-admin" }
    },
    include: {
      companies: {
        include: {
          locations: true
        }
      },
      members: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        </div>
        <ClientsList initialClients={clients} />
    </div>
  )
}

