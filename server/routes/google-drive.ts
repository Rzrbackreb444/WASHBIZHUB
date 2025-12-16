// Google Drive API Routes
// Provides endpoints to browse and access Larry Larsen's expert content
// All content is gated by subscription tier

import { Router } from 'express';
import { requireAuth } from '../services/unified-auth';
import { requireTier, optionalTierInfo } from '../middleware/tier-gate';
import { 
  listDriveFiles, 
  getFileContent, 
  searchDocuments, 
  getArticles, 
  getFolders 
} from '../services/google-drive';

const router = Router();

// Preview articles (Free tier) - Shows titles and excerpts only
router.get('/preview', optionalTierInfo, async (req, res) => {
  try {
    const { pageSize, pageToken } = req.query;
    
    const result = await getArticles({
      pageSize: pageSize ? parseInt(pageSize as string) : 10,
      pageToken: pageToken as string
    });
    
    // For free users, only return metadata (no content access)
    const previews = result.files.map((file: any) => ({
      id: file.id,
      title: file.name,
      modifiedTime: file.modifiedTime,
      excerpt: "Subscribe to Pro to access Larry Larsen's expert laundromat insights.",
      locked: (req as any).userTier === 'free'
    }));
    
    res.json({
      articles: previews,
      nextPageToken: result.nextPageToken,
      totalAvailable: result.files.length,
      message: "Larry Larsen's Expert Knowledge Base - 40+ years of laundromat experience"
    });
  } catch (error: any) {
    console.error('Error getting article previews:', error);
    res.status(500).json({ error: 'Failed to load previews', message: error.message });
  }
});

// List files in Google Drive (Pro+ tier)
router.get('/files', requireAuth, requireTier('pro'), async (req, res) => {
  try {
    const { folderId, mimeType, pageSize, pageToken, query } = req.query;
    
    const result = await listDriveFiles({
      folderId: folderId as string,
      mimeType: mimeType as string,
      pageSize: pageSize ? parseInt(pageSize as string) : 50,
      pageToken: pageToken as string,
      query: query as string
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error listing Drive files:', error);
    res.status(500).json({ 
      error: 'Failed to list files',
      message: error.message 
    });
  }
});

// Get file content (Pro+ tier - full article access)
router.get('/files/:fileId/content', requireAuth, requireTier('pro'), async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await getFileContent(fileId);
    
    // Log access for analytics
    console.log(`[Larry's Library] User ${(req as any).userId} accessed article: ${result.name}`);
    
    res.json({
      ...result,
      author: "Larry Larsen",
      authorTitle: "Laundromat Larry - 40+ Years Industry Expert",
      source: "WashBizHub Expert Knowledge Base"
    });
  } catch (error: any) {
    console.error('Error getting file content:', error);
    res.status(500).json({ 
      error: 'Failed to get file content',
      message: error.message 
    });
  }
});

// Search documents (Pro+ tier)
router.get('/search', requireAuth, requireTier('pro'), async (req, res) => {
  try {
    const { q, pageSize, pageToken } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    const result = await searchDocuments(q as string, {
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      pageToken: pageToken as string
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error searching documents:', error);
    res.status(500).json({ 
      error: 'Failed to search documents',
      message: error.message 
    });
  }
});

// Get all Google Docs articles (Pro+ tier)
router.get('/articles', requireAuth, requireTier('pro'), async (req, res) => {
  try {
    const { pageSize, pageToken } = req.query;
    
    const result = await getArticles({
      pageSize: pageSize ? parseInt(pageSize as string) : 50,
      pageToken: pageToken as string
    });
    
    // Enhance with Larry's branding
    const articles = result.files.map((file: any) => ({
      ...file,
      author: "Larry Larsen",
      authorTitle: "Laundromat Larry"
    }));
    
    res.json({
      articles,
      nextPageToken: result.nextPageToken,
      source: "Larry's Expert Knowledge Base"
    });
  } catch (error: any) {
    console.error('Error getting articles:', error);
    res.status(500).json({ 
      error: 'Failed to get articles',
      message: error.message 
    });
  }
});

// Get folders (Business+ tier - for organization/course structure)
router.get('/folders', requireAuth, requireTier('business'), async (req, res) => {
  try {
    const { parentId } = req.query;
    const result = await getFolders(parentId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting folders:', error);
    res.status(500).json({ 
      error: 'Failed to get folders',
      message: error.message 
    });
  }
});

// Stats endpoint - shows what's available (Public)
router.get('/stats', async (req, res) => {
  try {
    const result = await getArticles({ pageSize: 100 });
    
    res.json({
      totalArticles: result.files.length,
      expert: {
        name: "Larry Larsen",
        alias: "Laundromat Larry", 
        experience: "40+ years in the laundromat industry",
        role: "Co-Founder & Chief Consultant"
      },
      categories: [
        "Buying & Selling Laundromats",
        "Operations & Management", 
        "Equipment Selection",
        "Financial Analysis",
        "Location Analysis",
        "Marketing & Growth"
      ],
      accessTiers: {
        free: "Preview titles and excerpts",
        pro: "Full article access + search",
        business: "Organized courses + folder navigation",
        enterprise: "Direct consultation with Larry"
      }
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Failed to get stats',
      message: error.message 
    });
  }
});

export default router;
