import { db } from "~/server/db";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { WeatherChart } from "~/components/dashboard/weather-chart";

export default async function WeatherPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null; 

  let activeOrgId = session.session.activeOrganizationId;
  
  if (!activeOrgId) {
     // Fallback
     const membership = await db.member.findFirst({ where: { userId: session.user.id } });
     activeOrgId = membership?.organizationId ?? null;
  }

  if (!activeOrgId) return <div className="p-8">Please select an organization to view data.</div>;

  const weatherData = await db.dashboard_weather.findMany({
    where: { client_id: activeOrgId },
    orderBy: { measured_at: 'asc' },
    take: 30 
  });

  // Transform for chart
  const chartData = weatherData.map(w => ({
    date: w.measured_at ? new Date(w.measured_at).toLocaleDateString() : 'N/A',
    temperature: w.temperature_f,
    sales: Math.floor(Math.random() * 5000) + 2000 // Mock sales data
  }));

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Weather & Demand Analysis</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Temperature vs. Sales Impact</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
           {chartData.length > 0 ? (
             <WeatherChart data={chartData} />
           ) : (
             <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-md border border-dashed">
               <div className="text-center">
                 <p>No weather data available yet.</p>
                 <p className="text-xs mt-2">Data pipeline runs hourly.</p>
               </div>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

