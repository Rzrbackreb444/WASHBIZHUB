import {
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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Designs
  getDesigns(userId?: string): Promise<Design[]>;
  getDesign(id: string): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design>;
  deleteDesign(id: string): Promise<void>;
  
  // CLEANBI Scores
  getCleanbiScores(userId?: string): Promise<CleanbiScore[]>;
  getCleanbiScore(id: string): Promise<CleanbiScore | undefined>;
  createCleanbiScore(score: InsertCleanbiScore): Promise<CleanbiScore>;
  
  // Blog Posts
  getBlogPosts(filters?: { type?: string; category?: string }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  incrementBlogViews(id: string): Promise<void>;
  
  // Calculator Scenarios
  getCalculatorScenarios(userId?: string): Promise<CalculatorScenario[]>;
  getCalculatorScenario(id: string): Promise<CalculatorScenario | undefined>;
  createCalculatorScenario(scenario: InsertCalculatorScenario): Promise<CalculatorScenario>;
  deleteCalculatorScenario(id: string): Promise<void>;
  
  // Vendors
  getVendors(category?: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Parts
  getParts(filters?: { category?: string; vendorId?: string }): Promise<Part[]>;
  getPart(id: string): Promise<Part | undefined>;
  createPart(part: InsertPart): Promise<Part>;
  
  // Affiliates
  getAffiliates(userId?: string): Promise<Affiliate[]>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  getAffiliateByCode(code: string): Promise<Affiliate | undefined>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  trackAffiliateClick(affiliateId: string): Promise<void>;
  trackAffiliateSale(affiliateId: string, saleAmount: number): Promise<void>;
  
  // Laundromats
  getLaundromats(filters?: { city?: string; state?: string; zipCode?: string }): Promise<Laundromat[]>;
  getLaundromat(id: string): Promise<Laundromat | undefined>;
  createLaundromat(laundromat: InsertLaundromat): Promise<Laundromat>;
  
  // Courses (Premium Learning Platform)
  getCourses(filters?: { category?: string; published?: boolean }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  
  // Lessons
  getLessons(courseId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  
  // Enrollments
  getEnrollments(userId: string): Promise<Enrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: string, progress: number, currentLessonId?: string, completedLessons?: string[]): Promise<Enrollment>;
  
  // Book Chapters
  getBookChapters(): Promise<BookChapter[]>;
  getBookChapter(id: string): Promise<BookChapter | undefined>;
  createBookChapter(chapter: InsertBookChapter): Promise<BookChapter>;
  
  // Book Access
  getUserBookAccess(userId: string): Promise<BookAccess | undefined>;
  createBookAccess(access: InsertBookAccess): Promise<BookAccess>;
  
  // AI Blog Tasks
  getAiBlogTasks(filters?: { userId?: string; status?: string }): Promise<AiBlogTask[]>;
  getAiBlogTask(id: string): Promise<AiBlogTask | undefined>;
  createAiBlogTask(task: InsertAiBlogTask): Promise<AiBlogTask>;
  updateAiBlogTask(id: string, task: Partial<InsertAiBlogTask>): Promise<AiBlogTask>;
  
  // SEO Keywords
  getSeoKeywords(filters?: { minSearchVolume?: number; maxDifficulty?: number }): Promise<SeoKeyword[]>;
  getSeoKeyword(id: string): Promise<SeoKeyword | undefined>;
  createSeoKeyword(keyword: InsertSeoKeyword): Promise<SeoKeyword>;
  
  // Competitor Analysis
  getCompetitorAnalyses(keyword?: string): Promise<CompetitorAnalysis[]>;
  getCompetitorAnalysis(id: string): Promise<CompetitorAnalysis | undefined>;
  createCompetitorAnalysis(analysis: InsertCompetitorAnalysis): Promise<CompetitorAnalysis>;
  
  // Consultations
  getConsultations(userId?: string, status?: string): Promise<Consultation[]>;
  getConsultation(id: string): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation>;
  
  // Listings (Marketplace)
  getListings(status?: string, state?: string): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private designs: Map<string, Design>;
  private cleanbiScores: Map<string, CleanbiScore>;
  private blogPosts: Map<string, BlogPost>;
  private calculatorScenarios: Map<string, CalculatorScenario>;
  private vendors: Map<string, Vendor>;
  private parts: Map<string, Part>;
  private affiliates: Map<string, Affiliate>;
  private laundromats: Map<string, Laundromat>;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.cleanbiScores = new Map();
    this.blogPosts = new Map();
    this.calculatorScenarios = new Map();
    this.vendors = new Map();
    this.parts = new Map();
    this.affiliates = new Map();
    this.laundromats = new Map();
  }

  // Users (Replit Auth compatible)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = userData.id ? await this.getUser(userData.id) : null;
    
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isPro: existing?.isPro || false,
      stripeCustomerId: existing?.stripeCustomerId || null,
      stripeSubscriptionId: existing?.stripeSubscriptionId || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUserStripeInfo(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updated: User = {
      ...user,
      isPro: true,
      stripeCustomerId,
      stripeSubscriptionId,
    };
    this.users.set(userId, updated);
    return updated;
  }

  // Designs
  async getDesigns(userId?: string): Promise<Design[]> {
    const designs = Array.from(this.designs.values());
    if (userId) {
      return designs.filter((d) => d.userId === userId);
    }
    return designs;
  }

  async getDesign(id: string): Promise<Design | undefined> {
    return this.designs.get(id);
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    const id = randomUUID();
    const newDesign: Design = {
      ...design,
      id,
      createdAt: new Date(),
    } as Design;
    this.designs.set(id, newDesign);
    return newDesign;
  }

  async updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design> {
    const existing = await this.getDesign(id);
    if (!existing) throw new Error("Design not found");
    
    const updated: Design = { ...existing, ...design } as Design;
    this.designs.set(id, updated);
    return updated;
  }

  async deleteDesign(id: string): Promise<void> {
    this.designs.delete(id);
  }

  // CLEANBI Scores
  async getCleanbiScores(userId?: string): Promise<CleanbiScore[]> {
    const scores = Array.from(this.cleanbiScores.values());
    if (userId) {
      return scores.filter((s) => s.userId === userId);
    }
    return scores;
  }

  async getCleanbiScore(id: string): Promise<CleanbiScore | undefined> {
    return this.cleanbiScores.get(id);
  }

  async createCleanbiScore(score: InsertCleanbiScore): Promise<CleanbiScore> {
    const id = randomUUID();
    const newScore: CleanbiScore = {
      ...score,
      id,
      createdAt: new Date(),
    } as CleanbiScore;
    this.cleanbiScores.set(id, newScore);
    return newScore;
  }

  // Blog Posts
  async getBlogPosts(filters?: { type?: string; category?: string }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (filters?.type) {
      posts = posts.filter((p) => p.type === filters.type);
    }
    if (filters?.category) {
      posts = posts.filter((p) => p.category === filters.category);
    }
    
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const newPost: BlogPost = {
      ...post,
      id,
      views: 0,
      createdAt: new Date(),
    } as BlogPost;
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existing = await this.getBlogPost(id);
    if (!existing) throw new Error("Blog post not found");
    
    const updated: BlogPost = { ...existing, ...post } as BlogPost;
    this.blogPosts.set(id, updated);
    return updated;
  }

  async incrementBlogViews(id: string): Promise<void> {
    const post = await this.getBlogPost(id);
    if (post) {
      post.views += 1;
      this.blogPosts.set(id, post);
    }
  }

  // Calculator Scenarios
  async getCalculatorScenarios(userId?: string): Promise<CalculatorScenario[]> {
    const scenarios = Array.from(this.calculatorScenarios.values());
    if (userId) {
      return scenarios.filter((s) => s.userId === userId);
    }
    return scenarios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCalculatorScenario(id: string): Promise<CalculatorScenario | undefined> {
    return this.calculatorScenarios.get(id);
  }

  async createCalculatorScenario(scenario: InsertCalculatorScenario): Promise<CalculatorScenario> {
    const id = randomUUID();
    const newScenario: CalculatorScenario = {
      ...scenario,
      id,
      createdAt: new Date(),
    } as CalculatorScenario;
    this.calculatorScenarios.set(id, newScenario);
    return newScenario;
  }

  async deleteCalculatorScenario(id: string): Promise<void> {
    this.calculatorScenarios.delete(id);
  }

  // Vendors
  async getVendors(category?: string): Promise<Vendor[]> {
    const vendors = Array.from(this.vendors.values());
    if (category) {
      return vendors.filter((v) => v.category === category);
    }
    return vendors;
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const newVendor: Vendor = {
      ...vendor,
      id,
      rating: "0",
      totalReviews: 0,
      createdAt: new Date(),
    } as Vendor;
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  // Parts
  async getParts(filters?: { category?: string; vendorId?: string }): Promise<Part[]> {
    let parts = Array.from(this.parts.values());
    
    if (filters?.category) {
      parts = parts.filter((p) => p.category === filters.category);
    }
    if (filters?.vendorId) {
      parts = parts.filter((p) => p.vendorId === filters.vendorId);
    }
    
    return parts;
  }

  async getPart(id: string): Promise<Part | undefined> {
    return this.parts.get(id);
  }

  async createPart(part: InsertPart): Promise<Part> {
    const id = randomUUID();
    const newPart: Part = { ...part, id } as Part;
    this.parts.set(id, newPart);
    return newPart;
  }

  // Affiliates
  async getAffiliates(userId?: string): Promise<Affiliate[]> {
    const affiliates = Array.from(this.affiliates.values());
    if (userId) {
      return affiliates.filter((a) => a.userId === userId);
    }
    return affiliates;
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    return this.affiliates.get(id);
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    return Array.from(this.affiliates.values()).find((a) => a.affiliateCode === code);
  }

  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    const id = randomUUID();
    const newAffiliate: Affiliate = {
      ...affiliate,
      id,
      totalClicks: 0,
      totalSales: 0,
      totalEarnings: "0",
      createdAt: new Date(),
    } as Affiliate;
    this.affiliates.set(id, newAffiliate);
    return newAffiliate;
  }

  async trackAffiliateClick(affiliateId: string): Promise<void> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (affiliate) {
      affiliate.totalClicks += 1;
      this.affiliates.set(affiliateId, affiliate);
    }
  }

  async trackAffiliateSale(affiliateId: string, saleAmount: number): Promise<void> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (affiliate) {
      affiliate.totalSales += 1;
      const commission = (saleAmount * parseFloat(affiliate.commissionRate as string)) / 100;
      affiliate.totalEarnings = (parseFloat(affiliate.totalEarnings as string) + commission).toString();
      this.affiliates.set(affiliateId, affiliate);
    }
  }

  // Laundromats
  async getLaundromats(filters?: { city?: string; state?: string; zipCode?: string }): Promise<Laundromat[]> {
    let laundromats = Array.from(this.laundromats.values());
    
    if (filters?.city) {
      laundromats = laundromats.filter((l) => 
        l.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters?.state) {
      laundromats = laundromats.filter((l) => l.state === filters.state);
    }
    if (filters?.zipCode) {
      laundromats = laundromats.filter((l) => l.zipCode === filters.zipCode);
    }
    
    return laundromats;
  }

  async getLaundromat(id: string): Promise<Laundromat | undefined> {
    return this.laundromats.get(id);
  }

  async createLaundromat(laundromat: InsertLaundromat): Promise<Laundromat> {
    const id = randomUUID();
    const newLaundromat: Laundromat = { ...laundromat, id } as Laundromat;
    this.laundromats.set(id, newLaundromat);
    return newLaundromat;
  }
  
  // Stubs for premium features (not implemented in MemStorage)
  async getCourses(): Promise<Course[]> { return []; }
  async getCourse(): Promise<Course | undefined> { return undefined; }
  async createCourse(): Promise<Course> { throw new Error("Use DbStorage for premium features"); }
  async updateCourse(): Promise<Course> { throw new Error("Use DbStorage for premium features"); }
  
  async getLessons(): Promise<Lesson[]> { return []; }
  async getLesson(): Promise<Lesson | undefined> { return undefined; }
  async createLesson(): Promise<Lesson> { throw new Error("Use DbStorage for premium features"); }
  async updateLesson(): Promise<Lesson> { throw new Error("Use DbStorage for premium features"); }
  
  async getEnrollments(): Promise<Enrollment[]> { return []; }
  async getEnrollment(): Promise<Enrollment | undefined> { return undefined; }
  async createEnrollment(): Promise<Enrollment> { throw new Error("Use DbStorage for premium features"); }
  async updateEnrollmentProgress(): Promise<Enrollment> { throw new Error("Use DbStorage for premium features"); }
  
  async getBookChapters(): Promise<BookChapter[]> { return []; }
  async getBookChapter(): Promise<BookChapter | undefined> { return undefined; }
  async createBookChapter(): Promise<BookChapter> { throw new Error("Use DbStorage for premium features"); }
  
  async getUserBookAccess(): Promise<BookAccess | undefined> { return undefined; }
  async createBookAccess(): Promise<BookAccess> { throw new Error("Use DbStorage for premium features"); }
  
  async getAiBlogTasks(): Promise<AiBlogTask[]> { return []; }
  async getAiBlogTask(): Promise<AiBlogTask | undefined> { return undefined; }
  async createAiBlogTask(): Promise<AiBlogTask> { throw new Error("Use DbStorage for premium features"); }
  async updateAiBlogTask(): Promise<AiBlogTask> { throw new Error("Use DbStorage for premium features"); }
  
  async getSeoKeywords(): Promise<SeoKeyword[]> { return []; }
  async getSeoKeyword(): Promise<SeoKeyword | undefined> { return undefined; }
  async createSeoKeyword(): Promise<SeoKeyword> { throw new Error("Use DbStorage for premium features"); }
  
  async getCompetitorAnalyses(): Promise<CompetitorAnalysis[]> { return []; }
  async getCompetitorAnalysis(): Promise<CompetitorAnalysis | undefined> { return undefined; }
  async createCompetitorAnalysis(): Promise<CompetitorAnalysis> { throw new Error("Use DbStorage for premium features"); }
  
  async getConsultations(): Promise<Consultation[]> { return []; }
  async getConsultation(): Promise<Consultation | undefined> { return undefined; }
  async createConsultation(): Promise<Consultation> { throw new Error("Use DbStorage for premium features"); }
  async updateConsultation(): Promise<Consultation> { throw new Error("Use DbStorage for premium features"); }
  
  async getListings(): Promise<Listing[]> { return []; }
  async getListing(): Promise<Listing | undefined> { return undefined; }
  async createListing(): Promise<Listing> { throw new Error("Use DbStorage for premium features"); }
  async updateListing(): Promise<Listing> { throw new Error("Use DbStorage for premium features"); }
  async deleteListing(): Promise<void> { throw new Error("Use DbStorage for premium features"); }
}

// Use DbStorage for production-grade persistence
import { dbStorage } from "./db-storage";
export const storage = dbStorage;
