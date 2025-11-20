import Link from "next/link";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Plus, User as UserIcon } from "lucide-react";

export default async function UsersPage() {
  const users = await db.user.findMany({
    include: {
      members: {
        include: {
          organization: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Link href="/admin/users/create">
            <Button>
                <Plus className="h-4 w-4 mr-2" />
                Provision User
            </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizations & Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                           {user.image ? (
                               <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full" />
                           ) : (
                               <span className="text-xs font-medium">{user.name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4 text-gray-400" />}</span>
                           )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                            {user.members.length > 0 ? (
                                user.members.map(member => (
                                    <span key={member.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border">
                                        {member.organization.name} 
                                        <span className="ml-1 text-gray-500">({member.role})</span>
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">No organizations</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

