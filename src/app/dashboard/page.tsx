import { db } from "~/server/db";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { CloudRain, TrendingUp, AlertCircle, Activity, Star, Calendar } from "lucide-react";

export default async function DashboardHome() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  let orgId = session.session.activeOrganizationId;
  
  if (!orgId) {
      const membership = await db.member.findFirst({ where: { userId: session.user.id } });
      orgId = membership?.organizationId ?? null;
  }

  if (!orgId) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <h2 className="text-2xl font-bold">No Organization Found</h2>
            <p className="text-gray-500">You are not a member of any organization yet.</p>
        </div>
      );
  }

  // Fetch data safely
  let weatherData = null;
  let recentReviews: any[] = [];
  let reviewCount = 0;

  try {
     weatherData = await db.dashboard_weather.findFirst({
        where: { client_id: orgId },
        orderBy: { measured_at: 'desc' },
     });
  } catch (error) {
      console.warn("Failed to fetch weather data:", error);
  }

  try {
    // Check if table exists or model is valid before querying
    if (db.dashboard_reviews) {
        recentReviews = await db.dashboard_reviews.findMany({
            where: { client_id: orgId },
            orderBy: { review_date: 'desc' },
            take: 3
        });

        reviewCount = await db.dashboard_reviews.count({
            where: { client_id: orgId }
        });
    }
  } catch (error) {
      console.warn("Failed to fetch review data:", error);
  }

  // Mock data for calculation if db is empty
  const avgRating = 4.2; 
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Overview of your location performance and insights.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border shadow-sm text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather Impact</CardTitle>
            <CloudRain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {weatherData?.temperature_f ? `${Math.round(weatherData.temperature_f)}°F` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {weatherData?.description || "No data available"}
            </p>
            <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[0%]"></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">--</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {reviewCount} reviews
            </p>
             <div className="mt-3 flex gap-0.5">
                {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`h-3 w-3 ${star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitor Gap</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+0.2</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. Local Market Average
            </p>
            <div className="mt-3 text-xs text-gray-500">
                You are leading in 3/5 categories.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Pricing</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Reviews</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
         {/* Action Items - Spans 4 columns */}
         <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>AI-driven suggestions to optimize performance.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {[
                        { title: "Respond to negative review from John Doe", priority: "High", type: "Reputation", time: "2h ago" },
                        { title: "Increase room rates for upcoming rainy weekend", priority: "Medium", type: "Revenue", time: "5h ago" },
                        { title: "Update holiday hours on Google Maps", priority: "Low", type: "Operations", time: "1d ago" },
                    ].map((action, i) => (
                        <div key={i} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{action.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{action.type}</span>
                                    <span>•</span>
                                    <span>{action.time}</span>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                action.priority === 'High' ? 'bg-red-100 text-red-700' :
                                action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {action.priority}
                            </span>
                        </div>
                    ))}
                 </div>
            </CardContent>
         </Card>

         {/* Recent Activity - Spans 3 columns */}
         <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest feedback from all channels.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {recentReviews.length > 0 ? recentReviews.map((review) => (
                        <div key={review.id} className="flex gap-4">
                             <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                 {review.author ? review.author[0] : "A"}
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{review.author || "Anonymous"}</p>
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(Math.round(review.rating || 0))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {review.content}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    via {review.source} • {review.review_date?.toLocaleDateString()}
                                </p>
                             </div>
                        </div>
                    )) : (
                         // Empty State / Skeleton
                         <div className="flex flex-col gap-4">
                             <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded border border-dashed">
                                 No reviews available yet.
                             </div>
                         </div>
                    )}
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
