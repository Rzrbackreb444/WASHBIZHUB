/**
 * E-E-A-T OPTIMIZATION (Google's #1 Ranking Factor!)
 * 
 * Experience, Expertise, Authoritativeness, Trustworthiness
 * 
 * This is what separates #1 rankings from everyone else!
 * Features:
 * - Experience signals detection
 * - Expertise indicators (credentials, certifications)
 * - Authoritativeness scoring (citations, backlinks, media mentions)
 * - Trustworthiness validation (HTTPS, contact info, reviews, transparency)
 * - Author bio optimization
 * - About page analysis
 * - Trust badge detection
 */

export interface EEATScore {
  totalScore: number; // 0-100
  experience: ExperienceScore;
  expertise: ExpertiseScore;
  authoritativeness: AuthoritativenessScore;
  trustworthiness: TrustworthinessScore;
  recommendations: string[];
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
}

export interface ExperienceScore {
  score: number; // 0-25
  hasFirstHandExperience: boolean;
  hasPhotos: boolean;
  hasVideos: boolean;
  hasTestimonials: boolean;
  hasCaseStudies: boolean;
  hasBeforeAfter: boolean;
  issues: string[];
}

export interface ExpertiseScore {
  score: number; // 0-25
  hasAuthorBio: boolean;
  hasCredentials: boolean;
  hasCertifications: boolean;
  hasYearsExperience: boolean;
  hasEducation: boolean;
  hasPublications: boolean;
  issues: string[];
}

export interface AuthoritativenessScore {
  score: number; // 0-25
  backlinksFromAuthorities: number;
  mediaMentions: number;
  industryAwards: boolean;
  speakingEngagements: boolean;
  pressReleases: number;
  wikipediaPresence: boolean;
  issues: string[];
}

export interface TrustworthinessScore {
  score: number; // 0-25
  hasHTTPS: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasContactInfo: boolean;
  hasPhysicalAddress: boolean;
  hasBusinessRegistration: boolean;
  hasReviews: boolean;
  avgReviewRating: number;
  hasTrustBadges: boolean;
  hasSecurityBadges: boolean;
  issues: string[];
}

/**
 * Analyze E-E-A-T signals
 */
export function analyzeEEAT(html: string, url: string): EEATScore {
  const experience = analyzeExperience(html);
  const expertise = analyzeExpertise(html);
  const authoritativeness = analyzeAuthoritativeness(html, url);
  const trustworthiness = analyzeTrustworthiness(html, url);

  const totalScore = Math.round(
    experience.score + expertise.score + authoritativeness.score + trustworthiness.score
  );

  let grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F" = "F";
  if (totalScore >= 95) grade = "A+";
  else if (totalScore >= 90) grade = "A";
  else if (totalScore >= 85) grade = "B+";
  else if (totalScore >= 75) grade = "B";
  else if (totalScore >= 65) grade = "C";
  else if (totalScore >= 50) grade = "D";

  const recommendations = generateEEATRecommendations({
    experience,
    expertise,
    authoritativeness,
    trustworthiness,
  });

  return {
    totalScore,
    experience,
    expertise,
    authoritativeness,
    trustworthiness,
    recommendations,
    grade,
  };
}

/**
 * Analyze Experience signals
 */
function analyzeExperience(html: string): ExperienceScore {
  const text = html.toLowerCase();
  
  // First-hand experience indicators
  const experienceKeywords = [
    "we tested", "our experience", "in our testing", "we found",
    "we tried", "our results", "we measured", "we observed",
    "i tested", "i tried", "my experience", "hands-on",
  ];
  
  const hasFirstHandExperience = experienceKeywords.some(kw => text.includes(kw));
  
  // Visual proof
  const hasPhotos = (html.match(/<img/gi) || []).length >= 3;
  const hasVideos = html.includes("<video") || html.includes("youtube.com") || html.includes("vimeo.com");
  
  // Social proof
  const hasTestimonials = text.includes("testimonial") || text.includes("customer review");
  const hasCaseStudies = text.includes("case study") || text.includes("success story");
  const hasBeforeAfter = text.includes("before") && text.includes("after");

  const issues: string[] = [];
  if (!hasFirstHandExperience) issues.push("Add first-hand experience (testing, trials, personal use)");
  if (!hasPhotos) issues.push("Include photos showing actual use/results");
  if (!hasVideos) issues.push("Add video demonstrations or walkthroughs");
  if (!hasTestimonials) issues.push("Add customer testimonials or reviews");
  if (!hasCaseStudies) issues.push("Create case studies showing real results");

  let score = 0;
  if (hasFirstHandExperience) score += 8;
  if (hasPhotos) score += 5;
  if (hasVideos) score += 5;
  if (hasTestimonials) score += 4;
  if (hasCaseStudies) score += 2;
  if (hasBeforeAfter) score += 1;

  return {
    score,
    hasFirstHandExperience,
    hasPhotos,
    hasVideos,
    hasTestimonials,
    hasCaseStudies,
    hasBeforeAfter,
    issues,
  };
}

