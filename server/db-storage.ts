import { db } from "./db";
import { eq, and, desc, asc, sql, type SQL } from "drizzle-orm";
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
  vendorStores,
  vendorProducts,
  equipmentInquiries,
  searchIndex,
  searchAnalytics,
  emailSubscribers,
  websiteTemplates,
  customerWebsites,
  type User,
  type UpsertUser,
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
  type VendorStore,
  type InsertVendorStore,
  type VendorProduct,
  type InsertVendorProduct,
  type EquipmentInquiry,
  type InsertEquipmentInquiry,
  type SearchIndex,
  type InsertSearchIndex,
  type SearchAnalytic,
  type InsertSearchAnalytic,
  type EmailSubscriber,
  type InsertEmailSubscriber,
  type WebsiteTemplate,
  type InsertWebsiteTemplate,
  type CustomerWebsite,
  type InsertCustomerWebsite,
  brokerProfiles,
  type BrokerProfile,
  type InsertBrokerProfile,
  forumCategories,
  forumTopics,
  forumReplies,
  forumVotes,
  type ForumCategory,
  type InsertForumCategory,
  type ForumTopic,
  type InsertForumTopic,
  type ForumReply,
  type InsertForumReply,
  type ForumVote,
  type InsertForumVote,
  type EnrichedForumTopic,
  type EnrichedForumReply,
  type ForumAuthor,
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = await this.getUser(userData.id);
    if (existing) {
      const result = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return result[0];
    } else {
      return this.createUser(userData);
    }
  }

  async updateUser(userId: string, userData: Partial<UpsertUser>): Promise<User> {
    const result = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
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
  async getListings(status?: string, region?: string): Promise<Listing[]> {
    const conditions = [];
    if (status) {
      conditions.push(eq(listings.status, status));
    }
    if (region) {
      conditions.push(eq(listings.region, region));
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

  async getListingsByUserId(userId: string): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }

  async getBrokerProfileByUserId(userId: string): Promise<BrokerProfile | undefined> {
    const result = await db.select().from(brokerProfiles).where(eq(brokerProfiles.userId, userId));
    return result[0];
  }

  async createBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile> {
    const result = await db.insert(brokerProfiles).values(profile).returning();
    return result[0];
  }

  async updateBrokerProfile(id: string, updates: Partial<InsertBrokerProfile>): Promise<BrokerProfile> {
    const result = await db.update(brokerProfiles).set(updates).where(eq(brokerProfiles.id, id)).returning();
    return result[0];
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
    slug?: string;
  }): Promise<Resource[]> {
    const conditions: any[] = [];
    
    if (filters?.resourceType) {
      conditions.push(eq(resources.resourceType, filters.resourceType));
    }
    if (filters?.category) {
      conditions.push(eq(resources.category, filters.category));
    }
    if (filters?.targetAudience) {
      conditions.push(sql`${resources.targetAudience} @> ARRAY[${filters.targetAudience}]`);
    }
    if (filters?.featured) {
      conditions.push(eq(resources.featured, true));
    }
    if (filters?.slug) {
      conditions.push(eq(resources.slug, filters.slug));
    }
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      conditions.push(
        sql`${resources.title} ILIKE ${searchTerm} OR ${resources.description} ILIKE ${searchTerm}`
      );
    }
    
    const query = conditions.length > 0
      ? db.select().from(resources).where(and(...conditions))
      : db.select().from(resources);
    
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
    const conditions: any[] = [];
    
    if (filters?.primaryCategory) {
      conditions.push(eq(vendorDirectory.primaryCategory, filters.primaryCategory));
    }
    if (filters?.featured) {
      conditions.push(eq(vendorDirectory.featured, true));
    }
    if (filters?.serviceArea) {
      conditions.push(sql`${vendorDirectory.serviceAreas} @> ARRAY[${filters.serviceArea}]`);
    }
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      conditions.push(
        sql`${vendorDirectory.companyName} ILIKE ${searchTerm} OR ${vendorDirectory.description} ILIKE ${searchTerm}`
      );
    }
    
    const query = conditions.length > 0
      ? db.select().from(vendorDirectory).where(and(...conditions))
      : db.select().from(vendorDirectory);
    
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
    const conditions: any[] = [];
    
    if (filters?.category) {
      conditions.push(eq(industryBenchmarks.category, filters.category));
    }
    if (filters?.metric) {
      conditions.push(eq(industryBenchmarks.metric, filters.metric));
    }
    if (filters?.year) {
      conditions.push(eq(industryBenchmarks.year, filters.year));
    }
    if (filters?.region) {
      conditions.push(eq(industryBenchmarks.region, filters.region));
    }
    
    const query = conditions.length > 0
      ? db.select().from(industryBenchmarks).where(and(...conditions))
      : db.select().from(industryBenchmarks);
    
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

  // ============================================================================
  // VENDOR STORES (Dokan Pro Style Marketplace)
  // ============================================================================
  async getVendorStores(filters?: {
    status?: string;
    verified?: boolean;
    featured?: boolean;
  }): Promise<VendorStore[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(vendorStores.status, filters.status));
    }
    if (filters?.verified !== undefined) {
      conditions.push(eq(vendorStores.verified, filters.verified));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(vendorStores.featured, filters.featured));
    }
    
    const query = conditions.length > 0
      ? db.select().from(vendorStores).where(and(...conditions))
      : db.select().from(vendorStores);
    
    return query.orderBy(desc(vendorStores.createdAt));
  }

  async getVendorStore(id: string): Promise<VendorStore | undefined> {
    const result = await db.select().from(vendorStores).where(eq(vendorStores.id, id));
    return result[0];
  }

  async getVendorStoreBySlug(slug: string): Promise<VendorStore | undefined> {
    const result = await db.select().from(vendorStores).where(eq(vendorStores.storeSlug, slug));
    return result[0];
  }

  async getVendorStoreByOwner(ownerId: string): Promise<VendorStore | undefined> {
    const result = await db.select().from(vendorStores).where(eq(vendorStores.ownerId, ownerId));
    return result[0];
  }

  async createVendorStore(store: InsertVendorStore): Promise<VendorStore> {
    const result = await db.insert(vendorStores).values(store).returning();
    return result[0];
  }

  async updateVendorStore(id: string, store: Partial<InsertVendorStore>): Promise<VendorStore> {
    const result = await db.update(vendorStores).set(store).where(eq(vendorStores.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // VENDOR PRODUCTS
  // ============================================================================
  async getVendorProducts(filters?: {
    storeId?: string;
    category?: string;
    status?: string;
    featured?: boolean;
  }): Promise<VendorProduct[]> {
    const conditions: any[] = [];
    
    if (filters?.storeId) {
      conditions.push(eq(vendorProducts.storeId, filters.storeId));
    }
    if (filters?.category) {
      conditions.push(eq(vendorProducts.category, filters.category));
    }
    if (filters?.status) {
      conditions.push(eq(vendorProducts.status, filters.status));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(vendorProducts.featured, filters.featured));
    }
    
    const query = conditions.length > 0
      ? db.select().from(vendorProducts).where(and(...conditions))
      : db.select().from(vendorProducts);
    
    return query.orderBy(desc(vendorProducts.createdAt));
  }

  async getVendorProduct(id: string): Promise<VendorProduct | undefined> {
    const result = await db.select().from(vendorProducts).where(eq(vendorProducts.id, id));
    return result[0];
  }

  async getVendorProductBySlug(slug: string, storeId: string): Promise<VendorProduct | undefined> {
    const result = await db.select().from(vendorProducts)
      .where(and(eq(vendorProducts.slug, slug), eq(vendorProducts.storeId, storeId)));
    return result[0];
  }

  async createVendorProduct(product: InsertVendorProduct): Promise<VendorProduct> {
    const result = await db.insert(vendorProducts).values(product).returning();
    return result[0];
  }

  async updateVendorProduct(id: string, product: Partial<InsertVendorProduct>): Promise<VendorProduct> {
    const result = await db.update(vendorProducts).set(product).where(eq(vendorProducts.id, id)).returning();
    return result[0];
  }

  async deleteVendorProduct(id: string): Promise<void> {
    await db.delete(vendorProducts).where(eq(vendorProducts.id, id));
  }

  async incrementProductViews(id: string): Promise<void> {
    await db.update(vendorProducts)
      .set({ views: sql`${vendorProducts.views} + 1` })
      .where(eq(vendorProducts.id, id));
  }

  // ============================================================================
  // EQUIPMENT INQUIRIES (goes to nick@washbizhub.com)
  // ============================================================================
  async getEquipmentInquiries(filters?: {
    status?: string;
    email?: string;
  }): Promise<EquipmentInquiry[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(equipmentInquiries.status, filters.status));
    }
    if (filters?.email) {
      conditions.push(eq(equipmentInquiries.email, filters.email));
    }
    
    const query = conditions.length > 0
      ? db.select().from(equipmentInquiries).where(and(...conditions))
      : db.select().from(equipmentInquiries);
    
    return query.orderBy(desc(equipmentInquiries.createdAt));
  }

  async getEquipmentInquiry(id: string): Promise<EquipmentInquiry | undefined> {
    const result = await db.select().from(equipmentInquiries).where(eq(equipmentInquiries.id, id));
    return result[0];
  }

  async createEquipmentInquiry(inquiry: InsertEquipmentInquiry): Promise<EquipmentInquiry> {
    const result = await db.insert(equipmentInquiries).values(inquiry).returning();
    return result[0];
  }

  async updateEquipmentInquiry(id: string, inquiry: Partial<InsertEquipmentInquiry>): Promise<EquipmentInquiry> {
    const result = await db.update(equipmentInquiries).set(inquiry).where(eq(equipmentInquiries.id, id)).returning();
    return result[0];
  }

  // ============================================================================
  // PLATFORM-WIDE SEARCH INDEX
  // ============================================================================
  async searchContent(query: string, limit: number = 10): Promise<SearchIndex[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await db
      .select()
      .from(searchIndex)
      .where(
        and(
          eq(searchIndex.isActive, true),
          sql`LOWER(${searchIndex.title}) LIKE ${searchQuery}`
        )
      )
      .orderBy(desc(searchIndex.searchRank), desc(searchIndex.popularity))
      .limit(limit);
    return result;
  }

  async getSearchIndex(id: string): Promise<SearchIndex | undefined> {
    const result = await db.select().from(searchIndex).where(eq(searchIndex.id, id));
    return result[0];
  }

  async upsertSearchIndex(index: InsertSearchIndex): Promise<SearchIndex> {
    // Try to find existing entry by contentType + contentId
    const existing = await db
      .select()
      .from(searchIndex)
      .where(
        and(
          eq(searchIndex.contentType, index.contentType),
          eq(searchIndex.contentId, index.contentId)
        )
      );

    if (existing.length > 0) {
      const result = await db
        .update(searchIndex)
        .set({ ...index, updatedAt: new Date() })
        .where(eq(searchIndex.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(searchIndex).values(index).returning();
      return result[0];
    }
  }

  async deleteSearchIndex(contentType: string, contentId: string): Promise<void> {
    await db
      .delete(searchIndex)
      .where(
        and(
          eq(searchIndex.contentType, contentType),
          eq(searchIndex.contentId, contentId)
        )
      );
  }

  async incrementSearchPopularity(id: string): Promise<void> {
    await db.update(searchIndex)
      .set({ popularity: sql`${searchIndex.popularity} + 1` })
      .where(eq(searchIndex.id, id));
  }

  // ============================================================================
  // SEARCH ANALYTICS
  // ============================================================================
  async createSearchAnalytic(analytic: InsertSearchAnalytic): Promise<SearchAnalytic> {
    const result = await db.insert(searchAnalytics).values(analytic).returning();
    return result[0];
  }

  async getPopularSearches(limit: number = 20): Promise<{ query: string; count: number }[]> {
    const result = await db
      .select({
        query: searchAnalytics.query,
        count: sql<number>`count(*)::int`,
      })
      .from(searchAnalytics)
      .groupBy(searchAnalytics.query)
      .orderBy(sql`count(*) desc`)
      .limit(limit);
    return result;
  }

  // ============================================================================
  // EMAIL SUBSCRIBERS (Email Capture & List Management)
  // ============================================================================
  async getEmailSubscribers(filters?: {
    status?: string;
    tag?: string;
  }): Promise<EmailSubscriber[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(emailSubscribers.status, filters.status));
    }
    if (filters?.tag) {
      conditions.push(sql`${filters.tag} = ANY(${emailSubscribers.tags})`);
    }
    
    const query = conditions.length > 0
      ? db.select().from(emailSubscribers).where(and(...conditions))
      : db.select().from(emailSubscribers);
    
    return query.orderBy(desc(emailSubscribers.subscribedAt));
  }

  async getEmailSubscriber(email: string): Promise<EmailSubscriber | undefined> {
    const result = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
    return result[0];
  }

  async getEmailSubscriberById(id: string): Promise<EmailSubscriber | undefined> {
    const result = await db.select().from(emailSubscribers).where(eq(emailSubscribers.id, id));
    return result[0];
  }

  async createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber> {
    const result = await db.insert(emailSubscribers).values(subscriber).returning();
    return result[0];
  }

  async updateEmailSubscriber(email: string, subscriber: Partial<InsertEmailSubscriber>): Promise<EmailSubscriber> {
    const result = await db.update(emailSubscribers).set(subscriber).where(eq(emailSubscribers.email, email)).returning();
    return result[0];
  }

  async unsubscribeEmail(email: string): Promise<void> {
    await db.update(emailSubscribers)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
      .where(eq(emailSubscribers.email, email));
  }

  // ============================================================================
  // WEBSITE TEMPLATES
  // ============================================================================
  async getWebsiteTemplates(filters?: { industry?: string; category?: string; isPro?: boolean }): Promise<WebsiteTemplate[]> {
    const conditions: SQL[] = [];
    
    if (filters?.industry) {
      conditions.push(eq(websiteTemplates.industry, filters.industry));
    }
    if (filters?.category) {
      conditions.push(eq(websiteTemplates.category, filters.category));
    }
    if (filters?.isPro !== undefined) {
      conditions.push(eq(websiteTemplates.isPro, filters.isPro));
    }
    
    const query = conditions.length > 0
      ? db.select().from(websiteTemplates).where(and(...conditions))
      : db.select().from(websiteTemplates);
    
    return query.orderBy(desc(websiteTemplates.useCount));
  }

  async getWebsiteTemplate(id: string): Promise<WebsiteTemplate | undefined> {
    const result = await db.select().from(websiteTemplates).where(eq(websiteTemplates.id, id));
    return result[0];
  }

  async createWebsiteTemplate(template: InsertWebsiteTemplate): Promise<WebsiteTemplate> {
    const result = await db.insert(websiteTemplates).values(template).returning();
    return result[0];
  }

  async incrementTemplateUseCount(id: string): Promise<void> {
    await db.update(websiteTemplates)
      .set({ useCount: sql`${websiteTemplates.useCount} + 1` })
      .where(eq(websiteTemplates.id, id));
  }

  // ============================================================================
  // CUSTOMER WEBSITES (Deployed from Templates)
  // ============================================================================
  async createWebsiteFromTemplate(data: {
    userId: string;
    templateId: string;
    businessName: string;
    subdomain: string;
  }): Promise<CustomerWebsite> {
    // Get the template
    const template = await this.getWebsiteTemplate(data.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Check if subdomain is already taken
    const existing = await db.select().from(customerWebsites).where(eq(customerWebsites.slug, data.subdomain));
    if (existing.length > 0) {
      throw new Error("Subdomain already taken");
    }

    // Create the website from template
    const website: InsertCustomerWebsite = {
      userId: data.userId,
      templateId: data.templateId,
      businessName: data.businessName,
      slug: data.subdomain,
      pages: template.pages,
      theme: template.theme,
      status: "draft",
    };

    const result = await db.insert(customerWebsites).values(website).returning();

    // Increment template use count
    await this.incrementTemplateUseCount(data.templateId);

    return result[0];
  }

  async getUserWebsites(userId: string): Promise<CustomerWebsite[]> {
    return db.select().from(customerWebsites)
      .where(eq(customerWebsites.userId, userId))
      .orderBy(desc(customerWebsites.createdAt));
  }

  async getCustomerWebsite(id: string): Promise<CustomerWebsite | undefined> {
    const result = await db.select().from(customerWebsites).where(eq(customerWebsites.id, id));
    return result[0];
  }

  async getWebsiteBySlug(slug: string): Promise<CustomerWebsite | undefined> {
    const result = await db.select().from(customerWebsites).where(eq(customerWebsites.slug, slug));
    return result[0];
  }

  async updateCustomerWebsite(id: string, updates: Partial<InsertCustomerWebsite>): Promise<CustomerWebsite> {
    const result = await db.update(customerWebsites)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customerWebsites.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomerWebsite(id: string): Promise<void> {
    await db.delete(customerWebsites).where(eq(customerWebsites.id, id));
  }

  // ============================================================================
  // FORUM SYSTEM
  // ============================================================================

  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories);
  }

  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const result = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return result[0];
  }

  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const result = await db.insert(forumCategories).values(category).returning();
    return result[0];
  }

  async updateForumCategory(id: string, updates: Partial<InsertForumCategory>): Promise<ForumCategory> {
    const result = await db.update(forumCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteForumCategory(id: string): Promise<void> {
    await db.delete(forumCategories).where(eq(forumCategories.id, id));
  }

  // Forum Topics
  async getForumTopics(filters?: { categoryId?: string; userId?: string }): Promise<EnrichedForumTopic[]> {
    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(forumTopics.categoryId, filters.categoryId));
    }
    if (filters?.userId) {
      conditions.push(eq(forumTopics.userId, filters.userId));
    }

    let query = db
      .select({
        topic: forumTopics,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          tagline: users.tagline,
          role: users.role,
        },
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.userId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(forumTopics.isPinned), desc(forumTopics.lastActivityAt));
    
    return results.map((r: any) => ({
      ...r.topic,
      author: r.author,
    }));
  }

  async getForumTopic(id: string): Promise<ForumTopic | undefined> {
    const result = await db.select().from(forumTopics).where(eq(forumTopics.id, id));
    return result[0];
  }

  async getForumTopicBySlug(slug: string): Promise<ForumTopic | undefined> {
    const result = await db.select().from(forumTopics).where(eq(forumTopics.slug, slug));
    return result[0];
  }

  async createForumTopic(topic: InsertForumTopic): Promise<ForumTopic> {
    const result = await db.insert(forumTopics).values(topic).returning();
    return result[0];
  }

  async updateForumTopic(id: string, updates: Partial<InsertForumTopic>): Promise<ForumTopic> {
    const result = await db.update(forumTopics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumTopics.id, id))
      .returning();
    return result[0];
  }

  async deleteForumTopic(id: string): Promise<void> {
    // Delete all replies first
    await db.delete(forumReplies).where(eq(forumReplies.topicId, id));
    // Delete the topic
    await db.delete(forumTopics).where(eq(forumTopics.id, id));
  }

  async incrementTopicViews(id: string): Promise<void> {
    await db.update(forumTopics)
      .set({ viewCount: sql`${forumTopics.viewCount} + 1` })
      .where(eq(forumTopics.id, id));
  }

  // Forum Replies
  async getForumReplies(topicId: string): Promise<EnrichedForumReply[]> {
    const results = await db
      .select({
        reply: forumReplies,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          tagline: users.tagline,
          role: users.role,
        },
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.userId, users.id))
      .where(eq(forumReplies.topicId, topicId))
      .orderBy(forumReplies.createdAt);
    
    return results.map((r: any) => ({
      ...r.reply,
      author: r.author,
    }));
  }

  async getForumReply(id: string): Promise<ForumReply | undefined> {
    const result = await db.select().from(forumReplies).where(eq(forumReplies.id, id));
    return result[0];
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const result = await db.insert(forumReplies).values(reply).returning();
    
    // Update topic reply count and last activity
    await db.update(forumTopics)
      .set({
        replyCount: sql`${forumTopics.replyCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(forumTopics.id, reply.topicId));
    
    return result[0];
  }

  async updateForumReply(id: string, updates: Partial<InsertForumReply>): Promise<ForumReply> {
    const result = await db.update(forumReplies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumReplies.id, id))
      .returning();
    return result[0];
  }

  async deleteForumReply(id: string): Promise<void> {
    const reply = await this.getForumReply(id);
    if (reply) {
      await db.delete(forumReplies).where(eq(forumReplies.id, id));
      
      // Decrement topic reply count
      await db.update(forumTopics)
        .set({ replyCount: sql`GREATEST(${forumTopics.replyCount} - 1, 0)` })
        .where(eq(forumTopics.id, reply.topicId));
    }
  }

  // Forum Votes
  async getUserVote(userId: string, entityType: string, entityId: string): Promise<ForumVote | undefined> {
    const result = await db.select().from(forumVotes)
      .where(and(
        eq(forumVotes.userId, userId),
        eq(forumVotes.entityType, entityType),
        eq(forumVotes.entityId, entityId)
      ));
    return result[0];
  }

  async createForumVote(vote: InsertForumVote): Promise<ForumVote> {
    // Check if vote already exists
    const existing = await this.getUserVote(vote.userId, vote.entityType, vote.entityId);
    
    if (existing) {
      // Update existing vote
      const result = await db.update(forumVotes)
        .set({ voteType: vote.voteType, updatedAt: new Date() })
        .where(eq(forumVotes.id, existing.id))
        .returning();
      
      // Update vote counts
      await this.updateVoteCounts(vote.entityType, vote.entityId);
      
      return result[0];
    } else {
      // Create new vote
      const result = await db.insert(forumVotes).values(vote).returning();
      
      // Update vote counts
      await this.updateVoteCounts(vote.entityType, vote.entityId);
      
      return result[0];
    }
  }

  async deleteForumVote(userId: string, entityType: string, entityId: string): Promise<void> {
    await db.delete(forumVotes)
      .where(and(
        eq(forumVotes.userId, userId),
        eq(forumVotes.entityType, entityType),
        eq(forumVotes.entityId, entityId)
      ));
    
    // Update vote counts
    await this.updateVoteCounts(entityType, entityId);
  }

  private async updateVoteCounts(entityType: string, entityId: string): Promise<void> {
    // Count upvotes and downvotes
    const votes = await db.select().from(forumVotes)
      .where(and(
        eq(forumVotes.entityType, entityType),
        eq(forumVotes.entityId, entityId)
      ));
    
    const upvotes = votes.filter(v => v.voteType === 'upvote').length;
    const downvotes = votes.filter(v => v.voteType === 'downvote').length;
    
    // Update the entity
    if (entityType === 'topic') {
      await db.update(forumTopics)
        .set({ upvotes, downvotes })
        .where(eq(forumTopics.id, entityId));
    } else if (entityType === 'reply') {
      await db.update(forumReplies)
        .set({ upvotes, downvotes })
        .where(eq(forumReplies.id, entityId));
    }
  }
}

export const dbStorage = new DbStorage();
