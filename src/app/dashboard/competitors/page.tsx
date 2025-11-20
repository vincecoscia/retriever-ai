import { db } from "~/server/db";
import { auth } from "~/server/better-auth/config";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function CompetitorsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  
  let activeOrgId = session.session.activeOrganizationId;
  if (!activeOrgId) {
     const membership = await db.member.findFirst({ where: { userId: session.user.id } });
     activeOrgId = membership?.organizationId ?? null;
  }

  if (!activeOrgId) return <div className="p-8">Please select an organization to view data.</div>;

  // Fetch competitors
  const competitors = await db.dashboard_competitors.findMany({
      where: { client_id: activeOrgId }
  });
  
  // Fetch recent reviews
  const reviews = await db.dashboard_reviews.findMany({
      where: { client_id: activeOrgId },
      orderBy: { review_date: 'desc' },
      take: 5
  });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Competitor Intelligence</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
         {/* Competitor List */}
         <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Local Competitors</CardTitle>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                  <div className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-md border border-dashed">
                    No competitors tracked yet.
                  </div>
              ) : (
                  <div className="space-y-4">
                      {competitors.map(comp => (
                          <div key={comp.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                              <div>
                                  <p className="font-medium">{comp.name}</p>
                                  <p className="text-xs text-gray-500">{comp.review_count} reviews</p>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-bold">{comp.avg_rating?.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">Rating</div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
            </CardContent>
         </Card>

         {/* Dynamic Pricing Suggestions */}
         <Card className="col-span-1 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Dynamic Pricing Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-900">
                     <strong>Insight:</strong> Competitor A raised prices by 10% for the upcoming holiday.
                  </p>
                  <p className="text-sm text-blue-900 mt-2">
                     <strong>Suggested Action:</strong> Increase rate by 5% to capture premium demand while staying competitive.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
          <CardHeader>
            <CardTitle>Recent Market Reviews</CardTitle>
          </CardHeader>
          <CardContent>
             {reviews.length === 0 ? (
                 <div className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-md border border-dashed">
                    No reviews found.
                 </div>
             ) : (
                 <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-sm">{review.author || "Anonymous"}</span>
                                <span className="text-xs text-gray-500">{review.review_date.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400 text-sm">
                                    {"★".repeat(Math.round(review.rating || 0))}
                                    {"☆".repeat(5 - Math.round(review.rating || 0))}
                                </div>
                                <span className="text-xs bg-gray-100 px-2 rounded text-gray-600">{review.source}</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.content}</p>
                        </div>
                    ))}
                 </div>
             )}
          </CardContent>
      </Card>
    </div>
  );
}

