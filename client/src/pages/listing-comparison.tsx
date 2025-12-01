import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { ArrowLeft, DollarSign, MapPin, Building2 } from "lucide-react";
import type { Listing } from "@shared/schema";

export default function ListingComparison() {
  const { user } = useAuth();
  const { comparisonId } = useParams();

  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ["/api/buyer/comparisons", comparisonId],
    enabled: !!user && !!comparisonId,
    queryFn: async () => {
      const res = await fetch(`/api/buyer/comparisons/${comparisonId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  if (!user) return <div className="p-8">Please sign in</div>;
  if (isLoading) return <div className="p-8">Loading...</div>;

  const comparison = comparisonData?.comparison;
  const listings: Listing[] = comparisonData?.listings || [];

  const fields = [
    { label: 'Price', key: 'priceInUSD', icon: DollarSign, format: (v: any) => v ? `$${parseFloat(v).toLocaleString()}` : 'N/A' },
    { label: 'Location', key: 'city', format: (v: any, listing: any) => `${v}, ${listing.region}` },
    { label: 'Type', key: 'businessType' },
    { label: 'Status', key: 'status', format: (v: any) => v ? v.charAt(0).toUpperCase() + v.slice(1) : 'N/A' },
  ];

  return (
    <>
      <SEO
        title={`Compare Properties | WashBizHub`}
        description="Side-by-side property comparison"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/buyer/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-title">{comparison?.name}</h1>
              <p className="text-sm text-slate-400">Comparing {listings.length} properties</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {comparison?.notes && (
            <Card className="mb-8 border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <CardContent className="pt-6 text-slate-100">{comparison.notes}</CardContent>
            </Card>
          )}

          {/* Comparison Table - Horizontal scroll on mobile */}
          <div className="overflow-x-auto rounded-lg border border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="px-4 py-4 text-left font-semibold text-slate-100 bg-slate-900/50 sticky left-0 z-10 min-w-[120px]">Field</th>
                  {listings.map((listing) => (
                    <th key={listing.id} className="px-4 py-4 text-left font-semibold text-slate-100 min-w-[200px]" data-testid={`heading-${listing.id}`}>
                      <Link href={`/listing/${listing.id}`}>
                        <div className="hover:text-blue-400 transition-colors cursor-pointer">
                          <p className="font-bold text-white line-clamp-2">{listing.title}</p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.city}, {listing.region}
                          </p>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => (
                  <tr key={field.key} className={`border-b border-slate-700/50 ${idx % 2 === 0 ? 'bg-slate-900/20' : ''} hover:bg-slate-800/50 transition-colors`}>
                    <td className="px-4 py-4 font-medium text-slate-100 bg-slate-900/30 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        {field.icon && <field.icon className="w-4 h-4 text-slate-400" />}
                        {field.label}
                      </div>
                    </td>
                    {listings.map((listing) => (
                      <td key={`${listing.id}-${field.key}`} className="px-4 py-4 text-slate-200" data-testid={`cell-${listing.id}-${field.key}`}>
                        {field.format 
                          ? field.format(listing[field.key as keyof Listing], listing)
                          : String(listing[field.key as keyof Listing] || 'N/A')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors cursor-pointer h-full" data-testid={`card-${listing.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg text-white line-clamp-2">{listing.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Price</span>
                        <span className="font-bold text-white">${parseFloat(listing.priceInUSD || '0').toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Location</span>
                        <span className="text-sm text-slate-100">{listing.city}, {listing.region}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Type</span>
                        <Badge variant="outline" className="text-xs">{listing.businessType}</Badge>
                      </div>
                      {listing.annualRevenue && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Annual Revenue</span>
                          <span className="font-semibold text-slate-100">${parseInt(listing.annualRevenue).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
