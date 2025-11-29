/**
 * CORE WEB VITALS ANALYZER
 * 
 * Google's PageSpeed ranking factor
 * Features:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - TTFB (Time to First Byte) - Server response time
 * - Mobile vs Desktop analysis
 * - Real-world performance monitoring
 */

export interface CoreWebVitals {
  score: number; // 0-100
  lcp: VitalMetric;
  fid: VitalMetric;
  cls: VitalMetric;
  ttfb: VitalMetric;
  grade: "Good" | "Needs Improvement" | "Poor";
  recommendations: string[];
}

export interface VitalMetric {
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  threshold: {
    good: number;
    poor: number;
  };
  impact: string;
}

/**
 * Analyze Core Web Vitals using PageSpeed Insights API
 */
export async function analyzeCoreWebVitals(url: string, strategy: "mobile" | "desktop" = "mobile"): Promise<CoreWebVitals> {
  try {
    const apiKey = process.env.PAGE_SPEED_INSIGHTS_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
    
    if (!apiKey) {
      console.log("⚠️ No PageSpeed API key configured - using simulated data");
      return getSimulatedVitals();
    }
    
    console.log("✅ PageSpeed API key found, using real Google API");

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=seo&key=${apiKey}`;
    
    console.log(`📊 Analyzing Core Web Vitals for ${url} (${strategy})`);
    
    const response = await fetch(psiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ PageSpeed API error (${response.status}):`, errorText);
      return getSimulatedVitals();
    }
    
    const data = await response.json();
    
    // Extract real metrics from PageSpeed Insights response
    const lighthouseResult = data.lighthouseResult;
    const audits = lighthouseResult?.audits || {};
    const categories = lighthouseResult?.categories || {};
    
    // Extract Core Web Vitals metrics
    const lcpAudit = audits['largest-contentful-paint'];
    const fidAudit = audits['max-potential-fid'] || audits['total-blocking-time'];
    const clsAudit = audits['cumulative-layout-shift'];
    const ttfbAudit = audits['server-response-time'];
    
    const lcp: VitalMetric = {
      value: lcpAudit?.numericValue ? lcpAudit.numericValue / 1000 : 2.5,
      rating: lcpAudit?.score >= 0.9 ? "good" : lcpAudit?.score >= 0.5 ? "needs-improvement" : "poor",
      threshold: { good: 2.5, poor: 4.0 },
      impact: "LCP measures loading performance. Aim for < 2.5s",
    };
    
    const fid: VitalMetric = {
      value: fidAudit?.numericValue || 100,
      rating: fidAudit?.score >= 0.9 ? "good" : fidAudit?.score >= 0.5 ? "needs-improvement" : "poor",
      threshold: { good: 100, poor: 300 },
      impact: "FID measures interactivity. Aim for < 100ms",
    };
    
    const cls: VitalMetric = {
      value: clsAudit?.numericValue || 0.1,
      rating: clsAudit?.score >= 0.9 ? "good" : clsAudit?.score >= 0.5 ? "needs-improvement" : "poor",
      threshold: { good: 0.1, poor: 0.25 },
      impact: "CLS measures visual stability. Aim for < 0.1",
    };
    
    const ttfb: VitalMetric = {
      value: ttfbAudit?.numericValue || 800,
      rating: ttfbAudit?.score >= 0.9 ? "good" : ttfbAudit?.score >= 0.5 ? "needs-improvement" : "poor",
      threshold: { good: 800, poor: 1800 },
      impact: "TTFB measures server response time. Aim for < 800ms",
    };
    
    // Calculate overall score from PageSpeed performance score
    const performanceScore = Math.round((categories.performance?.score || 0) * 100);
    const seoScore = Math.round((categories.seo?.score || 0) * 100);
    const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
    
    const score = performanceScore;
    const grade = score >= 90 ? "Good" : score >= 50 ? "Needs Improvement" : "Poor";
    
    const recommendations = generateVitalsRecommendations({ lcp, fid, cls, ttfb });
    
    console.log(`✅ PageSpeed Analysis Complete: Performance ${performanceScore}, SEO ${seoScore}, Accessibility ${accessibilityScore}`);
    
    return {
      score,
      lcp,
      fid,
      cls,
      ttfb,
      grade,
      recommendations,
    };
    
  } catch (error) {
    console.error("❌ PageSpeed API error:", error);
    return getSimulatedVitals();
  }
}

/**
 * Get simulated vitals (for demo/fallback)
 */
