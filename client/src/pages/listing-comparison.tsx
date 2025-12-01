import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { BarChart3, DollarSign, TrendingUp, Building2, MapPin } from "lucide-react";
import type { Listing } from "@shared/schema";

export default function ListingComparison() {
  const { user } = useAuth();
  const { comparisonId } = useParams();

  const { data: comparisonData } = useQuery({
    queryKey: ["/api/buyer/comparisons", comparisonId],
    enabled: !!user && !!comparisonId,
    queryFn: async () => {
      const res = await fetch(`/api/buyer/comparisons/${comparisonId}`);
      if (!res.ok) throw new Error("Failed to fetch comparison");
      return res.json();
    }
  });

  if (!user) {
    return <div className="p-8 text-center">Please sign in to view comparisons</div>;
  }

  const comparison = comparisonData?.comparison;
  const listings: Listing[] = comparisonData?.listings || [];

  const fields = [
    { label: 'Price', key: 'priceInUSD', icon: DollarSign },
    { label: 'City', key: 'city' },
    { label: 'Annual Revenue', key: 'annualRevenue' },
    { label: 'Type', key: 'businessType' },
    { label: 'Washers', key: 'washerCount' },
    { label: 'Dryers', key: 'dryerCount' },
  ];

  return (
    <>
      <SEO
        title={`${comparison?.name} Comparison | WashBizHub`}
        description="Side-by-side listing comparison"
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="text-comparison-title">
              {comparison?.name}
            </h1>
            <p className="text-muted-foreground">Comparing {listings.length} listings</p>
          </div>

          {comparison?.notes && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <p className="text-sm">{comparison.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-semibold">Field</th>
                  {listings.map((listing) => (
                    <th key={listing.id} className="text-left p-3 border-b font-semibold">
                      <div className="font-bold" data-testid={`heading-${listing.id}`}>{listing.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.city}, {listing.region}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b hover:bg-accent/50">
                    <td className="p-3 font-medium text-sm">{field.label}</td>
                    {listings.map((listing) => (
                      <td key={`${listing.id}-${field.key}`} className="p-3 text-sm" data-testid={`cell-${listing.id}-${field.key}`}>
                        {field.key === 'priceInUSD' 
                          ? `$${parseFloat(listing[field.key] || '0').toLocaleString()}`
                          : String(listing[field.key as keyof Listing] || 'N/A')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pros/Cons Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {listings.map((listing) => (
              <Card key={listing.id} data-testid={`card-listing-${listing.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Price:</span> ${parseFloat(listing.priceInUSD || '0').toLocaleString()}</p>
                      <p><span className="font-medium">Location:</span> {listing.city}, {listing.region}</p>
                      <p><span className="font-medium">Type:</span> {listing.businessType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
