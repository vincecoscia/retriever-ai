import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

// Action to toggle status
async function toggleLocationStatus(locationId: string, currentStatus: boolean) {
  "use server";
  await db.location.update({
    where: { id: locationId },
    data: { isActive: !currentStatus }
  });
  revalidatePath("/admin/pipelines");
}

export default async function PipelinesPage() {
  const locations = await db.location.findMany({
    include: {
      company: {
        include: {
          organization: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pipeline Management</h2>
        <a href="/admin/onboarding" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          + Onboard New Client
        </a>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client / Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coords</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No locations found. Onboard a client to get started.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{loc.company.organization.name}</div>
                      <div className="text-sm text-gray-500">{loc.company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.city}, {loc.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {loc.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={toggleLocationStatus.bind(null, loc.id, loc.isActive)}>
                        <button type="submit" className="text-indigo-600 hover:text-indigo-900">
                          {loc.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </form>
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
