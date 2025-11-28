import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronRight, 
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  CheckCircle,
  WashingMachine,
  Wind,
  Settings,
  HelpCircle,
  MessageSquare,
  BookOpen,
  Tool,
  Clock,
  Target
} from "lucide-react";

interface ErrorCodeDetail {
  id: number;
  code: string;
  manufacturer: string;
  slug: string;
  title: string;
  description: string;
  severity: string;
  machineType: string;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  requiredParts?: string[];
  skillLevel: string;
  metaTitle?: string;
  metaDescription?: string;
}

function getSeverityDetails(severity: string) {
  switch (severity) {
    case "critical":
      return { 
        icon: <AlertTriangle className="h-5 w-5" />, 
        color: "text-red-500", 
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        label: "Critical - Immediate Attention Required"
      };
    case "high":
      return { 
        icon: <AlertCircle className="h-5 w-5" />, 
        color: "text-orange-500", 
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        label: "High Priority"
      };
    case "medium":
      return { 
        icon: <Info className="h-5 w-5" />, 
        color: "text-yellow-500", 
        bg: "bg-yellow-50 dark:bg-yellow-950",
        border: "border-yellow-200 dark:border-yellow-800",
        label: "Medium Priority"
      };
    default:
      return { 
        icon: <Info className="h-5 w-5" />, 
        color: "text-blue-500", 
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        label: "Low Priority"
      };
  }
}

function getMachineTypeDetails(machineType: string) {
  switch (machineType) {
    case "washer":
      return { icon: <WashingMachine className="h-5 w-5" />, label: "Washer" };
    case "dryer":
      return { icon: <Wind className="h-5 w-5" />, label: "Dryer" };
    default:
      return { icon: <Settings className="h-5 w-5" />, label: "Washer/Dryer" };
  }
}

function getSkillLevelDetails(skillLevel: string) {
  switch (skillLevel) {
    case "beginner":
      return { 
        color: "text-green-500", 
        bg: "bg-green-100 dark:bg-green-900",
        label: "Beginner - Basic Tools Only"
      };
    case "intermediate":
      return { 
        color: "text-yellow-500", 
        bg: "bg-yellow-100 dark:bg-yellow-900",
        label: "Intermediate - Some Experience Required"
      };
    case "advanced":
      return { 
        color: "text-red-500", 
        bg: "bg-red-100 dark:bg-red-900",
        label: "Advanced - Professional Recommended"
      };
    default:
      return { 
        color: "text-gray-500", 
        bg: "bg-gray-100 dark:bg-gray-900",
        label: skillLevel
      };
  }
}