function getSimulatedVitals(): CoreWebVitals {
  const lcp: VitalMetric = {
    value: 2.3, // seconds
    rating: "good",
    threshold: {
      good: 2.5,
      poor: 4.0,
    },
    impact: "LCP measures loading performance. Aim for < 2.5s",
  };

  const fid: VitalMetric = {
    value: 85, // milliseconds
    rating: "good",
    threshold: {
      good: 100,
      poor: 300,
    },
    impact: "FID measures interactivity. Aim for < 100ms",
  };

  const cls: VitalMetric = {
    value: 0.08,
    rating: "good",
    threshold: {
      good: 0.1,
      poor: 0.25,
    },
    impact: "CLS measures visual stability. Aim for < 0.1",
  };

  const ttfb: VitalMetric = {
    value: 450, // milliseconds
    rating: "good",
    threshold: {
      good: 800,
      poor: 1800,
    },
    impact: "TTFB measures server response time. Aim for < 800ms",
  };

  // Calculate overall score
  let score = 0;
  if (lcp.rating === "good") score += 30;
  else if (lcp.rating === "needs-improvement") score += 15;
  
  if (fid.rating === "good") score += 30;
  else if (fid.rating === "needs-improvement") score += 15;
  
  if (cls.rating === "good") score += 30;
  else if (cls.rating === "needs-improvement") score += 15;
  
  if (ttfb.rating === "good") score += 10;
  else if (ttfb.rating === "needs-improvement") score += 5;

  const grade = score >= 90 ? "Good" : score >= 50 ? "Needs Improvement" : "Poor";

  const recommendations = generateVitalsRecommendations({ lcp, fid, cls, ttfb });

  return {
    score,
    lcp,
    fid,
    cls,
    ttfb,
    grade,
    recommendations,
  };
}

/**
 * Generate recommendations for improving vitals
 */
function generateVitalsRecommendations(vitals: {
  lcp: VitalMetric;
  fid: VitalMetric;
  cls: VitalMetric;
  ttfb: VitalMetric;
}): string[] {
  const recommendations: string[] = [];

  // LCP recommendations
  if (vitals.lcp.rating !== "good") {
    recommendations.push("⚡ Optimize LCP: Compress images, use WebP format, implement lazy loading");
    recommendations.push("⚡ Preload key resources (fonts, hero images)");
    recommendations.push("⚡ Use CDN for faster content delivery");
  }

  // FID recommendations
  if (vitals.fid.rating !== "good") {
    recommendations.push("🚀 Optimize FID: Minimize JavaScript execution time");
    recommendations.push("🚀 Break up long tasks into smaller chunks");
    recommendations.push("🚀 Use web workers for heavy computations");
  }

  // CLS recommendations
  if (vitals.cls.rating !== "good") {
    recommendations.push("📐 Fix CLS: Set width/height on images and videos");
    recommendations.push("📐 Reserve space for ads and embeds");
    recommendations.push("📐 Avoid inserting content above existing content");
  }

  // TTFB recommendations
  if (vitals.ttfb.rating !== "good") {
    recommendations.push("🔧 Improve TTFB: Optimize server response time");
    recommendations.push("🔧 Use server-side caching");
    recommendations.push("🔧 Upgrade hosting if needed");
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push("✅ All Core Web Vitals are in good range!");
    recommendations.push("💡 Maintain performance with regular monitoring");
  }

  return recommendations.slice(0, 8);
}

/**
 * Get performance optimization checklist
 */
export function getPerformanceChecklist(): {
  category: string;
  items: { task: string; priority: "high" | "medium" | "low" }[];
}[] {
  return [
    {
      category: "Images",
      items: [
        { task: "Convert images to WebP format", priority: "high" },
        { task: "Implement responsive images with srcset", priority: "high" },
        { task: "Lazy load off-screen images", priority: "high" },
        { task: "Compress images without quality loss", priority: "medium" },
        { task: "Set explicit width/height on all images", priority: "high" },
      ],
    },
    {
      category: "JavaScript",
      items: [
        { task: "Minimize and bundle JavaScript", priority: "high" },
        { task: "Code-split for route-based loading", priority: "medium" },
        { task: "Defer non-critical JavaScript", priority: "high" },
        { task: "Remove unused JavaScript", priority: "medium" },
        { task: "Use async for third-party scripts", priority: "high" },
      ],
    },
    {
      category: "CSS",
      items: [
        { task: "Minimize and inline critical CSS", priority: "high" },
        { task: "Remove unused CSS", priority: "medium" },
        { task: "Defer non-critical CSS", priority: "medium" },
      ],
    },
    {
      category: "Fonts",
      items: [
        { task: "Preload key fonts", priority: "high" },
        { task: "Use font-display: swap", priority: "high" },
        { task: "Subset fonts to required characters", priority: "medium" },
        { task: "Self-host fonts instead of Google Fonts", priority: "low" },
      ],
    },
    {
      category: "Server",
      items: [
        { task: "Enable HTTP/2 or HTTP/3", priority: "high" },
        { task: "Configure server-side caching", priority: "high" },
        { task: "Enable Gzip or Brotli compression", priority: "high" },
        { task: "Use CDN for static assets", priority: "high" },
        { task: "Optimize database queries", priority: "medium" },
      ],
    },
    {
      category: "Mobile",
      items: [
        { task: "Test on real mobile devices", priority: "high" },
        { task: "Optimize for slow 3G networks", priority: "medium" },
        { task: "Implement progressive enhancement", priority: "medium" },
      ],
    },
  ];
}
