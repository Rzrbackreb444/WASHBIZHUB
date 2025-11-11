import {
  type User,
  type InsertUser,
  type Design,
  type InsertDesign,
  type CleanbiScore,
  type InsertCleanbiScore,
  type BlogPost,
  type InsertBlogPost,
  type Vendor,
  type InsertVendor,
  type Part,
  type InsertPart,
  type Affiliate,
  type InsertAffiliate,
  type Laundromat,
  type InsertLaundromat,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private designs: Map<string, Design>;
  private cleanbiScores: Map<string, CleanbiScore>;
  private blogPosts: Map<string, BlogPost>;
  private vendors: Map<string, Vendor>;
  private parts: Map<string, Part>;
  private affiliates: Map<string, Affiliate>;
  private laundromats: Map<string, Laundromat>;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.cleanbiScores = new Map();
    this.blogPosts = new Map();
    this.vendors = new Map();
    this.parts = new Map();
    this.affiliates = new Map();
    this.laundromats = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isPro: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    this.users.set(id, user);
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
}

export const storage = new MemStorage();