/**
 * Analyze Expertise signals
 */
function analyzeExpertise(html: string): ExpertiseScore {
  const text = html.toLowerCase();
  
  // Author bio
  const hasAuthorBio = text.includes("author") || text.includes("written by") || text.includes("by:");
  
  // Credentials
  const credentialKeywords = [
    "certified", "licensed", "accredited", "qualified",
    "phd", "master's", "bachelor's", "degree", "mba",
    "cpa", "cfa", "pe", "md", "dvm", "jd",
  ];
  const hasCredentials = credentialKeywords.some(kw => text.includes(kw));
  
  // Certifications
  const hasCertifications = text.includes("certification") || text.includes("certified");
  
  // Years of experience
  const hasYearsExperience = /(\d+)\s*(years?|yrs?)/.test(text);
  
  // Education
  const hasEducation = text.includes("university") || text.includes("college") || text.includes("education");
  
  // Publications
  const hasPublications = text.includes("published in") || text.includes("featured in");

  const issues: string[] = [];
  if (!hasAuthorBio) issues.push("Add comprehensive author bio with credentials");
  if (!hasCredentials) issues.push("Highlight relevant credentials and qualifications");
  if (!hasCertifications) issues.push("Display professional certifications");
  if (!hasYearsExperience) issues.push("Mention years of experience in the field");
  if (!hasEducation) issues.push("Include educational background");
  if (!hasPublications) issues.push("Reference publications or media features");

  let score = 0;
  if (hasAuthorBio) score += 8;
  if (hasCredentials) score += 6;
  if (hasCertifications) score += 4;
  if (hasYearsExperience) score += 3;
  if (hasEducation) score += 2;
  if (hasPublications) score += 2;

  return {
    score,
    hasAuthorBio,
    hasCredentials,
    hasCertifications,
    hasYearsExperience,
    hasEducation,
    hasPublications,
    issues,
  };
}

/**
 * Analyze Authoritativeness signals
 */
function analyzeAuthoritativeness(html: string, url: string): AuthoritativenessScore {
  const text = html.toLowerCase();
  
  // Count authoritative backlink indicators
  const authDomains = [".gov", ".edu", "wikipedia.org", "forbes.com", "entrepreneur.com"];
  const backlinksFromAuthorities = authDomains.reduce((count, domain) => {
    return count + (html.match(new RegExp(domain, "gi")) || []).length;
  }, 0);
  
  // Media mentions
  const mediaMentions = (text.match(/featured in|mentioned in|covered by|press/g) || []).length;
  
  // Industry recognition
  const industryAwards = text.includes("award") || text.includes("recognition");
  const speakingEngagements = text.includes("speaker") || text.includes("conference") || text.includes("keynote");
  
  // Press
  const pressReleases = (text.match(/press release|media kit/g) || []).length;
  
  // Wikipedia
  const wikipediaPresence = text.includes("wikipedia");

  const issues: string[] = [];
  if (backlinksFromAuthorities === 0) issues.push("Earn backlinks from .gov, .edu, or authority sites");
  if (mediaMentions === 0) issues.push("Get featured in industry publications");
  if (!industryAwards) issues.push("Pursue industry awards and recognition");
  if (!speakingEngagements) issues.push("Speak at conferences or webinars");
  if (pressReleases === 0) issues.push("Create press releases for major milestones");
  if (!wikipediaPresence) issues.push("Build Wikipedia presence for brand");

  let score = 0;
  score += Math.min(10, backlinksFromAuthorities * 2);
  score += Math.min(5, mediaMentions);
  if (industryAwards) score += 4;
  if (speakingEngagements) score += 3;
  if (pressReleases > 0) score += 2;
  if (wikipediaPresence) score += 1;

  return {
    score,
    backlinksFromAuthorities,
    mediaMentions,
    industryAwards,
    speakingEngagements,
    pressReleases,
    wikipediaPresence,
    issues,
  };
}

/**
 * Analyze Trustworthiness signals
 */
