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
  type AffiliateClick,
  type InsertAffiliateClick,
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
  type BrokerProfile,
  type InsertBrokerProfile,
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
  // Forum System
  type ForumCategory,
  type InsertForumCategory,
  type ForumTopic,
  type InsertForumTopic,
  type ForumReply,
  type InsertForumReply,
  type ForumVote,
  type InsertForumVote,
  type ReputationEvent,
  type InsertReputationEvent,
  type Badge,
  type InsertBadge,
  type BadgeAward,
  type InsertBadgeAward,
  // AI Agent Builder
  type AiAgent,
  type InsertAiAgent,
  type AgentFlow,
  type InsertAgentFlow,
  type AgentKnowledgeSource,
  type InsertAgentKnowledgeSource,
  type AgentConversation,
  type InsertAgentConversation,
  type AgentTemplate,
  type InsertAgentTemplate,
  // Website Builder
  type SiteProject,
  type InsertSiteProject,
  type SitePage,
  type InsertSitePage,
  type PageSection,
  type InsertPageSection,
  type MediaAsset,
  type InsertMediaAsset,
  type WebsiteTemplate,
  type InsertWebsiteTemplate,
  // Logo Builder
  type LogoProject,
  type InsertLogoProject,
  type LogoTemplate,
  type InsertLogoTemplate,
  // Banner Builder
  type BannerProject,
  type InsertBannerProject,
  type BannerTemplate,
  type InsertBannerTemplate,
  // Enhanced Calculator System
  type CalculatorConfig,
  type InsertCalculatorConfig,
  type CalculatorInstance,
  type InsertCalculatorInstance,
  // Blog Suite Expansion
  type BlogSeries,
  type InsertBlogSeries,
  type BlogSeriesMember,
  type InsertBlogSeriesMember,
  type BlogPostTemplate,
  type InsertBlogPostTemplate,
  // Enhanced Marketplace
  type MarketplaceProduct,
  type InsertMarketplaceProduct,
  type AdCampaign,
  type InsertAdCampaign,
  type CommissionLedger,
  type InsertCommissionLedger,
  // Dashboard & Analytics
  type ModuleMetric,
  type InsertModuleMetric,
  type ActivityEvent,
  type InsertActivityEvent,
  // Vendor Marketplace
  type VendorStore,
  type InsertVendorStore,
  type VendorProduct,
  type InsertVendorProduct,
  type EquipmentInquiry,
  type InsertEquipmentInquiry,
  type SearchIndex,
  type InsertSearchIndex,
  type EmailSubscriber,
  type InsertEmailSubscriber,
  // SEO Suite
  type SeoProject,
  type InsertSeoProject,
  type SeoAudit,
  type InsertSeoAudit,
  type SeoMetric,
  type InsertSeoMetric,
  type SeoTask,
  type InsertSeoTask,
  type SeoAgentTemplate,
  type InsertSeoAgentTemplate,
  type SeoAgent,
  type InsertSeoAgent,
  type DomainOrder,
  type InsertDomainOrder,
  type SeoIndexingJob,
  type InsertSeoIndexingJob,
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
  trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
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
  getListingsByUserId(userId: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  
  // Broker Profiles
  getBrokerProfileByUserId(userId: string): Promise<BrokerProfile | undefined>;
  createBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile>;
  updateBrokerProfile(id: string, profile: Partial<InsertBrokerProfile>): Promise<BrokerProfile>;
  
  // Templates (Premium)
  getTemplates(filters?: { category?: string; featured?: boolean }): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template>;
  recordTemplateDownload(templateId: string, userId: string, isPaid: boolean, amount?: number): Promise<TemplateDownload>;
  
  // Resources (Comprehensive Industry Library)
  getResources(filters?: { 
    resourceType?: string; 
    category?: string; 
    targetAudience?: string;
    searchQuery?: string;
    featured?: boolean;
  }): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  getResourceBySlug(slug: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource>;
  incrementResourceViews(id: string): Promise<void>;
  incrementResourceUses(id: string): Promise<void>;
  recordResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage>;
  
  // Vendor Directory
  getVendorDirectory(filters?: {
    primaryCategory?: string;
    searchQuery?: string;
    serviceArea?: string;
    featured?: boolean;
  }): Promise<VendorDirectory[]>;
  getVendorDirectoryItem(id: string): Promise<VendorDirectory | undefined>;
  getVendorDirectoryItemBySlug(slug: string): Promise<VendorDirectory | undefined>;
  createVendorDirectoryItem(vendor: InsertVendorDirectory): Promise<VendorDirectory>;
  updateVendorDirectoryItem(id: string, vendor: Partial<InsertVendorDirectory>): Promise<VendorDirectory>;
  incrementVendorViews(id: string): Promise<void>;
  
  // Vendor Reviews
  getVendorReviews(vendorId: string): Promise<VendorReview[]>;
  getVendorReview(id: string): Promise<VendorReview | undefined>;
  createVendorReview(review: InsertVendorReview): Promise<VendorReview>;
  updateVendorReview(id: string, review: Partial<InsertVendorReview>): Promise<VendorReview>;
  
  // Industry Benchmarks
  getIndustryBenchmarks(filters?: {
    category?: string;
    metric?: string;
    year?: number;
    region?: string;
  }): Promise<IndustryBenchmark[]>;
  getIndustryBenchmark(id: string): Promise<IndustryBenchmark | undefined>;
  createIndustryBenchmark(benchmark: InsertIndustryBenchmark): Promise<IndustryBenchmark>;
  
  // Forum System
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  updateForumCategory(id: string, category: Partial<InsertForumCategory>): Promise<ForumCategory>;
  deleteForumCategory(id: string): Promise<void>;
  
  getForumTopics(filters?: { categoryId?: string; userId?: string }): Promise<ForumTopic[]>;
  getForumTopic(id: string): Promise<ForumTopic | undefined>;
  getForumTopicBySlug(slug: string): Promise<ForumTopic | undefined>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  updateForumTopic(id: string, topic: Partial<InsertForumTopic>): Promise<ForumTopic>;
  deleteForumTopic(id: string): Promise<void>;
  incrementTopicViews(id: string): Promise<void>;
  
  getForumReplies(topicId: string): Promise<ForumReply[]>;
  getForumReply(id: string): Promise<ForumReply | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: string, reply: Partial<InsertForumReply>): Promise<ForumReply>;
  deleteForumReply(id: string): Promise<void>;
  
  getUserVote(userId: string, entityType: string, entityId: string): Promise<ForumVote | undefined>;
  createForumVote(vote: InsertForumVote): Promise<ForumVote>;
  updateForumVote(id: string, voteType: number): Promise<ForumVote>;
  deleteForumVote(userId: string, entityType: string, entityId: string): Promise<void>;
  
  getUserReputation(userId: string): Promise<number>;
  getReputationEvents(userId: string): Promise<ReputationEvent[]>;
  createReputationEvent(event: InsertReputationEvent): Promise<ReputationEvent>;
  
  getBadges(): Promise<Badge[]>;
  getBadge(id: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  getUserBadges(userId: string): Promise<BadgeAward[]>;
  awardBadge(award: InsertBadgeAward): Promise<BadgeAward>;
  
  // AI Agent Builder
  getAiAgents(userId?: string): Promise<AiAgent[]>;
  getAiAgent(id: string): Promise<AiAgent | undefined>;
  createAiAgent(agent: InsertAiAgent): Promise<AiAgent>;
  updateAiAgent(id: string, agent: Partial<InsertAiAgent>): Promise<AiAgent>;
  deleteAiAgent(id: string): Promise<void>;
  
  getAgentFlows(agentId: string): Promise<AgentFlow[]>;
  getAgentFlow(id: string): Promise<AgentFlow | undefined>;
  createAgentFlow(flow: InsertAgentFlow): Promise<AgentFlow>;
  updateAgentFlow(id: string, flow: Partial<InsertAgentFlow>): Promise<AgentFlow>;
  deleteAgentFlow(id: string): Promise<void>;
  
  getAgentKnowledgeSources(agentId: string): Promise<AgentKnowledgeSource[]>;
  getAgentKnowledgeSource(id: string): Promise<AgentKnowledgeSource | undefined>;
  createAgentKnowledgeSource(source: InsertAgentKnowledgeSource): Promise<AgentKnowledgeSource>;
  deleteAgentKnowledgeSource(id: string): Promise<void>;
  
  getAgentConversations(agentId: string): Promise<AgentConversation[]>;
  getAgentConversation(id: string): Promise<AgentConversation | undefined>;
  createAgentConversation(conversation: InsertAgentConversation): Promise<AgentConversation>;
  updateAgentConversation(id: string, conversation: Partial<InsertAgentConversation>): Promise<AgentConversation>;
  
  getAgentTemplates(filters?: { industry?: string; category?: string }): Promise<AgentTemplate[]>;
  getAgentTemplate(id: string): Promise<AgentTemplate | undefined>;
  createAgentTemplate(template: InsertAgentTemplate): Promise<AgentTemplate>;
  
  // Website Builder
  getSiteProjects(userId?: string): Promise<SiteProject[]>;
  getSiteProject(id: string): Promise<SiteProject | undefined>;
  getSiteProjectBySubdomain(subdomain: string): Promise<SiteProject | undefined>;
  createSiteProject(project: InsertSiteProject): Promise<SiteProject>;
  updateSiteProject(id: string, project: Partial<InsertSiteProject>): Promise<SiteProject>;
  deleteSiteProject(id: string): Promise<void>;
  
  getSitePages(projectId: string): Promise<SitePage[]>;
  getSitePage(id: string): Promise<SitePage | undefined>;
  createSitePage(page: InsertSitePage): Promise<SitePage>;
  updateSitePage(id: string, page: Partial<InsertSitePage>): Promise<SitePage>;
  deleteSitePage(id: string): Promise<void>;
  
  getPageSections(pageId: string): Promise<PageSection[]>;
  getPageSection(id: string): Promise<PageSection | undefined>;
  createPageSection(section: InsertPageSection): Promise<PageSection>;
  updatePageSection(id: string, section: Partial<InsertPageSection>): Promise<PageSection>;
  deletePageSection(id: string): Promise<void>;
  
  // Website Templates
  getWebsiteTemplates(filters?: { industry?: string; category?: string; isPro?: boolean }): Promise<WebsiteTemplate[]>;
  getWebsiteTemplate(id: string): Promise<WebsiteTemplate | undefined>;
  createWebsiteTemplate(template: InsertWebsiteTemplate): Promise<WebsiteTemplate>;
  incrementTemplateUseCount(id: string): Promise<void>;
  
  getMediaAssets(userId?: string, projectId?: string): Promise<MediaAsset[]>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  deleteMediaAsset(id: string): Promise<void>;
  
  // Logo Builder
  getLogoProjects(userId: string): Promise<LogoProject[]>;
  getLogoProject(id: string): Promise<LogoProject | undefined>;
  createLogoProject(project: InsertLogoProject): Promise<LogoProject>;
  updateLogoProject(id: string, project: Partial<InsertLogoProject>): Promise<LogoProject>;
  deleteLogoProject(id: string): Promise<void>;
  
  getLogoTemplates(filters?: { industry?: string; style?: string }): Promise<LogoTemplate[]>;
  getLogoTemplate(id: string): Promise<LogoTemplate | undefined>;
  createLogoTemplate(template: InsertLogoTemplate): Promise<LogoTemplate>;
  
  // Banner Builder
  getBannerProjects(userId: string): Promise<BannerProject[]>;
  getBannerProject(id: string): Promise<BannerProject | undefined>;
  createBannerProject(project: InsertBannerProject): Promise<BannerProject>;
  updateBannerProject(id: string, project: Partial<InsertBannerProject>): Promise<BannerProject>;
  deleteBannerProject(id: string): Promise<void>;
  
  getBannerTemplates(filters?: { industry?: string; size?: string }): Promise<BannerTemplate[]>;
  getBannerTemplate(id: string): Promise<BannerTemplate | undefined>;
  createBannerTemplate(template: InsertBannerTemplate): Promise<BannerTemplate>;
  
  // Enhanced Calculator System
  getCalculatorConfigs(filters?: { category?: string; industry?: string }): Promise<CalculatorConfig[]>;
  getCalculatorConfig(id: string): Promise<CalculatorConfig | undefined>;
  createCalculatorConfig(config: InsertCalculatorConfig): Promise<CalculatorConfig>;
  updateCalculatorConfig(id: string, config: Partial<InsertCalculatorConfig>): Promise<CalculatorConfig>;
  deleteCalculatorConfig(id: string): Promise<void>;
  
  getCalculatorInstances(configId?: string, userId?: string): Promise<CalculatorInstance[]>;
  getCalculatorInstance(id: string): Promise<CalculatorInstance | undefined>;
  createCalculatorInstance(instance: InsertCalculatorInstance): Promise<CalculatorInstance>;
  deleteCalculatorInstance(id: string): Promise<void>;
  
  // Blog Suite Expansion
  getBlogSeries(filters?: { isPublished?: boolean }): Promise<BlogSeries[]>;
  getBlogSeriesItem(id: string): Promise<BlogSeries | undefined>;
  getBlogSeriesBySlug(slug: string): Promise<BlogSeries | undefined>;
  createBlogSeries(series: InsertBlogSeries): Promise<BlogSeries>;
  updateBlogSeries(id: string, series: Partial<InsertBlogSeries>): Promise<BlogSeries>;
  deleteBlogSeries(id: string): Promise<void>;
  
  getSeriesMembers(seriesId: string): Promise<BlogSeriesMember[]>;
  addPostToSeries(member: InsertBlogSeriesMember): Promise<BlogSeriesMember>;
  removePostFromSeries(id: string): Promise<void>;
  
  getBlogPostTemplates(filters?: { category?: string }): Promise<BlogPostTemplate[]>;
  getBlogPostTemplate(id: string): Promise<BlogPostTemplate | undefined>;
  createBlogPostTemplate(template: InsertBlogPostTemplate): Promise<BlogPostTemplate>;
  
  // Enhanced Marketplace
  getMarketplaceProducts(filters?: { vendorId?: string; category?: string }): Promise<MarketplaceProduct[]>;
  getMarketplaceProduct(id: string): Promise<MarketplaceProduct | undefined>;
  getMarketplaceProductBySlug(slug: string): Promise<MarketplaceProduct | undefined>;
  createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct>;
  updateMarketplaceProduct(id: string, product: Partial<InsertMarketplaceProduct>): Promise<MarketplaceProduct>;
  deleteMarketplaceProduct(id: string): Promise<void>;
  
  getAdCampaigns(userId?: string): Promise<AdCampaign[]>;
  getAdCampaign(id: string): Promise<AdCampaign | undefined>;
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: string, campaign: Partial<InsertAdCampaign>): Promise<AdCampaign>;
  deleteAdCampaign(id: string): Promise<void>;
  
  getCommissionLedger(filters?: { vendorId?: string; affiliateId?: string }): Promise<CommissionLedger[]>;
  createCommissionEntry(entry: InsertCommissionLedger): Promise<CommissionLedger>;
  
  // Dashboard & Analytics
  getModuleMetrics(filters?: { userId?: string; module?: string; period?: string }): Promise<ModuleMetric[]>;
  createModuleMetric(metric: InsertModuleMetric): Promise<ModuleMetric>;
  
  getActivityEvents(userId?: string, limit?: number): Promise<ActivityEvent[]>;
  createActivityEvent(event: InsertActivityEvent): Promise<ActivityEvent>;
  
  // Vendor Stores (Dokan Pro Style Marketplace)
  getVendorStores(filters?: { status?: string; verified?: boolean; featured?: boolean }): Promise<VendorStore[]>;
  getVendorStore(id: string): Promise<VendorStore | undefined>;
  getVendorStoreBySlug(slug: string): Promise<VendorStore | undefined>;
  getVendorStoreByOwner(ownerId: string): Promise<VendorStore | undefined>;
  createVendorStore(store: InsertVendorStore): Promise<VendorStore>;
  updateVendorStore(id: string, store: Partial<InsertVendorStore>): Promise<VendorStore>;
  
  // Vendor Products
  getVendorProducts(filters?: { storeId?: string; category?: string; status?: string; featured?: boolean }): Promise<VendorProduct[]>;
  getVendorProduct(id: string): Promise<VendorProduct | undefined>;
  getVendorProductBySlug(slug: string, storeId: string): Promise<VendorProduct | undefined>;
  createVendorProduct(product: InsertVendorProduct): Promise<VendorProduct>;
  updateVendorProduct(id: string, product: Partial<InsertVendorProduct>): Promise<VendorProduct>;
  deleteVendorProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;
  
  // Equipment Inquiries (goes to nick@washbizhub.com)
  getEquipmentInquiries(filters?: { status?: string; email?: string }): Promise<EquipmentInquiry[]>;
  getEquipmentInquiry(id: string): Promise<EquipmentInquiry | undefined>;
  createEquipmentInquiry(inquiry: InsertEquipmentInquiry): Promise<EquipmentInquiry>;
  updateEquipmentInquiry(id: string, inquiry: Partial<InsertEquipmentInquiry>): Promise<EquipmentInquiry>;
  
  // Platform-Wide Search
  searchContent(query: string, limit?: number): Promise<SearchIndex[]>;
  getSearchIndex(id: string): Promise<SearchIndex | undefined>;
  upsertSearchIndex(index: InsertSearchIndex): Promise<SearchIndex>;
  deleteSearchIndex(contentType: string, contentId: string): Promise<void>;
  incrementSearchPopularity(id: string): Promise<void>;
  
  // Search Analytics
  createSearchAnalytic(analytic: any): Promise<any>;
  getPopularSearches(limit?: number): Promise<{ query: string; count: number }[]>;
  
  // Email Subscribers
  getEmailSubscribers(filters?: { status?: string; tag?: string }): Promise<EmailSubscriber[]>;
  getEmailSubscriber(email: string): Promise<EmailSubscriber | undefined>;
  getEmailSubscriberById(id: string): Promise<EmailSubscriber | undefined>;
  createEmailSubscriber(subscriber: InsertEmailSubscriber): Promise<EmailSubscriber>;
  updateEmailSubscriber(email: string, subscriber: Partial<InsertEmailSubscriber>): Promise<EmailSubscriber>;
  unsubscribeEmail(email: string): Promise<void>;
  
  // ========== SEO SUITE ==========
  // SEO Projects
  getSeoProjects(userId?: string): Promise<SeoProject[]>;
  getSeoProject(id: string): Promise<SeoProject | undefined>;
  createSeoProject(project: InsertSeoProject): Promise<SeoProject>;
  updateSeoProject(id: string, project: Partial<InsertSeoProject>): Promise<SeoProject>;
  deleteSeoProject(id: string): Promise<void>;
  
  // SEO Audits
  getSeoAudits(projectId: string): Promise<SeoAudit[]>;
  getSeoAudit(id: string): Promise<SeoAudit | undefined>;
  getLatestSeoAudit(projectId: string): Promise<SeoAudit | undefined>;
  createSeoAudit(audit: InsertSeoAudit): Promise<SeoAudit>;
  
  // SEO Metrics
  getSeoMetrics(projectId: string, limit?: number): Promise<SeoMetric[]>;
  createSeoMetric(metric: InsertSeoMetric): Promise<SeoMetric>;
  
  // SEO Tasks
  getSeoTasks(projectId: string, filters?: { status?: string; priority?: string }): Promise<SeoTask[]>;
  getSeoTask(id: string): Promise<SeoTask | undefined>;
  createSeoTask(task: InsertSeoTask): Promise<SeoTask>;
  updateSeoTask(id: string, task: Partial<InsertSeoTask>): Promise<SeoTask>;
  deleteSeoTask(id: string): Promise<void>;
  
  // SEO Agent Templates
  getSeoAgentTemplates(filters?: { category?: string; isPremium?: boolean }): Promise<SeoAgentTemplate[]>;
  getSeoAgentTemplate(id: string): Promise<SeoAgentTemplate | undefined>;
  createSeoAgentTemplate(template: InsertSeoAgentTemplate): Promise<SeoAgentTemplate>;
  incrementAgentTemplateUsage(id: string): Promise<void>;
  
  // SEO Agents
  getSeoAgents(userId?: string, projectId?: string): Promise<SeoAgent[]>;
  getSeoAgent(id: string): Promise<SeoAgent | undefined>;
  createSeoAgent(agent: InsertSeoAgent): Promise<SeoAgent>;
  updateSeoAgent(id: string, agent: Partial<InsertSeoAgent>): Promise<SeoAgent>;
  deleteSeoAgent(id: string): Promise<void>;
  incrementAgentTasksCompleted(id: string): Promise<void>;
  
  // Domain Orders
  getDomainOrders(userId?: string): Promise<DomainOrder[]>;
  getDomainOrder(id: string): Promise<DomainOrder | undefined>;
  createDomainOrder(order: InsertDomainOrder): Promise<DomainOrder>;
  updateDomainOrder(id: string, order: Partial<InsertDomainOrder>): Promise<DomainOrder>;
  
  // SEO Indexing Jobs
  getSeoIndexingJobs(projectId: string): Promise<SeoIndexingJob[]>;
  getSeoIndexingJob(id: string): Promise<SeoIndexingJob | undefined>;
  createSeoIndexingJob(job: InsertSeoIndexingJob): Promise<SeoIndexingJob>;
  updateSeoIndexingJob(id: string, job: Partial<InsertSeoIndexingJob>): Promise<SeoIndexingJob>;
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
  private siteProjects: Map<string, SiteProject>;
  private sitePages: Map<string, SitePage>;
  private pageSections: Map<string, PageSection>;
  private websiteTemplates: Map<string, WebsiteTemplate>;

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
    this.siteProjects = new Map();
    this.sitePages = new Map();
    this.pageSections = new Map();
    this.websiteTemplates = new Map();
    
    // Seed templates on initialization
    this.seedTemplates();
  }
  
  private async seedTemplates() {
    // Dynamically import templates to avoid circular dependencies
    const { laundromatTemplates } = await import("./seed-templates");
    
    for (const template of laundromatTemplates) {
      await this.createWebsiteTemplate(template);
    }
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
      phone: existing?.phone || null,
      bio: existing?.bio || null,
      timezone: existing?.timezone || "America/New_York",
      companyName: existing?.companyName || null,
      role: existing?.role || null,
      industry: existing?.industry || null,
      numberOfLocations: existing?.numberOfLocations || 1,
      preferredCurrency: existing?.preferredCurrency || "USD",
      preferredLanguage: existing?.preferredLanguage || "en",
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

  // Site Projects (Website Builder)
  async getSiteProjects(userId?: string): Promise<SiteProject[]> {
    const projects = Array.from(this.siteProjects.values());
    if (userId) {
      return projects.filter((p) => p.userId === userId);
    }
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getSiteProject(id: string): Promise<SiteProject | undefined> {
    return this.siteProjects.get(id);
  }

  async getSiteProjectBySubdomain(subdomain: string): Promise<SiteProject | undefined> {
    return Array.from(this.siteProjects.values()).find((p) => p.subdomain === subdomain);
  }

  async createSiteProject(project: InsertSiteProject): Promise<SiteProject> {
    const id = randomUUID();
    const now = new Date();
    const newProject: SiteProject = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    } as SiteProject;
    this.siteProjects.set(id, newProject);
    return newProject;
  }

  async updateSiteProject(id: string, project: Partial<InsertSiteProject>): Promise<SiteProject> {
    const existing = await this.getSiteProject(id);
    if (!existing) throw new Error("Site project not found");
    
    const updated: SiteProject = {
      ...existing,
      ...project,
      updatedAt: new Date(),
    } as SiteProject;
    this.siteProjects.set(id, updated);
    return updated;
  }

  async deleteSiteProject(id: string): Promise<void> {
    // Also delete associated pages and sections
    const pages = Array.from(this.sitePages.values()).filter((p) => p.projectId === id);
    pages.forEach((page) => {
      const sections = Array.from(this.pageSections.values()).filter((s) => s.pageId === page.id);
      sections.forEach((section) => this.pageSections.delete(section.id));
      this.sitePages.delete(page.id);
    });
    this.siteProjects.delete(id);
  }

  // Site Pages
  async getSitePages(projectId: string): Promise<SitePage[]> {
    return Array.from(this.sitePages.values())
      .filter((p) => p.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getSitePage(id: string): Promise<SitePage | undefined> {
    return this.sitePages.get(id);
  }

  async createSitePage(page: InsertSitePage): Promise<SitePage> {
    const id = randomUUID();
    const newPage: SitePage = {
      ...page,
      id,
      createdAt: new Date(),
    } as SitePage;
    this.sitePages.set(id, newPage);
    return newPage;
  }

  async updateSitePage(id: string, page: Partial<InsertSitePage>): Promise<SitePage> {
    const existing = await this.getSitePage(id);
    if (!existing) throw new Error("Site page not found");
    
    const updated: SitePage = { ...existing, ...page } as SitePage;
    this.sitePages.set(id, updated);
    return updated;
  }

  async deleteSitePage(id: string): Promise<void> {
    // Also delete associated sections
    const sections = Array.from(this.pageSections.values()).filter((s) => s.pageId === id);
    sections.forEach((section) => this.pageSections.delete(section.id));
    this.sitePages.delete(id);
  }

  // Page Sections
  async getPageSections(pageId: string): Promise<PageSection[]> {
    return Array.from(this.pageSections.values())
      .filter((s) => s.pageId === pageId)
      .sort((a, b) => a.order - b.order);
  }

  async getPageSection(id: string): Promise<PageSection | undefined> {
    return this.pageSections.get(id);
  }

  async createPageSection(section: InsertPageSection): Promise<PageSection> {
    const id = randomUUID();
    const newSection: PageSection = {
      ...section,
      id,
    } as PageSection;
    this.pageSections.set(id, newSection);
    return newSection;
  }

  async updatePageSection(id: string, section: Partial<InsertPageSection>): Promise<PageSection> {
    const existing = await this.getPageSection(id);
    if (!existing) throw new Error("Page section not found");
    
    const updated: PageSection = { ...existing, ...section } as PageSection;
    this.pageSections.set(id, updated);
    return updated;
  }

  async deletePageSection(id: string): Promise<void> {
    this.pageSections.delete(id);
  }

  // Website Templates
  async getWebsiteTemplates(filters?: { industry?: string; category?: string; isPro?: boolean }): Promise<WebsiteTemplate[]> {
    let templates = Array.from(this.websiteTemplates.values());
    
    if (filters?.industry) {
      templates = templates.filter((t) => t.industry === filters.industry);
    }
    if (filters?.category) {
      templates = templates.filter((t) => t.category === filters.category);
    }
    if (filters?.isPro !== undefined) {
      templates = templates.filter((t) => t.isPro === filters.isPro);
    }
    
    return templates.sort((a, b) => b.useCount - a.useCount);
  }

  async getWebsiteTemplate(id: string): Promise<WebsiteTemplate | undefined> {
    return this.websiteTemplates.get(id);
  }

  async createWebsiteTemplate(template: InsertWebsiteTemplate): Promise<WebsiteTemplate> {
    const id = randomUUID();
    const newTemplate: WebsiteTemplate = {
      ...template,
      id,
      useCount: 0,
      rating: "0",
      createdAt: new Date(),
    } as WebsiteTemplate;
    this.websiteTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async incrementTemplateUseCount(id: string): Promise<void> {
    const template = await this.getWebsiteTemplate(id);
    if (template) {
      const updated = { ...template, useCount: template.useCount + 1 };
      this.websiteTemplates.set(id, updated);
    }
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

  async trackAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const id = randomUUID();
    const newClick: AffiliateClick = {
      ...click,
      id,
      clickedAt: new Date(),
      convertedToSale: false,
    } as AffiliateClick;
    
    // Increment affiliate clicks if affiliateId provided
    if (click.affiliateId) {
      const affiliate = await this.getAffiliate(click.affiliateId);
      if (affiliate) {
        affiliate.totalClicks += 1;
        this.affiliates.set(click.affiliateId, affiliate);
      }
    }
    
    return newClick;
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
  
  async getTemplates(): Promise<any[]> { return []; }
  async getTemplate(): Promise<any | undefined> { return undefined; }
  async createTemplate(): Promise<any> { throw new Error("Use DbStorage for premium features"); }
  async updateTemplate(): Promise<any> { throw new Error("Use DbStorage for premium features"); }
  async recordTemplateDownload(): Promise<any> { throw new Error("Use DbStorage for premium features"); }
}

// Use DbStorage for production-grade persistence
import { dbStorage } from "./db-storage";
export const storage = dbStorage;
