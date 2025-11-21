import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  designs,
  cleanbiScores,
  blogPosts,
  calculatorScenarios,
  vendors,
  parts,
  affiliates,
  laundromats,
  courses,
  lessons,
  enrollments,
  bookChapters,
  bookAccess,
  aiBlogTasks,
  seoKeywords,
  competitorAnalysis,
  consultations,
  listings,
  distributors,
  distributorInquiries,
  affiliateContent,
  affiliateClicks,
  affiliateSales,
  affiliateCommissions,
  affiliatePayouts,
  templates,
  templateDownloads,
  resources,
  resourceUsage,
  vendorDirectory,
  vendorReviews,
  industryBenchmarks,
  type User,
  type InsertUser,
  type Design,
  type InsertDesign,
  type CleanbiScore,
  type InsertCleanbiScore,
  type BlogPost,
  type InsertBlogPost,
  type CalculatorScenario,
  type InsertCalculatorScenario,
  type Vendor,
  type InsertVendor,
  type Part,
  type InsertPart,
  type Affiliate,
  type InsertAffiliate,
  type Laundromat,
  type InsertLaundromat,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type BookChapter,
  type InsertBookChapter,
  type BookAccess,
  type InsertBookAccess,
  type AiBlogTask,
  type InsertAiBlogTask,
  type SeoKeyword,
  type InsertSeoKeyword,
  type CompetitorAnalysis,
  type InsertCompetitorAnalysis,
  type Consultation,
  type InsertConsultation,
  type Listing,
  type InsertListing,
  type Distributor,
  type InsertDistributor,
  type DistributorInquiry,
  type InsertDistributorInquiry,
  type AffiliateContent,
  type InsertAffiliateContent,
  type AffiliateClick,
  type InsertAffiliateClick,
  type AffiliateSale,
  type InsertAffiliateSale,
  type AffiliateCommission,
  type InsertAffiliateCommission,
  type AffiliatePayout,
  type InsertAffiliatePayout,
  type Template,
  type InsertTemplate,
  type TemplateDownload,
  type InsertTemplateDownload,
  type Resource,
  type InsertResource,
  type ResourceUsage,
  type InsertResourceUsage,
  type VendorDirectory,
  type InsertVendorDirectory,
  type VendorReview,
  type InsertVendorReview,
  type IndustryBenchmark,
  type InsertIndustryBenchmark,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // ============================================================================
  // USERS
  // ============================================================================
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserStripeInfo(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string
  ): Promise<User> {
    const result = await db
      .update(users)
      .set({ stripeCustomerId, stripeSubscriptionId, isPro: true })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  // ============================================================================
  // DESIGNS
  // ============================================================================
  async getDesigns(userId?: string): Promise<Design[]> {
    if (userId) {
      return db.select().from(designs).where(eq(designs.userId, userId)).orderBy(desc(designs.createdAt));
    }
    return db.select().from(designs).orderBy(desc(designs.createdAt));
  }

  async getDesign(id: string): Promise<Design | undefined> {
    const result = await db.select().from(designs).where(eq(designs.id, id));
    return result[0];
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    const result = await db.insert(designs).values(design).returning();
    return result[0];
  }

  async updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design> {
    const result = await db.update(designs).set(design).where(eq(designs.id, id)).returning();
    return result[0];
  }

  async deleteDesign(id: string): Promise<void> {
    await db.delete(designs).where(eq(designs.id, id));
  }

  // ============================================================================
  // CLEANBI SCORES
  // ============================================================================
  async getCleanbiScores(userId?: string): Promise<CleanbiScore[]> {
    if (userId) {
      return db.select().from(cleanbiScores).where(eq(cleanbiScores.userId, userId)).orderBy(desc(cleanbiScores.createdAt));
    }
    return db.select().from(cleanbiScores).orderBy(desc(cleanbiScores.createdAt));
  }

  async getCleanbiScore(id: string): Promise<CleanbiScore | undefined> {
    const result = await db.select().from(cleanbiScores).where(eq(cleanbiScores.id, id));
    return result[0];
  }

  async createCleanbiScore(score: InsertCleanbiScore): Promise<CleanbiScore> {
    const result = await db.insert(cleanbiScores).values(score).returning();
    return result[0];
  }

  // ============================================================================
  // BLOG POSTS
  // ============================================================================
  async getBlogPosts(filters?: { type?: string; category?: string }): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (filters?.type || filters?.category) {
      const conditions = [];
      if (filters.type) conditions.push(eq(blogPosts.type, filters.type));
      if (filters.category) conditions.push(eq(blogPosts.category, filters.category));
      return query.where(and(...conditions)).orderBy(desc(blogPosts.createdAt));
    }
    
    return query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const result = await db.update(blogPosts).set(post).where(eq(blogPosts.id, id)).returning();
    return result[0];
  }

  async incrementBlogViews(id: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
  }

  // ============================================================================
  // CALCULATOR SCENARIOS
  // ============================================================================
  async getCalculatorScenarios(userId?: string): Promise<CalculatorScenario[]> {
    if (userId) {
      return db.select().from(calculatorScenarios).where(eq(calculatorScenarios.userId, userId)).orderBy(desc(calculatorScenarios.createdAt));
    }
    return db.select().from(calculatorScenarios).orderBy(desc(calculatorScenarios.createdAt));
  }

  async getCalculatorScenario(id: string): Promise<CalculatorScenario | undefined> {
    const result = await db.select().from(calculatorScenarios).where(eq(calculatorScenarios.id, id));
    return result[0];
  }

  async createCalculatorScenario(scenario: InsertCalculatorScenario): Promise<CalculatorScenario> {
    const result = await db.insert(calculatorScenarios).values(scenario).returning();
    return result[0];
  }

  async deleteCalculatorScenario(id: string): Promise<void> {
    await db.delete(calculatorScenarios).where(eq(calculatorScenarios.id, id));
  }

  // ============================================================================
  // VENDORS
  // ============================================================================
  async getVendors(category?: string): Promise<Vendor[]> {
    if (category) {
      return db.select().from(vendors).where(eq(vendors.category, category)).orderBy(desc(vendors.verified));
    }
    return db.select().from(vendors).orderBy(desc(vendors.verified));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    return result[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  // ============================================================================
  // PARTS
  // ============================================================================
  async getParts(filters?: { category?: string; vendorId?: string }): Promise<Part[]> {
    let query = db.select().from(parts);
    
    if (filters?.category || filters?.vendorId) {
      const conditions = [];
      if (filters.category) conditions.push(eq(parts.category, filters.category));
      if (filters.vendorId) conditions.push(eq(parts.vendorId, filters.vendorId));
      return query.where(and(...conditions));
    }
    
    return query;
  }

  async getPart(id: string): Promise<Part | undefined> {
    const result = await db.select().from(parts).where(eq(parts.id, id));
    return result[0];
  }

  async createPart(part: InsertPart): Promise<Part> {
    const result = await db.insert(parts).values(part).returning();
    return result[0];
  }

  // ============================================================================
  // AFFILIATES
  // ============================================================================
  async getAffiliates(userId?: string): Promise<Affiliate[]> {
    if (userId) {
      return db.select().from(affiliates).where(eq(affiliates.userId, userId));
    }
    return db.select().from(affiliates);
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const result = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return result[0];
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code));
    return result[0];
  }

  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    const result = await db.insert(affiliates).values(affiliate).returning();
    return result[0];
  }

  // Legacy tracking methods (replaced by comprehensive system below)
  async trackAffiliateClickSimple(affiliateId: string): Promise<void> {
    await db
      .update(affiliates)
      .set({ totalClicks: sql`${affiliates.totalClicks} + 1` })
      .where(eq(affiliates.id, affiliateId));
  }

  async trackAffiliateSaleSimple(affiliateId: string, saleAmount: number): Promise<void> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) return;
    
    const commission = (saleAmount * parseFloat(affiliate.commissionRate)) / 100;
    
    await db
      .update(affiliates)
      .set({
        totalSales: sql`${affiliates.totalSales} + 1`,
        totalEarnings: sql`${affiliates.totalEarnings} + ${commission}`,
      })
      .where(eq(affiliates.id, affiliateId));
  }

  // ============================================================================
  // LAUNDROMATS
  // ============================================================================
  async getLaundromats(filters?: { city?: string; state?: string; zipCode?: string }): Promise<Laundromat[]> {
    let query = db.select().from(laundromats);
    
    if (filters) {
      const conditions = [];
      if (filters.city) conditions.push(sql`LOWER(${laundromats.city}) LIKE LOWER(${'%' + filters.city + '%'})`);
      if (filters.state) conditions.push(eq(laundromats.state, filters.state));
      if (filters.zipCode) conditions.push(eq(laundromats.zipCode, filters.zipCode));
      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
    }
    
    return query;
  }

  async getLaundromat(id: string): Promise<Laundromat | undefined> {
    const result = await db.select().from(laundromats).where(eq(laundromats.id, id));
    return result[0];
  }

  async createLaundromat(laundromat: InsertLaundromat): Promise<Laundromat> {
    const result = await db.insert(laundromats).values(laundromat).returning();
    return result[0];
  }

  // ============================================================================
  // COURSES (PREMIUM LEARNING PLATFORM)
  // ============================================================================
  async getCourses(filters?: { category?: string; published?: boolean }): Promise<Course[]> {
    let query = db.select().from(courses);
    
    if (filters) {
      const conditions = [];
      if (filters.category) conditions.push(eq(courses.category, filters.category));
      if (filters.published !== undefined) conditions.push(eq(courses.published, filters.published));
      if (conditions.length > 0) {
        return query.where(and(...conditions)).orderBy(desc(courses.featured), desc(courses.createdAt));
      }
    }
    
    return query.orderBy(desc(courses.featured), desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const result = await db.insert(courses).values(course).returning();
    return result[0];
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const result = await db.update(courses).set(course).where(eq(courses.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // LESSONS
  // ============================================================================
  async getLessons(courseId: string): Promise<Lesson[]> {
    const result = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.order);
    return result;
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    if (!result[0]) return undefined;
    // Parse quizData if it's a string (Drizzle may return JSONB as string)
    // Note: content is text type, not JSONB, so don't parse it
    return {
      ...result[0],
      quizData: result[0].quizData && typeof result[0].quizData === 'string' ? JSON.parse(result[0].quizData as string) : result[0].quizData
    };
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(lesson).returning();
    return result[0];
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const result = await db.update(lessons).set(lesson).where(eq(lessons.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // ENROLLMENTS (REVENUE-CRITICAL)
  // ============================================================================
  async getEnrollments(userId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const result = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return result[0];
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const result = await db.insert(enrollments).values(enrollment).returning();
    
    // Increment course enrollment count
    await db
      .update(courses)
      .set({ totalEnrollments: sql`${courses.totalEnrollments} + 1` })
      .where(eq(courses.id, enrollment.courseId));
    
    return result[0];
  }

  async updateEnrollmentProgress(
    id: string,
    progress: number,
    currentLessonId?: string,
    completedLessons?: string[]
  ): Promise<Enrollment> {
    const result = await db
      .update(enrollments)
      .set({
        progress,
        currentLessonId,
        completedLessons: completedLessons ? JSON.stringify(completedLessons) : undefined,
        lastAccessedAt: new Date(),
      })
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }

  // ============================================================================
  // BOOK CHAPTERS
  // ============================================================================
  async getBookChapters(): Promise<BookChapter[]> {
    return db.select().from(bookChapters).orderBy(bookChapters.order);
  }

  async getBookChapter(id: string): Promise<BookChapter | undefined> {
    const result = await db.select().from(bookChapters).where(eq(bookChapters.id, id));
    return result[0];
  }

  async createBookChapter(chapter: InsertBookChapter): Promise<BookChapter> {
    const result = await db.insert(bookChapters).values(chapter).returning();
    return result[0];
  }

  // ============================================================================
  // BOOK ACCESS (REVENUE-CRITICAL)
  // ============================================================================
  async getUserBookAccess(userId: string): Promise<BookAccess | undefined> {
    const result = await db.select().from(bookAccess).where(eq(bookAccess.userId, userId));
    return result[0];
  }

  async createBookAccess(access: InsertBookAccess): Promise<BookAccess> {
    const result = await db.insert(bookAccess).values(access).returning();
    return result[0];
  }

  // ============================================================================
  // AI BLOG TASKS (MULTI-AI ORCHESTRATION)
  // ============================================================================
  async getAiBlogTasks(filters?: { userId?: string; status?: string }): Promise<AiBlogTask[]> {
    let query = db.select().from(aiBlogTasks);
    
    if (filters) {
      const conditions = [];
      if (filters.userId) conditions.push(eq(aiBlogTasks.userId, filters.userId));
      if (filters.status) conditions.push(eq(aiBlogTasks.status, filters.status));
      if (conditions.length > 0) {
        return query.where(and(...conditions)).orderBy(desc(aiBlogTasks.createdAt));
      }
    }
    
    return query.orderBy(desc(aiBlogTasks.createdAt));
  }

  async getAiBlogTask(id: string): Promise<AiBlogTask | undefined> {
    const result = await db.select().from(aiBlogTasks).where(eq(aiBlogTasks.id, id));
    return result[0];
  }

  async createAiBlogTask(task: InsertAiBlogTask): Promise<AiBlogTask> {
    const result = await db.insert(aiBlogTasks).values(task).returning();
    return result[0];
  }

  async updateAiBlogTask(id: string, task: Partial<InsertAiBlogTask>): Promise<AiBlogTask> {
    const result = await db.update(aiBlogTasks).set(task).where(eq(aiBlogTasks.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // SEO KEYWORDS
  // ============================================================================
  async getSeoKeywords(filters?: { minSearchVolume?: number; maxDifficulty?: number }): Promise<SeoKeyword[]> {
    let query = db.select().from(seoKeywords);
    
    if (filters) {
      const conditions = [];
      if (filters.minSearchVolume) {
        conditions.push(sql`${seoKeywords.searchVolume} >= ${filters.minSearchVolume}`);
      }
      if (filters.maxDifficulty) {
        conditions.push(sql`${seoKeywords.difficulty} <= ${filters.maxDifficulty}`);
      }
      if (conditions.length > 0) {
        return query.where(and(...conditions)).orderBy(desc(seoKeywords.searchVolume));
      }
    }
    
    return query.orderBy(desc(seoKeywords.searchVolume));
  }

  async getSeoKeyword(id: string): Promise<SeoKeyword | undefined> {
    const result = await db.select().from(seoKeywords).where(eq(seoKeywords.id, id));
    return result[0];
  }

  async createSeoKeyword(keyword: InsertSeoKeyword): Promise<SeoKeyword> {
    const result = await db.insert(seoKeywords).values(keyword).returning();
    return result[0];
  }

  // ============================================================================
  // COMPETITOR ANALYSIS
  // ============================================================================
  async getCompetitorAnalyses(keyword?: string): Promise<CompetitorAnalysis[]> {
    if (keyword) {
      return db.select().from(competitorAnalysis).where(eq(competitorAnalysis.keyword, keyword)).orderBy(competitorAnalysis.serpPosition);
    }
    return db.select().from(competitorAnalysis).orderBy(desc(competitorAnalysis.analyzedAt));
  }

  async getCompetitorAnalysis(id: string): Promise<CompetitorAnalysis | undefined> {
    const result = await db.select().from(competitorAnalysis).where(eq(competitorAnalysis.id, id));
    return result[0];
  }

  async createCompetitorAnalysis(analysis: InsertCompetitorAnalysis): Promise<CompetitorAnalysis> {
    const result = await db.insert(competitorAnalysis).values(analysis).returning();
    return result[0];
  }

  // ============================================================================
  // CONSULTATIONS
  // ============================================================================
  async getConsultations(userId?: string, status?: string): Promise<Consultation[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(consultations.userId, userId));
    }
    if (status) {
      conditions.push(eq(consultations.status, status));
    }
    
    if (conditions.length > 0) {
      return db.select().from(consultations).where(and(...conditions)).orderBy(desc(consultations.createdAt));
    }
    return db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    const result = await db.select().from(consultations).where(eq(consultations.id, id));
    return result[0];
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const result = await db.insert(consultations).values(consultation).returning();
    return result[0];
  }

  async updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<Consultation> {
    const result = await db.update(consultations).set(updates).where(eq(consultations.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // LISTINGS (MARKETPLACE)
  // ============================================================================
  async getListings(status?: string, state?: string): Promise<Listing[]> {
    const conditions = [];
    if (status) {
      conditions.push(eq(listings.status, status));
    }
    if (state) {
      conditions.push(eq(listings.state, state));
    }
    
    if (conditions.length > 0) {
      return db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.createdAt));
    }
    return db.select().from(listings).orderBy(desc(listings.createdAt));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const result = await db.select().from(listings).where(eq(listings.id, id));
    return result[0];
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const result = await db.insert(listings).values(listing).returning();
    return result[0];
  }

  async updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing> {
    const result = await db.update(listings).set(updates).where(eq(listings.id, id)).returning();
    return result[0];
  }

  async deleteListing(id: string): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  // ============================================================================
  // DISTRIBUTORS (Lead Capture for Commission)
  // ============================================================================
  async getDistributors(filters?: { brandName?: string; state?: string; equipmentType?: string }): Promise<Distributor[]> {
    const conditions = [eq(distributors.active, true)];
    
    if (filters?.brandName) {
      conditions.push(eq(distributors.brandName, filters.brandName));
    }
    
    // Note: state and equipmentType filters require array operations (will implement in routes with post-filtering)
    
    return db.select().from(distributors).where(and(...conditions));
  }

  async getDistributor(id: string): Promise<Distributor | undefined> {
    const result = await db.select().from(distributors).where(eq(distributors.id, id));
    return result[0];
  }

  async createDistributor(distributor: InsertDistributor): Promise<Distributor> {
    const result = await db.insert(distributors).values(distributor).returning();
    return result[0];
  }

  async updateDistributor(id: string, updates: Partial<InsertDistributor>): Promise<Distributor> {
    const result = await db.update(distributors).set(updates).where(eq(distributors.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // DISTRIBUTOR INQUIRIES (Lead Management)
  // ============================================================================
  async getDistributorInquiries(status?: string): Promise<DistributorInquiry[]> {
    if (status) {
      return db.select().from(distributorInquiries)
        .where(eq(distributorInquiries.status, status))
        .orderBy(desc(distributorInquiries.createdAt));
    }
    return db.select().from(distributorInquiries).orderBy(desc(distributorInquiries.createdAt));
  }

  async getDistributorInquiry(id: string): Promise<DistributorInquiry | undefined> {
    const result = await db.select().from(distributorInquiries).where(eq(distributorInquiries.id, id));
    return result[0];
  }

  async createDistributorInquiry(inquiry: InsertDistributorInquiry): Promise<DistributorInquiry> {
    const result = await db.insert(distributorInquiries).values(inquiry).returning();
    return result[0];
  }

  async updateDistributorInquiry(id: string, updates: Partial<InsertDistributorInquiry>): Promise<DistributorInquiry> {
    const result = await db.update(distributorInquiries).set(updates).where(eq(distributorInquiries.id, id)).returning();
    return result[0];
  }

  // Note: Basic affiliate methods exist above, enhanced methods added below for UGC platform

  async getAffiliateByTag(tag: string): Promise<Affiliate | undefined> {
    const result = await db.select().from(affiliates).where(eq(affiliates.affiliateTag, tag));
    if (result[0]) return result[0];
    // Fallback to affiliateCode if tag not found
    const codeResult = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, tag));
    return codeResult[0];
  }

  // ============================================================================
  // AFFILIATE CONTENT (UGC Platform)
  // ============================================================================
  async getAffiliateContent(filters?: { affiliateId?: string; status?: string; contentType?: string }): Promise<AffiliateContent[]> {
    const conditions = [];
    
    if (filters?.affiliateId) {
      conditions.push(eq(affiliateContent.affiliateId, filters.affiliateId));
    }
    if (filters?.status) {
      conditions.push(eq(affiliateContent.status, filters.status));
    }
    if (filters?.contentType) {
      conditions.push(eq(affiliateContent.contentType, filters.contentType));
    }
    
    if (conditions.length > 0) {
      return db.select().from(affiliateContent)
        .where(and(...conditions))
        .orderBy(desc(affiliateContent.createdAt));
    }
    return db.select().from(affiliateContent).orderBy(desc(affiliateContent.createdAt));
  }

  async getAffiliateContentItem(id: string): Promise<AffiliateContent | undefined> {
    const result = await db.select().from(affiliateContent).where(eq(affiliateContent.id, id));
    return result[0];
  }

  async getAffiliateContentBySlug(slug: string): Promise<AffiliateContent | undefined> {
    const result = await db.select().from(affiliateContent).where(eq(affiliateContent.slug, slug));
    return result[0];
  }

  async createAffiliateContent(content: InsertAffiliateContent): Promise<AffiliateContent> {
    const result = await db.insert(affiliateContent).values(content).returning();
    return result[0];
  }

  async updateAffiliateContent(id: string, updates: Partial<InsertAffiliateContent>): Promise<AffiliateContent> {
    const result = await db.update(affiliateContent).set(updates).where(eq(affiliateContent.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // AFFILIATE CLICKS (Tracking)
  // ============================================================================
  async trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const result = await db.insert(affiliateClicks).values(click).returning();
    
    // Increment affiliate totalClicks
    await db.update(affiliates)
      .set({ totalClicks: sql`${affiliates.totalClicks} + 1` })
      .where(eq(affiliates.id, click.affiliateId));
    
    return result[0];
  }

  async getAffiliateClicks(affiliateId: string, limit?: number): Promise<AffiliateClick[]> {
    const query = db.select().from(affiliateClicks)
      .where(eq(affiliateClicks.affiliateId, affiliateId))
      .orderBy(desc(affiliateClicks.clickedAt));
    
    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  // ============================================================================
  // AFFILIATE SALES (Revenue Attribution)
  // ============================================================================
  async createAffiliateSale(sale: InsertAffiliateSale): Promise<AffiliateSale> {
    const result = await db.insert(affiliateSales).values(sale).returning();
    
    // Update affiliate totals
    await db.update(affiliates)
      .set({ 
        totalSales: sql`${affiliates.totalSales} + 1`,
        totalRevenue: sql`${affiliates.totalRevenue} + ${sale.salePrice}`,
        totalCommission: sql`${affiliates.totalCommission} + ${sale.commissionAmount}`,
      })
      .where(eq(affiliates.id, sale.affiliateId));
    
    // Mark click as converted
    if (sale.clickId) {
      await db.update(affiliateClicks)
        .set({ convertedToSale: true, saleId: result[0].id })
        .where(eq(affiliateClicks.id, sale.clickId));
    }
    
    return result[0];
  }

  async getAffiliateSales(affiliateId: string): Promise<AffiliateSale[]> {
    return db.select().from(affiliateSales)
      .where(eq(affiliateSales.affiliateId, affiliateId))
      .orderBy(desc(affiliateSales.createdAt));
  }

  async updateAffiliateSale(id: string, updates: Partial<InsertAffiliateSale>): Promise<AffiliateSale> {
    const result = await db.update(affiliateSales).set(updates).where(eq(affiliateSales.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // AFFILIATE COMMISSIONS (Period Aggregation)
  // ============================================================================
  async getAffiliateCommissions(affiliateId: string): Promise<AffiliateCommission[]> {
    return db.select().from(affiliateCommissions)
      .where(eq(affiliateCommissions.affiliateId, affiliateId))
      .orderBy(desc(affiliateCommissions.period));
  }

  async createAffiliateCommission(commission: InsertAffiliateCommission): Promise<AffiliateCommission> {
    const result = await db.insert(affiliateCommissions).values(commission).returning();
    return result[0];
  }

  async approveAffiliateCommission(id: string): Promise<AffiliateCommission> {
    const result = await db.update(affiliateCommissions)
      .set({ status: 'approved', approvedAt: sql`NOW()` })
      .where(eq(affiliateCommissions.id, id))
      .returning();
    return result[0];
  }

  // ============================================================================
  // AFFILIATE PAYOUTS (Payment Management)
  // ============================================================================
  async getAffiliatePayouts(affiliateId: string): Promise<AffiliatePayout[]> {
    return db.select().from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, affiliateId))
      .orderBy(desc(affiliatePayouts.requestedAt));
  }

  async createAffiliatePayout(payout: InsertAffiliatePayout): Promise<AffiliatePayout> {
    const result = await db.insert(affiliatePayouts).values(payout).returning();
    return result[0];
  }

  async updateAffiliatePayout(id: string, updates: Partial<InsertAffiliatePayout>): Promise<AffiliatePayout> {
    const result = await db.update(affiliatePayouts).set(updates).where(eq(affiliatePayouts.id, id)).returning();
    
    // If payout completed, update affiliate totalPaidOut
    if (updates.status === 'completed' && result[0]) {
      await db.update(affiliates)
        .set({ totalPaidOut: sql`${affiliates.totalPaidOut} + ${result[0].amount}` })
        .where(eq(affiliates.id, result[0].affiliateId));
    }
    
    return result[0];
  }

  // ============================================================================
  // PREMIUM TEMPLATES
  // ============================================================================
  async getTemplates(filters?: { category?: string; featured?: boolean }): Promise<Template[]> {
    let query = db.select().from(templates);
    if (filters?.category) {
      query = query.where(eq(templates.category, filters.category));
    }
    if (filters?.featured) {
      query = query.where(eq(templates.featured, true));
    }
    return query.orderBy(desc(templates.featured), desc(templates.downloadCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template> {
    const result = await db.update(templates).set(template).where(eq(templates.id, id)).returning();
    return result[0];
  }

  async recordTemplateDownload(templateId: string, userId: string, isPaid: boolean, amount?: number): Promise<TemplateDownload> {
    const result = await db.insert(templateDownloads).values({
      templateId,
      userId,
      isPaid,
      amount: amount ? String(amount) : undefined,
    }).returning();

    // Increment download count
    await db.update(templates)
      .set({ downloadCount: sql`${templates.downloadCount} + 1` })
      .where(eq(templates.id, templateId));

    return result[0];
  }

  // ============================================================================
  // RESOURCES (COMPREHENSIVE INDUSTRY LIBRARY)
  // ============================================================================
  async getResources(filters?: {
    resourceType?: string;
    category?: string;
    targetAudience?: string;
    searchQuery?: string;
    featured?: boolean;
  }): Promise<Resource[]> {
    let query = db.select().from(resources);
    
    if (filters?.resourceType) {
      query = query.where(eq(resources.resourceType, filters.resourceType));
    }
    if (filters?.category) {
      query = query.where(eq(resources.category, filters.category));
    }
    if (filters?.targetAudience) {
      query = query.where(sql`${resources.targetAudience} @> ARRAY[${filters.targetAudience}]`);
    }
    if (filters?.featured) {
      query = query.where(eq(resources.featured, true));
    }
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      query = query.where(
        sql`${resources.title} ILIKE ${searchTerm} OR ${resources.description} ILIKE ${searchTerm}`
      );
    }
    
    return query.orderBy(desc(resources.featured), desc(resources.useCount));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.id, id));
    return result[0];
  }

  async getResourceBySlug(slug: string): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.slug, slug));
    return result[0];
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const result = await db.insert(resources).values(resource).returning();
    return result[0];
  }

  async updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource> {
    const result = await db.update(resources).set(resource).where(eq(resources.id, id)).returning();
    return result[0];
  }

  async incrementResourceViews(id: string): Promise<void> {
    await db.update(resources)
      .set({ viewCount: sql`${resources.viewCount} + 1` })
      .where(eq(resources.id, id));
  }

  async incrementResourceUses(id: string): Promise<void> {
    await db.update(resources)
      .set({ useCount: sql`${resources.useCount} + 1` })
      .where(eq(resources.id, id));
  }

  async recordResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage> {
    const result = await db.insert(resourceUsage).values(usage).returning();
    return result[0];
  }

  // ============================================================================
  // VENDOR DIRECTORY
  // ============================================================================
  async getVendorDirectory(filters?: {
    primaryCategory?: string;
    searchQuery?: string;
    serviceArea?: string;
    featured?: boolean;
  }): Promise<VendorDirectory[]> {
    let query = db.select().from(vendorDirectory);
    
    if (filters?.primaryCategory) {
      query = query.where(eq(vendorDirectory.primaryCategory, filters.primaryCategory));
    }
    if (filters?.featured) {
      query = query.where(eq(vendorDirectory.featured, true));
    }
    if (filters?.serviceArea) {
      query = query.where(sql`${vendorDirectory.serviceAreas} @> ARRAY[${filters.serviceArea}]`);
    }
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      query = query.where(
        sql`${vendorDirectory.companyName} ILIKE ${searchTerm} OR ${vendorDirectory.description} ILIKE ${searchTerm}`
      );
    }
    
    return query.orderBy(desc(vendorDirectory.featured), desc(vendorDirectory.rating));
  }

  async getVendorDirectoryItem(id: string): Promise<VendorDirectory | undefined> {
    const result = await db.select().from(vendorDirectory).where(eq(vendorDirectory.id, id));
    return result[0];
  }

  async getVendorDirectoryItemBySlug(slug: string): Promise<VendorDirectory | undefined> {
    const result = await db.select().from(vendorDirectory).where(eq(vendorDirectory.slug, slug));
    return result[0];
  }

  async createVendorDirectoryItem(vendor: InsertVendorDirectory): Promise<VendorDirectory> {
    const result = await db.insert(vendorDirectory).values(vendor).returning();
    return result[0];
  }

  async updateVendorDirectoryItem(id: string, vendor: Partial<InsertVendorDirectory>): Promise<VendorDirectory> {
    const result = await db.update(vendorDirectory).set(vendor).where(eq(vendorDirectory.id, id)).returning();
    return result[0];
  }

  async incrementVendorViews(id: string): Promise<void> {
    await db.update(vendorDirectory)
      .set({ viewCount: sql`${vendorDirectory.viewCount} + 1` })
      .where(eq(vendorDirectory.id, id));
  }

  // ============================================================================
  // VENDOR REVIEWS
  // ============================================================================
  async getVendorReviews(vendorId: string): Promise<VendorReview[]> {
    return db.select().from(vendorReviews).where(eq(vendorReviews.vendorId, vendorId)).orderBy(desc(vendorReviews.createdAt));
  }

  async getVendorReview(id: string): Promise<VendorReview | undefined> {
    const result = await db.select().from(vendorReviews).where(eq(vendorReviews.id, id));
    return result[0];
  }

  async createVendorReview(review: InsertVendorReview): Promise<VendorReview> {
    const result = await db.insert(vendorReviews).values(review).returning();
    
    // Update vendor rating and review count
    const allReviews = await db.select().from(vendorReviews).where(eq(vendorReviews.vendorId, review.vendorId));
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await db.update(vendorDirectory)
      .set({
        rating: String(avgRating.toFixed(2)),
        reviewCount: allReviews.length,
      })
      .where(eq(vendorDirectory.id, review.vendorId));
    
    return result[0];
  }

  async updateVendorReview(id: string, review: Partial<InsertVendorReview>): Promise<VendorReview> {
    const result = await db.update(vendorReviews).set(review).where(eq(vendorReviews.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // INDUSTRY BENCHMARKS
  // ============================================================================
  async getIndustryBenchmarks(filters?: {
    category?: string;
    metric?: string;
    year?: number;
    region?: string;
  }): Promise<IndustryBenchmark[]> {
    let query = db.select().from(industryBenchmarks);
    
    if (filters?.category) {
      query = query.where(eq(industryBenchmarks.category, filters.category));
    }
    if (filters?.metric) {
      query = query.where(eq(industryBenchmarks.metric, filters.metric));
    }
    if (filters?.year) {
      query = query.where(eq(industryBenchmarks.year, filters.year));
    }
    if (filters?.region) {
      query = query.where(eq(industryBenchmarks.region, filters.region));
    }
    
    return query.orderBy(desc(industryBenchmarks.year), industryBenchmarks.metric);
  }

  async getIndustryBenchmark(id: string): Promise<IndustryBenchmark | undefined> {
    const result = await db.select().from(industryBenchmarks).where(eq(industryBenchmarks.id, id));
    return result[0];
  }

  async createIndustryBenchmark(benchmark: InsertIndustryBenchmark): Promise<IndustryBenchmark> {
    const result = await db.insert(industryBenchmarks).values(benchmark).returning();
    return result[0];
  }
}

export const dbStorage = new DbStorage();
