import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  ExternalLink,
  Heart,
  Zap,
  Music,
  Hand,
  Dumbbell,
  Shirt,
  Gift,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";

const flintRehabProducts = [
  {
    id: "musicglove",
    name: "MusicGlove",
    category: "Hand Therapy",
    tagline: "The #1 hand therapy device for stroke recovery",
    description: "Gamified hand exercise that improves fine motor skills by playing along with music. Clinically proven to improve hand function after just 2 weeks.",
    price: "$349 - $549",
    originalPrice: "$599",
    image: "🎵",
    icon: Music,
    rating: 4.9,
    reviews: 2847,
    savings: "Save up to $50",
    features: [
      "Gamified therapy makes exercise fun",
      "Tracks progress automatically",
      "Works with laptop or tablet",
      "100+ therapeutic songs"
    ],
    affiliateUrl: "https://www.flintrehab.com/product/musicglove/?ref=strokerecovery",
    bestseller: true
  },
  {
    id: "fitmi",
    name: "FitMi",
    category: "Full-Body Therapy",
    tagline: "Interactive home therapy for full-body recovery",
    description: "A full-body exercise program that guides you through therapeutic exercises. Adapts to your ability level and tracks improvement over time.",
    price: "$299+",
    originalPrice: "$349",
    image: "💪",
    icon: Dumbbell,
    rating: 4.8,
    reviews: 1923,
    savings: "Save $50",
    features: [
      "40+ exercises for all ability levels",
      "Tracks movement with sensors",
      "Progressive difficulty",
      "Real-time feedback"
    ],
    affiliateUrl: "https://www.flintrehab.com/product/fitmi/?ref=strokerecovery",
    bestseller: true
  },
  {
    id: "bundle",
    name: "MusicGlove + FitMi Bundle",
    category: "Complete Recovery",
    tagline: "The ultimate home therapy package",
    description: "Combine the power of both devices for comprehensive recovery. Target hand function AND full-body mobility.",
    price: "$598",
    originalPrice: "$698",
    image: "🎁",
    icon: Gift,
    rating: 5.0,
    reviews: 847,
    savings: "Save $100",
    features: [
      "Best value combo",
      "Complete upper body therapy",
      "Shared progress tracking",
      "Free shipping included"
    ],
    affiliateUrl: "https://www.flintrehab.com/product/bundle/?ref=strokerecovery",
    featured: true
  }
];

const sosApparel = [
  {
    id: "warrior-tee",
    name: "Warrior Tee",
    description: "The official Stroked Out Sasquatch warrior shirt",
    price: "$29.99",
    image: "👕",
    colors: ["Black", "Orange", "Gray"],
    bestseller: true
  },
  {
    id: "grind-hoodie",
    name: "The Grind Hoodie",
    description: '"The Grind is the Gospel" premium hoodie',
    price: "$49.99",
    image: "🧥",
    colors: ["Black", "Gray"]
  },
  {
    id: "survivor-cap",
    name: "Survivor Cap",
    description: "Stroke survivor pride snapback cap",
    price: "$24.99",
    image: "🧢",
    colors: ["Black", "Orange"]
  },
  {
    id: "recovery-wristband",
    name: "Recovery Wristband",
    description: "Daily reminder to keep grinding - silicone wristband",
    price: "$9.99",
    image: "⌚",
    colors: ["Orange", "Black", "White"],
    pack: "3-pack"
  }
];

