import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MarketplaceListing } from "@shared/schema";
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Search,
  Star,
  ShoppingCart,
  Plus,
  Filter,
  Globe,
  DollarSign,
  Users,
  PlayCircle,
  Clock,
  Award,
  TrendingUp,
  Heart,
  ChevronRight,
  Upload,
  Package
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";
import strokeLyfePublishingLogo from "@assets/Logo Transparent BG_1764090018405.png";

const categories = [
  { id: "all", name: "All", count: 156 },
  { id: "courses", name: "Courses", count: 48 },
  { id: "books", name: "Books", count: 87 },
  { id: "exercises", name: "Exercise Programs", count: 21 },
];

function CourseCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="aspect-video rounded-lg bg-gray-800" />
        <Skeleton className="h-5 w-3/4 mt-3 bg-gray-800" />
        <Skeleton className="h-4 w-1/2 mt-2 bg-gray-800" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-3 w-20 bg-gray-800" />
          <Skeleton className="h-3 w-12 bg-gray-800" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-3 w-16 bg-gray-800" />
          <Skeleton className="h-3 w-16 bg-gray-800" />
        </div>
        <Skeleton className="h-5 w-20 bg-gray-800" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Skeleton className="h-6 w-16 bg-gray-800" />
        <Skeleton className="h-8 w-16 bg-gray-800" />
      </CardFooter>
    </Card>
  );
}

function BookCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-36 rounded bg-gray-800 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-16 mb-2 bg-gray-800" />
            <Skeleton className="h-5 w-3/4 bg-gray-800" />
            <Skeleton className="h-4 w-1/2 mt-2 bg-gray-800" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-3 w-20 bg-gray-800" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <Skeleton className="h-6 w-16 bg-gray-800" />
              <Skeleton className="h-8 w-20 bg-gray-800" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: "courses" | "books" }) {
  return (
    <Card className="bg-gray-900 border-gray-800 border-dashed">
      <CardContent className="p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
          {type === "courses" ? (
            <GraduationCap className="h-8 w-8 text-gray-600" />
          ) : (
            <BookOpen className="h-8 w-8 text-gray-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No {type === "courses" ? "Courses" : "Books"} Available
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {type === "courses" 
            ? "Be the first to create and sell a recovery course!"
            : "Be the first to publish and sell your recovery book!"}
        </p>
        <Button 
          className="bg-orange-600 hover:bg-orange-700" 
          data-testid={`button-create-first-${type}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {type === "courses" ? "Create Course" : "Publish Book"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SRAMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: listings = [], isLoading, error } = useQuery<MarketplaceListing[]>({
    queryKey: ['/api/sra/marketplace/listings'],
  });

  const courses = listings.filter(listing => listing.productType === "course");
  const books = listings.filter(listing => listing.productType === "book");

  const filteredCourses = searchQuery
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const filteredBooks = searchQuery
    ? books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  const dynamicCategories = [
    { id: "all", name: "All", count: listings.length },
    { id: "courses", name: "Courses", count: courses.length },
    { id: "books", name: "Books", count: books.length },
    { id: "exercises", name: "Exercise Programs", count: listings.filter(l => l.category === "exercise").length },
  ];

  return (
    <>
      <Helmet>
        <title>Marketplace | Buy & Sell Recovery Content | Stroke Recovery Academy</title>
        <meta name="description" content="Browse and purchase stroke recovery books, courses, and programs. Therapists and survivors can sell their content globally." />
        <meta property="og:title" content="Recovery Marketplace | Stroke Recovery Academy" />
        <meta property="og:description" content="Discover courses, books, and programs from stroke survivors and therapists worldwide." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
                    <h1 className="text-lg md:text-xl font-bold" data-testid="text-title">Recovery Marketplace</h1>
                    <p className="text-xs md:text-sm text-gray-400">Books, Courses & Programs</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-gray-700" data-testid="button-sell">
                  <Upload className="h-4 w-4 mr-2" />
                  Sell Your Content
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-cart">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <Badge className="bg-orange-600 mb-3">Global Marketplace</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-hero">
                  Learn from Survivors & Experts
                </h2>
                <p className="text-gray-300 mb-4">
                  Discover courses, books, and recovery programs created by stroke survivors and healthcare professionals worldwide.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    <span>Sell Globally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Earn 80% Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>12K+ Customers</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-center gap-4">
                <img src={sosLogo} alt="SOS" className="h-20 w-20 opacity-50" />
                <img src={strokeLyfePublishingLogo} alt="Stroke Lyfe Publishing" className="h-20 w-20 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, courses, programs..."
                className="pl-10 bg-gray-900 border-gray-700"
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" className="border-gray-700" data-testid="button-filter">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {dynamicCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? "bg-orange-600 hover:bg-orange-700" : "border-gray-700"}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.name}
                <Badge variant="secondary" className="ml-2 bg-gray-700 text-xs">
                  {cat.count}
                </Badge>
              </Button>
            ))}
          </div>

          <Tabs defaultValue="courses">
            <TabsList className="bg-gray-900 border border-gray-800 mb-6">
              <TabsTrigger value="courses" className="data-[state=active]:bg-orange-600" data-testid="tab-courses">
                <GraduationCap className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-orange-600" data-testid="tab-books">
                <BookOpen className="h-4 w-4 mr-2" />
                Books
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Featured Courses</h3>
                <p className="text-gray-400">Learn from the best recovery experts</p>
              </div>
              
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <EmptyState type="courses" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="bg-gray-900 border-gray-800 hover-elevate cursor-pointer" data-testid={`course-card-${course.id}`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                          {course.coverImageUrl ? (
                            <img 
                              src={course.coverImageUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PlayCircle className="h-12 w-12 text-gray-600" />
                          )}
                          {course.status === "published" && (
                            <Badge className="absolute top-2 left-2 bg-orange-600 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="text-xs">{course.subtitle || "Recovery Expert"}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(course.rating) || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">({(course.salesCount || 0).toLocaleString()})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" />
                            Course
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Self-paced
                          </span>
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-xs mb-3">
                          {course.category || "All Levels"}
                        </Badge>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-orange-500">${Number(course.price).toFixed(2)}</span>
                          {course.compareAtPrice && Number(course.compareAtPrice) > Number(course.price) && (
                            <span className="text-sm text-gray-500 line-through ml-2">${Number(course.compareAtPrice).toFixed(2)}</span>
                          )}
                        </div>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700" data-testid={`button-buy-course-${course.id}`}>
                          Enroll
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Become an Instructor */}
              <Card className="bg-gradient-to-r from-green-600/20 to-green-500/10 border-green-600/30 mt-8">
                <CardContent className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <Badge className="bg-green-600 mb-3">Earn Money</Badge>
                      <h3 className="text-xl md:text-2xl font-bold mb-3">Create & Sell Your Course</h3>
                      <p className="text-gray-300 mb-4">
                        Share your expertise with stroke survivors worldwide. Therapists, survivors, and caregivers can create and sell courses on our platform.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>Keep 80% of sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-500" />
                          <span>Reach global audience</span>
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-course">
                        <Plus className="h-4 w-4 mr-2" />
                        Start Creating
                      </Button>
                    </div>
                    <div className="hidden md:block text-center">
                      <GraduationCap className="h-24 w-24 text-green-500 mx-auto opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Featured Books</h3>
                <p className="text-gray-400">Stories and guides from the recovery community</p>
              </div>
              
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3].map((i) => (
                    <BookCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <EmptyState type="books" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredBooks.map((book) => (
                    <Card key={book.id} className="bg-gray-900 border-gray-800 hover-elevate cursor-pointer" data-testid={`book-card-${book.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-36 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {book.coverImageUrl ? (
                              <img 
                                src={book.coverImageUrl} 
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-10 w-10 text-gray-600" />
                            )}
                            {book.status === "published" && (
                              <Badge className="absolute -top-2 -right-2 bg-orange-600 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <Badge variant="outline" className="border-gray-600 text-xs mb-2">
                              {book.category || "Recovery"}
                            </Badge>
                            <h4 className="font-semibold line-clamp-2">{book.title}</h4>
                            <p className="text-sm text-gray-400 mb-2">by {book.subtitle || "Anonymous"}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(book.rating) || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">({book.reviewCount || 0})</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-orange-500">${Number(book.price).toFixed(2)}</span>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" data-testid={`button-buy-book-${book.id}`}>
                                Buy Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Publish Your Book */}
              <Card className="bg-gradient-to-r from-purple-600/20 to-purple-500/10 border-purple-600/30 mt-8">
                <CardContent className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <Badge className="bg-purple-600 mb-3">Stroke Lyfe Publishing</Badge>
                      <h3 className="text-xl md:text-2xl font-bold mb-3">Publish Your Recovery Story</h3>
                      <p className="text-gray-300 mb-4">
                        Write your book with AI assistance and publish to Amazon KDP with one click. Sell on our marketplace and reach the global recovery community.
                      </p>
                      <Link href="/sra/ghostwriting">
                        <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-write-book">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Start Writing
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <img src={strokeLyfePublishingLogo} alt="Stroke Lyfe Publishing" className="h-32 w-32 opacity-75" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-4">
                <TrendingUp className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold" data-testid="stat-sales">$2.4M</div>
                <p className="text-xs text-gray-400">Creator Earnings</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-4">
                <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold" data-testid="stat-creators">847</div>
                <p className="text-xs text-gray-400">Creators</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-4">
                <GraduationCap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold" data-testid="stat-courses">{listings.length || 156}</div>
                <p className="text-xs text-gray-400">Products</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-4">
                <Globe className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold" data-testid="stat-countries">42</div>
                <p className="text-xs text-gray-400">Countries</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
