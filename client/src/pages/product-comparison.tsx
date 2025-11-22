import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Star, TrendingUp, DollarSign, Calculator,
  CheckCircle2, XCircle, Home, ChevronRight, ShoppingCart
} from "lucide-react";

interface ComparisonProduct {
  asin: string;
  title: string;
  brand?: string;
  price?: { displayAmount: string; amount: number };
  image?: string;
  url: string;
  rating?: number;
  category: string;
  categoryName: string;
}

export default function ProductComparison() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [roiInputs, setRoiInputs] = useState<Record<string, { revenue: number; expenses: number }>>({});

  const { data: catalogData } = useQuery({
    queryKey: ['/api/superstore/catalog'],
  });

  const allProducts: ComparisonProduct[] = catalogData?.products 
    ? Object.values(catalogData.products).flat()
    : [];

  const selectedProductsData = allProducts.filter(p => selectedProducts.includes(p.asin));

  const addProduct = (asin: string) => {
    if (selectedProducts.length < 3 && !selectedProducts.includes(asin)) {
      setSelectedProducts([...selectedProducts, asin]);
      setRoiInputs({ ...roiInputs, [asin]: { revenue: 5000, expenses: 2000 } });
    }
  };

  const removeProduct = (asin: string) => {
    setSelectedProducts(selectedProducts.filter(a => a !== asin));
    const newInputs = { ...roiInputs };
    delete newInputs[asin];
    setRoiInputs(newInputs);
  };

  const calculateROI = (asin: string) => {
    const product = selectedProductsData.find(p => p.asin === asin);
    const inputs = roiInputs[asin] || { revenue: 5000, expenses: 2000 };
    const price = product?.price?.amount || 0;
    const monthlyProfit = inputs.revenue - inputs.expenses;
    const paybackMonths = monthlyProfit > 0 ? Math.ceil(price / monthlyProfit) : 0;
    const annualROI = monthlyProfit > 0 ? ((monthlyProfit * 12 / price) * 100).toFixed(1) : "0";
    return { paybackMonths, annualROI, monthlyProfit };
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Commercial Laundry Equipment Comparison Tool",
    "description": "Compare commercial washers, dryers, and laundromat equipment side-by-side. Calculate ROI, compare specifications, and make informed purchase decisions.",
    "url": "https://washbizhub.com/superstore/compare"
  };

  return (
    <>
      <Helmet>
        <title>Equipment Comparison Tool - Compare Commercial Laundry Equipment | WashBizHub</title>
        <meta name="description" content="Compare up to 3 commercial laundry equipment products side-by-side. Analyze specs, pricing, ROI, and features to make the best buying decision for your laundromat." />
        <meta name="keywords" content="laundry equipment comparison, commercial washer comparison, dryer comparison tool, equipment ROI calculator, compare laundromat equipment" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Equipment Comparison Tool - WashBizHub Superstore" />
        <meta property="og:description" content="Compare commercial laundry equipment side-by-side with ROI analysis and detailed specifications." />
        <meta property="og:url" content="https://washbizhub.com/superstore/compare" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/"><a className="hover:text-primary flex items-center"><Home className="h-4 w-4" /></a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/superstore"><a className="hover:text-primary">Superstore</a></Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Compare Equipment</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Comparison Tool</Badge>
            <h1 className="text-4xl font-bold mb-4">Compare Commercial Laundry Equipment</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select up to 3 products to compare side-by-side. Analyze specs, pricing, ROI, and make the best decision for your laundromat.
            </p>
          </div>

          {/* Product Selection */}
          {selectedProducts.length < 3 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add Products to Compare ({selectedProducts.length}/3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allProducts.slice(0, 12).map((product) => (
                    <Card
                      key={product.asin}
                      className={`cursor-pointer hover-elevate ${selectedProducts.includes(product.asin) ? 'border-primary' : ''}`}
                      onClick={() => addProduct(product.asin)}
                      data-testid={`card-add-${product.asin}`}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.title}</h3>
                        <p className="text-sm font-bold text-primary">{product.price?.displayAmount}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          disabled={selectedProducts.includes(product.asin)}
                        >
                          {selectedProducts.includes(product.asin) ? 'Added' : 'Add to Compare'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          {selectedProducts.length > 0 && (
            <div className="space-y-6">
              {/* Product Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProductsData.map((product) => (
                      <div key={product.asin} className="border rounded-lg p-4">
                        <div className="aspect-square bg-muted rounded mb-3 flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                        <p className="text-2xl font-bold text-primary mb-3">{product.price?.displayAmount}</p>
                        {product.rating && (
                          <div className="flex items-center mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-semibold">{product.rating}</span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Link href={`/superstore/product/${product.asin}`}>
                            <Button variant="outline" size="sm" className="w-full">View Details</Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="w-full" onClick={() => removeProduct(product.asin)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ROI Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Calculator className="mr-2 h-5 w-5" />ROI Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedProductsData.map((product) => {
                      const roi = calculateROI(product.asin);
                      const inputs = roiInputs[product.asin] || { revenue: 5000, expenses: 2000 };
                      
                      return (
                        <div key={product.asin} className="border-b pb-6 last:border-0">
                          <h4 className="font-semibold mb-3">{product.title}</h4>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Monthly Revenue</label>
                              <Input
                                type="number"
                                value={inputs.revenue}
                                onChange={(e) => setRoiInputs({
                                  ...roiInputs,
                                  [product.asin]: { ...inputs, revenue: Number(e.target.value) }
                                })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Monthly Expenses</label>
                              <Input
                                type="number"
                                value={inputs.expenses}
                                onChange={(e) => setRoiInputs({
                                  ...roiInputs,
                                  [product.asin]: { ...inputs, expenses: Number(e.target.value) }
                                })}
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-primary/5 p-3 rounded text-center">
                              <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                              <p className="text-2xl font-bold text-primary">{roi.paybackMonths} mo</p>
                            </div>
                            <div className="bg-accent/5 p-3 rounded text-center">
                              <p className="text-sm text-muted-foreground mb-1">Annual ROI</p>
                              <p className="text-2xl font-bold text-accent">{roi.annualROI}%</p>
                            </div>
                            <div className="bg-green-500/5 p-3 rounded text-center">
                              <p className="text-sm text-muted-foreground mb-1">Monthly Profit</p>
                              <p className="text-2xl font-bold text-green-600">${roi.monthlyProfit.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Specs Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Feature</th>
                          {selectedProductsData.map((product) => (
                            <th key={product.asin} className="text-left p-3 font-semibold">{product.brand}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">Price</td>
                          {selectedProductsData.map((product) => (
                            <td key={product.asin} className="p-3 font-semibold text-primary">{product.price?.displayAmount}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Rating</td>
                          {selectedProductsData.map((product) => (
                            <td key={product.asin} className="p-3">
                              {product.rating ? `${product.rating}/5.0` : 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Type</td>
                          {selectedProductsData.map((product) => (
                            <td key={product.asin} className="p-3">Commercial Grade</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Warranty</td>
                          {selectedProductsData.map((product) => (
                            <td key={product.asin} className="p-3">1-3 Years</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3">Free Shipping</td>
                          {selectedProductsData.map((product) => (
                            <td key={product.asin} className="p-3">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Winner Analysis */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>Based on your comparison, here are our recommendations:</p>
                    <ul>
                      <li><strong>Best Value:</strong> Consider the equipment with the lowest price and fastest payback period</li>
                      <li><strong>Best Quality:</strong> Higher-rated equipment typically offers better reliability</li>
                      <li><strong>Best ROI:</strong> Check the annual ROI percentage for long-term value</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      💡 Need help deciding? <Link href="/consultation"><a className="text-primary underline">Get a free consultation</a></Link> with our equipment experts!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center">
                <Link href="/superstore">
                  <Button size="lg" variant="outline" className="mr-3">
                    Browse More Equipment
                  </Button>
                </Link>
                <Button size="lg" variant="default" data-testid="button-consultation">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Get Financing Quote
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedProducts.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select products to start comparing</h3>
              <p className="text-muted-foreground">Choose up to 3 products from the list above</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