export default function ErrorCodeDetailPage() {
  const [, params] = useRoute("/error-codes/:slug");
  const slug = params?.slug;

  const { data, isLoading, error } = useQuery<{
    code: ErrorCodeDetail;
    relatedCodes: ErrorCodeDetail[];
  }>({
    queryKey: ["/api/error-codes/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/error-codes/slug/${slug}`);
      if (!res.ok) throw new Error("Error code not found");
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.code) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Error Code Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The error code you're looking for doesn't exist in our database.
              </p>
              <Link href="/error-codes">
                <Button data-testid="button-back-to-search">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Error Code Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { code, relatedCodes } = data;
  const severityDetails = getSeverityDetails(code.severity);
  const machineTypeDetails = getMachineTypeDetails(code.machineType);
  const skillLevelDetails = getSkillLevelDetails(code.skillLevel);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What does ${code.manufacturer} error code ${code.code} mean?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.description
        }
      },
      {
        "@type": "Question",
        "name": `How do I fix ${code.manufacturer} error code ${code.code}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.troubleshootingSteps.join(" ")
        }
      },
      {
        "@type": "Question",
        "name": `What causes ${code.manufacturer} error code ${code.code}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.possibleCauses.join(", ")
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Fix ${code.manufacturer} Error Code ${code.code}`,
    "description": code.description,
    "totalTime": "PT30M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0-500"
    },
    "tool": [
      { "@type": "HowToTool", "name": "Multimeter" },
      { "@type": "HowToTool", "name": "Screwdriver set" }
    ],
    "step": code.troubleshootingSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://washbizhub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Error Codes",
        "item": "https://washbizhub.com/error-codes"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": code.manufacturer,
        "item": `https://washbizhub.com/error-codes?manufacturer=${encodeURIComponent(code.manufacturer)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `${code.code} - ${code.title}`,
        "item": `https://washbizhub.com/error-codes/${code.slug}`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{code.metaTitle || `${code.manufacturer} ${code.code} Error Code - Troubleshooting & Fix | WashBizHub`}</title>
        <meta 
          name="description" 
          content={code.metaDescription || `How to fix ${code.manufacturer} error code ${code.code}: ${code.title}. Step-by-step troubleshooting guide, common causes, and repair solutions.`}
        />
        <meta name="keywords" content={`${code.manufacturer} ${code.code}, ${code.manufacturer} error code, ${code.title}, laundry equipment troubleshooting, ${code.machineType} repair`} />
        <link rel="canonical" href={`https://washbizhub.com/error-codes/${code.slug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 mb-6 text-sm flex-wrap" aria-label="Breadcrumb">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-home">
                Home
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href="/error-codes">
              <Button variant="ghost" size="sm" data-testid="button-error-codes">
                Error Codes
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href={`/error-codes?manufacturer=${encodeURIComponent(code.manufacturer)}`}>
              <Button variant="ghost" size="sm" data-testid="button-manufacturer">
                {code.manufacturer}
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{code.code}</span>
          </nav>

          <div className={`${severityDetails.bg} ${severityDetails.border} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <div className={severityDetails.color}>
                {severityDetails.icon}
              </div>
              <div>
                <span className={`font-semibold ${severityDetails.color}`}>
                  {severityDetails.label}
                </span>
                {code.severity === "critical" && (
                  <p className="text-sm text-muted-foreground">
                    This error may cause equipment damage or safety hazards if not addressed immediately.
                  </p>
                )}
              </div>
            </div>
          </div>

          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className="text-lg font-mono px-3 py-1" data-testid="badge-error-code">
                {code.code}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                {machineTypeDetails.icon}
                {machineTypeDetails.label}
              </Badge>
              <Badge variant="secondary">
                {code.manufacturer}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-error-title">
              {code.manufacturer} Error Code {code.code}: {code.title}
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-error-description">
              {code.description}
            </p>
          </header>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Possible Causes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" data-testid="list-possible-causes">
                  {code.possibleCauses.map((cause, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Troubleshooting Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-md ${skillLevelDetails.bg}`}>
                  <Target className={`h-4 w-4 ${skillLevelDetails.color}`} />
                  <span className="text-sm font-medium">{skillLevelDetails.label}</span>
                </div>
                <ol className="space-y-4" data-testid="list-troubleshooting-steps">
                  {code.troubleshootingSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="pt-1">
                        <p>{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {code.requiredParts && code.requiredParts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tool className="h-5 w-5 text-primary" />
                    Parts That May Need Replacement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {code.requiredParts.map((part, index) => (
                      <Badge key={index} variant="outline">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Need More Help?
                    </h3>
                    <p className="text-muted-foreground">
                      Chat with our AI Service Guy for personalized troubleshooting assistance.
                    </p>
                  </div>
                  <Link href="/service-guy-ai">
                    <Button data-testid="button-service-guy">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Service Guy AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {relatedCodes && relatedCodes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Other {code.manufacturer} Error Codes
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCodes.map((related) => (
                  <Link key={related.id} href={`/error-codes/${related.slug}`}>
                    <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-related-${related.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="font-mono font-bold text-primary">
                            {related.code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {related.severity}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm">{related.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/error-codes">
              <Button variant="outline" data-testid="button-back-search">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Error Code Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
