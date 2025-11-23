/**
 * SEO SUITE API ROUTES
 * 
 * Complete REST API for the 300-point SEO system at seo.washbizhub.com
 * 
 * Routes:
 * - POST   /api/seo/projects                  Create SEO project
 * - GET    /api/seo/projects                  List user's SEO projects
 * - GET    /api/seo/projects/:id              Get project details
 * - PATCH  /api/seo/projects/:id              Update project
 * - DELETE /api/seo/projects/:id              Delete project
 * 
 * - POST   /api/seo/audits                    Run 300-point audit
 * - GET    /api/seo/audits/:projectId         Get audit history
 * - GET    /api/seo/audits/:id/details        Get specific audit
 * 
 * - GET    /api/seo/tasks/:projectId          Get project tasks
 * - PATCH  /api/seo/tasks/:id                 Update task status
 * - DELETE /api/seo/tasks/:id                 Delete/dismiss task
 * 
 * - GET    /api/seo/agents/templates          List agent templates
 * - GET    /api/seo/agents                    List user's agents
 * - POST   /api/seo/agents                    Create agent from template
 * - PATCH  /api/seo/agents/:id                Update agent config
 * - DELETE /api/seo/agents/:id                Delete agent
 * - POST   /api/seo/agents/:id/run            Execute agent
 * 
 * - GET    /api/seo/domains/search            Search available domains
 * - POST   /api/seo/domains/order             Purchase domain
 * - GET    /api/seo/domains/orders            List domain orders
 * 
 * - POST   /api/seo/indexing                  Submit URL for indexing
 * - GET    /api/seo/indexing/:projectId       Check indexing status
 */

import { Router, type Request, Response } from "express";
import { z } from "zod";
import { 
  insertSeoProjectSchema,
  insertSeoAuditSchema,
  insertSeoTaskSchema,
  insertSeoAgentSchema,
  insertDomainOrderSchema,
  insertSeoIndexingJobSchema,
  type SeoProject,
  type SeoAudit,
} from "@shared/schema";
import { IStorage } from "./storage";
import { analyzeMasterSEO, type MasterSEOScore } from "./seo-master-300";
import { SEO_AGENT_TEMPLATES } from "./seo-agent-templates";

// Helper to get current user from request
function getCurrentUser(req: any): { userId: string; email: string } | null {
  if (!req.user?.claims?.sub) {
    return null;
  }
  return {
    userId: req.user.claims.sub as string,
    email: (req.user.claims.email as string) || "",
  };
}

// Fetch HTML from URL
async function fetchPageHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error: any) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