export default function SRAStore() {
  return (
    <>
      <Helmet>
        <title>Recovery Store | Stroke Recovery Academy</title>
        <meta name="description" content="Shop stroke recovery equipment from Flint Rehab, SOS apparel, and survivor merchandise. MusicGlove, FitMi, and more." />
        <meta property="og:title" content="Recovery Store | Stroke Recovery Academy" />
        <meta property="og:description" content="Shop stroke recovery equipment and SOS apparel. Support your recovery journey." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sra">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" data-testid="text-title">Recovery Store</h1>
                    <p className="text-sm text-gray-400">Equipment & Apparel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-orange-600 mb-3">Trusted Partner</Badge>
                <h2 className="text-3xl font-bold mb-2" data-testid="text-hero">Flint Rehab Recovery Equipment</h2>
                <p className="text-gray-300 max-w-2xl">
                  Nick's top picks for home therapy. These are the exact tools he used during his recovery. Clinically proven, survivor approved.
                </p>
              </div>
              <img src={sosLogo} alt="SOS" className="h-24 w-24 opacity-50 hidden md:block" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="equipment">
            <TabsList className="bg-gray-900 border border-gray-800 mb-8">
              <TabsTrigger value="equipment" className="data-[state=active]:bg-orange-600" data-testid="tab-equipment">
                <Dumbbell className="h-4 w-4 mr-2" />
                Recovery Equipment
              </TabsTrigger>
              <TabsTrigger value="apparel" className="data-[state=active]:bg-orange-600" data-testid="tab-apparel">
                <Shirt className="h-4 w-4 mr-2" />
                SOS Apparel
              </TabsTrigger>
            </TabsList>

            {/* Equipment Tab */}
            <TabsContent value="equipment">
              {/* Featured Product */}
              <Card className="bg-gradient-to-br from-orange-600/30 to-orange-500/10 border-orange-600/50 mb-8">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge className="bg-green-600 mb-4">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Best Value
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2">MusicGlove + FitMi Bundle</h3>
                      <p className="text-gray-300 mb-4">
                        The complete home recovery package. Combine hand therapy with full-body exercises for maximum progress.
                      </p>
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-bold text-orange-500">$598</span>
                        <span className="text-lg text-gray-500 line-through">$698</span>
                        <Badge variant="outline" className="border-green-500 text-green-500">Save $100</Badge>
                      </div>
                      <div className="space-y-2 mb-6">
                        {["Complete upper body recovery", "Progress tracking for both devices", "90-day money back guarantee"].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <a href="https://www.flintrehab.com/product/bundle/?ref=strokerecovery" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-orange-600 hover:bg-orange-700" size="lg" data-testid="button-buy-bundle">
                          Get the Bundle
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <div className="text-8xl">🎁</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flintRehabProducts.filter(p => !p.featured).map((product) => (
                  <Card key={product.id} className="bg-gray-900 border-gray-800 hover-elevate" data-testid={`product-card-${product.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        {product.bestseller && (
                          <Badge className="bg-orange-600">Bestseller</Badge>
                        )}
                        <Badge variant="outline" className="border-gray-600">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="text-6xl text-center py-4">{product.image}</div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription>{product.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">({product.reviews.toLocaleString()} reviews)</span>
                      </div>

                      <div className="space-y-1 mb-4">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 className="h-3 w-3 text-orange-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xl font-bold text-orange-500">{product.price}</span>
                        {product.savings && (
                          <p className="text-xs text-green-500">{product.savings}</p>
                        )}
                      </div>
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-orange-600 hover:bg-orange-700" data-testid={`button-buy-${product.id}`}>
                          Shop Now
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Trust Banner */}
              <Card className="bg-gray-900 border-gray-800 mt-8">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold">Clinically Proven</p>
                      <p className="text-xs text-gray-400">Published research</p>
                    </div>
                    <div>
                      <Heart className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold">10,000+ Users</p>
                      <p className="text-xs text-gray-400">Worldwide community</p>
                    </div>
                    <div>
                      <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold">90-Day Guarantee</p>
                      <p className="text-xs text-gray-400">Money back promise</p>
                    </div>
                    <div>
                      <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold">4.9/5 Rating</p>
                      <p className="text-xs text-gray-400">Customer reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Apparel Tab */}
            <TabsContent value="apparel">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">SOS Apparel Collection</h3>
                <p className="text-gray-400">Wear your warrior status. 10% of proceeds support stroke survivor programs.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sosApparel.map((item) => (
                  <Card key={item.id} className="bg-gray-900 border-gray-800 hover-elevate" data-testid={`apparel-card-${item.id}`}>
                    <CardHeader className="text-center">
                      {item.bestseller && (
                        <Badge className="bg-orange-600 w-fit mx-auto mb-2">Bestseller</Badge>
                      )}
                      <div className="text-6xl py-4">{item.image}</div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="flex justify-center gap-2 mb-4">
                        {item.colors.map((color) => (
                          <Badge key={color} variant="outline" className="border-gray-600 text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                      {item.pack && (
                        <p className="text-xs text-orange-500 mb-2">{item.pack}</p>
                      )}
                      <p className="text-xl font-bold text-orange-500">{item.price}</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid={`button-buy-${item.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30 mt-8">
                <CardContent className="p-8 text-center">
                  <img src={sosLogo} alt="SOS" className="h-16 w-16 mx-auto mb-4 opacity-75" />
                  <h3 className="text-xl font-bold mb-2">10% Gives Back</h3>
                  <p className="text-gray-300 max-w-md mx-auto">
                    Every apparel purchase supports Together Fist, our nonprofit helping stroke survivors rebuild their lives.
                  </p>
                  <Link href="/sra">
                    <Button variant="outline" className="mt-4 border-orange-500 text-orange-500 hover:bg-orange-500/10" data-testid="button-learn-more">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