function analyzeTrustworthiness(html: string, url: string): TrustworthinessScore {
  const text = html.toLowerCase();
  
  // Security
  const hasHTTPS = url.startsWith("https://");
  
  // Legal pages
  const hasPrivacyPolicy = text.includes("privacy policy") || html.includes("/privacy");
  const hasTermsOfService = text.includes("terms of service") || text.includes("terms & conditions");
  
  // Contact information
  const hasContactInfo = text.includes("contact us") || text.includes("email:") || text.includes("phone:");
  const hasPhysicalAddress = /\d+\s+[\w\s]+\,\s+[A-Z]{2}\s+\d{5}/.test(html);
  
  // Business verification
  const hasBusinessRegistration = text.includes("registered business") || text.includes("ein:");
  
  // Reviews
  const hasReviews = text.includes("review") || text.includes("rating") || text.includes("stars");
  const ratingMatch = html.match(/(\d\.\d)\s*(stars?|out of 5)/i);
  const avgReviewRating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
  
  // Trust indicators
  const hasTrustBadges = text.includes("bbb accredited") || text.includes("better business bureau");
  const hasSecurityBadges = text.includes("ssl") || text.includes("mcafee") || text.includes("norton");

  const issues: string[] = [];
  if (!hasHTTPS) issues.push("🔴 CRITICAL: Enable HTTPS immediately");
  if (!hasPrivacyPolicy) issues.push("Add comprehensive privacy policy");
  if (!hasTermsOfService) issues.push("Create terms of service page");
  if (!hasContactInfo) issues.push("Display clear contact information");
  if (!hasPhysicalAddress) issues.push("Show physical business address");
  if (!hasBusinessRegistration) issues.push("Display business registration/license");
  if (!hasReviews) issues.push("Collect and display customer reviews");
  if (avgReviewRating < 4.0 && avgReviewRating > 0) issues.push("Improve review ratings (target 4.5+)");
  if (!hasTrustBadges) issues.push("Add trust badges (BBB, industry associations)");
  if (!hasSecurityBadges) issues.push("Display security badges");

  let score = 0;
  if (hasHTTPS) score += 10; // Critical!
  if (hasPrivacyPolicy) score += 3;
  if (hasTermsOfService) score += 2;
  if (hasContactInfo) score += 3;
  if (hasPhysicalAddress) score += 2;
  if (hasBusinessRegistration) score += 1;
  if (hasReviews) score += 2;
  if (avgReviewRating >= 4.5) score += 2;
  if (hasTrustBadges) score += 1;
  if (hasSecurityBadges) score += 1;

  return {
    score,
    hasHTTPS,
    hasPrivacyPolicy,
    hasTermsOfService,
    hasContactInfo,
    hasPhysicalAddress,
    hasBusinessRegistration,
    hasReviews,
    avgReviewRating,
    hasTrustBadges,
    hasSecurityBadges,
    issues,
  };
}

/**
 * Generate E-E-A-T recommendations
 */
function generateEEATRecommendations(analysis: {
  experience: ExperienceScore;
  expertise: ExpertiseScore;
  authoritativeness: AuthoritativenessScore;
  trustworthiness: TrustworthinessScore;
}): string[] {
  const recommendations: string[] = [];

  // Combine all issues
  const allIssues = [
    ...analysis.experience.issues,
    ...analysis.expertise.issues,
    ...analysis.authoritativeness.issues,
    ...analysis.trustworthiness.issues,
  ];

  // Prioritize by impact
  const critical = allIssues.filter(i => i.includes("🔴") || i.includes("CRITICAL"));
  const high = allIssues.filter(i => i.includes("HTTPS") || i.includes("first-hand") || i.includes("author bio"));
  const medium = allIssues.filter(i => !critical.includes(i) && !high.includes(i));

  recommendations.push(...critical);
  recommendations.push(...high.slice(0, 3));
  recommendations.push(...medium.slice(0, 5));

  // Add positive reinforcement
  if (analysis.experience.score >= 20) {
    recommendations.push("✅ Strong experience signals detected");
  }
  if (analysis.expertise.score >= 20) {
    recommendations.push("✅ Excellent expertise indicators");
  }
  if (analysis.authoritativeness.score >= 20) {
    recommendations.push("✅ High authoritativeness");
  }
  if (analysis.trustworthiness.score >= 20) {
    recommendations.push("✅ Trustworthy site signals");
  }

  return recommendations.slice(0, 10);
}

/**
 * Generate E-E-A-T schema markup
 */
export function generateEEATSchema(author: {
  name: string;
  credentials: string[];
  bio: string;
  imageUrl?: string;
  sameAs?: string[]; // Social profiles
}): any {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    image: author.imageUrl,
    sameAs: author.sameAs || [],
    knowsAbout: author.credentials,
  };
}

/**
 * Generate Organization schema for trust
 */
export function generateOrganizationSchema(org: {
  name: string;
  description: string;
  url: string;
  logo: string;
  address?: string;
  phone?: string;
  email?: string;
}): any {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: org.phone,
      email: org.email,
      contactType: "customer service",
    },
    address: org.address
      ? {
          "@type": "PostalAddress",
          streetAddress: org.address,
        }
      : undefined,
  };
}