export function createSeoRoutes(storage: IStorage): Router {
  const router = Router();

  // ==================== SEO PROJECTS ====================
  
  /**
   * GET /api/seo/projects
   * List user's SEO projects
   */
  router.get("/projects", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const projects = await storage.getSeoProjects(user.userId);
    res.json({ projects });
  });

  /**
   * GET /api/seo/projects/:id
   * Get project details with latest audit
   */
  router.get("/projects/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get latest audit
    const latestAudit = await storage.getLatestSeoAudit(project.id);
    
    // Get recent tasks
    const tasks = await storage.getSeoTasks(project.id, { status: "pending" });

    res.json({ project, latestAudit, tasks });
  });

  /**
   * POST /api/seo/projects
   * Create new SEO project
   */
  router.post("/projects", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validation = insertSeoProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const project = await storage.createSeoProject({
      ...validation.data,
      userId: user.userId,
    });

    res.status(201).json({ project });
  });

  /**
   * PATCH /api/seo/projects/:id
   * Update project
   */
  router.patch("/projects/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedProject = await storage.updateSeoProject(req.params.id, req.body);
    res.json({ project: updatedProject });
  });

  /**
   * DELETE /api/seo/projects/:id
   * Delete project
   */
  router.delete("/projects/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deleteSeoProject(req.params.id);
    res.json({ success: true });
  });

  // ==================== SEO AUDITS ====================

  /**
   * POST /api/seo/audits
   * Run complete 300-point SEO audit
   * 
   * Body: { projectId: string }
   */
  router.post("/audits", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "projectId required" });
    }

    const project = await storage.getSeoProject(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      // Fetch page HTML
      const html = await fetchPageHTML(project.url);

      // Run 300-point analysis
      const result: MasterSEOScore = await analyzeMasterSEO(project.url, html, {
        keywords: project.primaryKeywords || [],
        competitors: project.competitors || [],
        includeLocalSEO: project.enableLocalSEO || false,
        includeBacklinks: project.enableBacklinkTracking !== false,
      });

      // Save audit to database
      const audit = await storage.createSeoAudit({
        projectId: project.id,
        userId: user.userId,
        totalScore: result.totalScore,
        percentage: result.percentage,
        grade: result.grade,
        baseSEOScore: Math.round(result.breakdown.baseSEO.score),
        eeatScore: Math.round(result.breakdown.eeat.score),
        coreWebVitalsScore: Math.round(result.breakdown.coreWebVitals.score),
        backlinksScore: Math.round(result.breakdown.backlinks.score),
        localSEOScore: Math.round(result.breakdown.localSEO.score),
        mobileScore: Math.round(result.breakdown.mobile.score),
        securityScore: Math.round(result.breakdown.security.score),
        accessibilityScore: Math.round(result.breakdown.accessibility.score),
        engagementScore: Math.round(result.breakdown.engagement.score),
        freshnessScore: Math.round(result.breakdown.freshness.score),
        internationalScore: Math.round(result.breakdown.international.score),
        aeoScore: Math.round(result.breakdown.aeo.score),
        technicalScore: Math.round(result.breakdown.technical.score),
        brandScore: Math.round(result.breakdown.brand.score),
        uxScore: Math.round(result.breakdown.ux.score),
        conversionScore: Math.round(result.breakdown.conversion.score),
        videoScore: Math.round(result.breakdown.video.score),
        richResultsScore: Math.round(result.breakdown.richResults.score),
        competitiveScore: Math.round(result.breakdown.competitive.score),
        contentDepthScore: Math.round(result.breakdown.contentDepth.score),
        breakdown: result.breakdown as any,
        recommendations: result.recommendations as any,
        competitiveAnalysis: result.competitiveAnalysis || null,
      });

      // Update project current score
      await storage.updateSeoProject(project.id, {
        currentScore: result.totalScore,
      });

      // Record metric snapshot
      await storage.createSeoMetric({
        projectId: project.id,
        totalScore: result.totalScore,
        organicTraffic: 0, // Would integrate with analytics
        avgPosition: "0",
        backlinks: 0, // Would integrate with backlink API
        indexedPages: 0, // Would integrate with Search Console
      });

      // Create tasks from recommendations
      const tasksToCreate = result.recommendations.slice(0, 10); // Top 10 recommendations
      for (const rec of tasksToCreate) {
        await storage.createSeoTask({
          projectId: project.id,
          auditId: audit.id,
          title: rec.recommendation.substring(0, 100),
          description: rec.recommendation,
          category: rec.category,
          priority: rec.priority,
          impact: rec.impact,
          effort: rec.effort,
          estimatedTime: rec.estimatedTime,
          status: "pending",
        });
      }

      res.json({ audit, result });
    } catch (error: any) {
      console.error("Audit failed:", error);
      res.status(500).json({ error: error.message || "Audit failed" });
    }
  });

  /**
   * GET /api/seo/audits/:projectId
   * Get audit history for project
   */
  router.get("/audits/:projectId", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const audits = await storage.getSeoAudits(req.params.projectId);
    res.json({ audits });
  });

  /**
   * GET /api/seo/audits/:id/details
   * Get specific audit details
   */
  router.get("/audits/:id/details", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const audit = await storage.getSeoAudit(req.params.id);
    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }

    if (audit.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ audit });
  });

  // ==================== SEO TASKS ====================

  /**
   * GET /api/seo/tasks/:projectId
   * Get tasks for project
   */
  router.get("/tasks/:projectId", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { status, priority } = req.query;
    const tasks = await storage.getSeoTasks(req.params.projectId, {
      status: status as string,
      priority: priority as string,
    });

    res.json({ tasks });
  });

  /**
   * PATCH /api/seo/tasks/:id
   * Update task (mark complete, in progress, etc.)
   */
  router.patch("/tasks/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const task = await storage.getSeoTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Verify ownership through project
    const project = await storage.getSeoProject(task.projectId);
    if (!project || project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedTask = await storage.updateSeoTask(req.params.id, req.body);
    res.json({ task: updatedTask });
  });

  /**
   * DELETE /api/seo/tasks/:id
   * Delete/dismiss task
   */
  router.delete("/tasks/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const task = await storage.getSeoTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Verify ownership
    const project = await storage.getSeoProject(task.projectId);
    if (!project || project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deleteSeoTask(req.params.id);
    res.json({ success: true });
  });

  // ==================== SEO AGENT TEMPLATES ====================

  /**
   * GET /api/seo/agents/templates
   * List all agent templates
   */
  router.get("/agents/templates", async (req: Request, res: Response) => {
    const { category, isPremium } = req.query;
    
    const filters: { category?: string; isPremium?: boolean } = {};
    if (category) filters.category = category as string;
    if (isPremium !== undefined) filters.isPremium = isPremium === "true" ? true : false;

    const templates = await storage.getSeoAgentTemplates(filters);
    res.json({ templates });
  });

  /**
   * GET /api/seo/agents/templates/:id
   * Get specific template details
   */
  router.get("/agents/templates/:id", async (req: Request, res: Response) => {
    const template = await storage.getSeoAgentTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ template });
  });

  // ==================== SEO AGENTS ====================

  /**
   * GET /api/seo/agents
   * List user's SEO agents
   */
  router.get("/agents", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { projectId } = req.query;
    const agents = await storage.getSeoAgents(
      user.userId,
      projectId as string | undefined
    );
    res.json({ agents });
  });

  /**
   * POST /api/seo/agents
   * Create agent from template
   */
  router.post("/agents", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const validation = insertSeoAgentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const agent = await storage.createSeoAgent({
      ...validation.data,
      userId: user.userId,
    });

    // Increment template usage if created from template
    if (agent.templateId) {
      await storage.incrementAgentTemplateUsage(agent.templateId);
    }

    res.status(201).json({ agent });
  });

  /**
   * PATCH /api/seo/agents/:id
   * Update agent configuration
   */
  router.patch("/agents/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const agent = await storage.getSeoAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedAgent = await storage.updateSeoAgent(req.params.id, req.body);
    res.json({ agent: updatedAgent });
  });

  /**
   * DELETE /api/seo/agents/:id
   * Delete agent
   */
  router.delete("/agents/:id", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const agent = await storage.getSeoAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await storage.deleteSeoAgent(req.params.id);
    res.json({ success: true });
  });

  /**
   * POST /api/seo/agents/:id/run
   * Execute SEO agent
   * 
   * Body: { task: string, context?: any }
   */
  router.post("/agents/:id/run", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const agent = await storage.getSeoAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    if (agent.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: "task required" });
    }

    try {
      // TODO: Implement actual AI agent execution
      // This would call the appropriate AI provider (OpenAI, Anthropic, etc.)
      // with the agent's system prompt and tools

      const result = {
        success: true,
        output: "Agent execution not yet implemented - coming soon!",
        task,
        agent: agent.name,
      };

      // Increment tasks completed
      await storage.incrementAgentTasksCompleted(agent.id);

      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Agent execution failed" });
    }
  });

  // ==================== DOMAIN PURCHASING ====================

  /**
   * GET /api/seo/domains/search
   * Search available domains
   * 
   * Query: ?query=laundromat&tlds=com,net,org
   */
  router.get("/domains/search", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { query, tlds } = req.query;
    if (!query) {
      return res.status(400).json({ error: "query required" });
    }

    // TODO: Integrate with Namecheap/GoDaddy domain availability API
    const mockResults = [
      { domain: `${query}.com`, available: true, price: 12.99 },
      { domain: `${query}.net`, available: true, price: 11.99 },
      { domain: `${query}.org`, available: false, price: null },
      { domain: `${query}.io`, available: true, price: 39.99 },
    ];

    res.json({ results: mockResults });
  });

  /**
   * POST /api/seo/domains/order
   * Purchase domain through WashBizHub
   * 
   * Body: { domainName: string, years: number, projectId?: string }
   */
  router.post("/domains/order", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { domainName, years, seoProjectId } = req.body;
    if (!domainName || !years) {
      return res.status(400).json({ error: "domainName and years required" });
    }

    // TODO: Integrate with Namecheap/GoDaddy domain registration API
    // TODO: Integrate with Stripe for payment

    const order = await storage.createDomainOrder({
      userId: user.userId,
      seoProjectId: seoProjectId || null,
      domainName,
      tld: domainName.split(".").pop() || "com",
      registrationPrice: "12.99",
      renewalPrice: "12.99",
      washBizHubFee: "2.00", // Our markup
      totalPrice: "14.99",
      provider: "namecheap",
      years: years || 1,
      status: "pending",
    });

    res.status(201).json({ order });
  });

  /**
   * GET /api/seo/domains/orders
   * List user's domain orders
   */
  router.get("/domains/orders", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await storage.getDomainOrders(user.userId);
    res.json({ orders });
  });

  // ==================== SEO INDEXING ====================

  /**
   * POST /api/seo/indexing
   * Submit URL for indexing to Google/Bing
   * 
   * Body: { projectId: string, url: string, urlType: string }
   */
  router.post("/indexing", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { projectId, url, urlType } = req.body;
    if (!projectId || !url) {
      return res.status(400).json({ error: "projectId and url required" });
    }

    const project = await storage.getSeoProject(projectId);
    if (!project || project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Create indexing job
    const job = await storage.createSeoIndexingJob({
      projectId,
      url,
      urlType: urlType || "page",
      googleStatus: "pending",
      bingStatus: "pending",
    });

    // TODO: Submit to Google/Bing indexing APIs
    // This would use Google Search Console API and Bing Webmaster API

    res.status(201).json({ job });
  });

  /**
   * GET /api/seo/indexing/:projectId
   * Check indexing status for project
   */
  router.get("/indexing/:projectId", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await storage.getSeoProject(req.params.projectId);
    if (!project || project.userId !== user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const jobs = await storage.getSeoIndexingJobs(req.params.projectId);
    res.json({ jobs });
  });

  // ==================== AI-POWERED SEO SUGGESTIONS ====================

  /**
   * POST /api/seo/suggest
   * Generate AI-powered SEO metadata (Yoast-style)
   * 
   * Body: { pageTitle: string, pageContent: string, industry: string, targetKeywords?: string[] }
   */
  router.post("/suggest", async (req: Request, res: Response) => {
    try {
      const { pageTitle, pageContent, industry, targetKeywords } = req.body;
      
      if (!pageTitle || !pageContent) {
        return res.status(400).json({ error: "pageTitle and pageContent required" });
      }

      // Import Gemini helper
      const { generateSEOMetadata } = await import("./gemini");
      
      const suggestions = await generateSEOMetadata({
        pageTitle,
        pageContent,
        industry: industry || "general",
        targetKeywords: targetKeywords || [],
      });

      res.json(suggestions);
    } catch (error: any) {
      console.error("SEO suggestion failed:", error);
      res.status(500).json({ error: error.message || "Failed to generate SEO suggestions" });
    }
  });

  /**
   * POST /api/seo/analyze
   * Analyze page SEO and return score/issues
   * 
   * Body: { html: string, url: string, keywords?: string[] }
   */
  router.post("/analyze", async (req: Request, res: Response) => {
    try {
      const { html, url, keywords } = req.body;
      
      if (!html || !url) {
        return res.status(400).json({ error: "html and url required" });
      }

      // Use existing 300-point SEO analyzer
      const { analyzeMasterSEO } = await import("./seo-master-300");
      
      const result = await analyzeMasterSEO(url, html, {
        keywords: keywords || [],
        competitors: [],
        includeLocalSEO: false,
        includeBacklinks: false,
      });

      res.json({
        score: result.totalScore,
        percentage: result.percentage,
        grade: result.grade,
        breakdown: result.breakdown,
        recommendations: result.recommendations,
      });
    } catch (error: any) {
      console.error("SEO analysis failed:", error);
      res.status(500).json({ error: error.message || "Failed to analyze SEO" });
    }
  });

  // ==================== PAGE-LEVEL SEO MANAGEMENT ====================

  /**
   * GET /api/seo/pages/:pageId
   * Get SEO metadata for a specific page
   */
  router.get("/pages/:pageId", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const page = await storage.getSitePage(req.params.pageId);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify ownership through project
      const project = await storage.getSiteProject(page.projectId);
      if (!project || project.userId !== user.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json({ seoData: page });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch page SEO data" });
    }
  });

  /**
   * PUT /api/seo/pages/:pageId
   * Update SEO metadata for a page
   * 
   * Body: { metaTitle, metaDescription, slug, ogTitle, ... }
   */
  router.put("/pages/:pageId", async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const page = await storage.getSitePage(req.params.pageId);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      // Verify ownership
      const project = await storage.getSiteProject(page.projectId);
      if (!project || project.userId !== user.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Update page with SEO data
      const updatedPage = await storage.updateSitePage(req.params.pageId, {
        seoMode: req.body.seoMode,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        canonicalUrl: req.body.canonicalUrl,
        slug: req.body.slug,
        ogTitle: req.body.ogTitle,
        ogDescription: req.body.ogDescription,
        ogImage: req.body.ogImage,
        ogType: req.body.ogType,
        twitterCard: req.body.twitterCard,
        twitterTitle: req.body.twitterTitle,
        twitterDescription: req.body.twitterDescription,
        twitterImage: req.body.twitterImage,
        seoScore: req.body.seoScore,
        seoIssues: req.body.seoIssues,
        lastAIGenerated: new Date(),
      });

      res.json({ page: updatedPage });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update page SEO data" });
    }
  });

  return router;
}
