// Google Drive API Routes
// Provides endpoints to browse and access Google Drive content

import { Router } from 'express';
import { requireAuth } from '../services/unified-auth';
import { 
  listDriveFiles, 
  getFileContent, 
  searchDocuments, 
  getArticles, 
  getFolders 
} from '../services/google-drive';

const router = Router();

// List files in Google Drive
router.get('/files', requireAuth, async (req, res) => {
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

// Get file content
router.get('/files/:fileId/content', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await getFileContent(fileId);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting file content:', error);
    res.status(500).json({ 
      error: 'Failed to get file content',
      message: error.message 
    });
  }
});

// Search documents
router.get('/search', requireAuth, async (req, res) => {
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

// Get all Google Docs (articles)
router.get('/articles', requireAuth, async (req, res) => {
  try {
    const { pageSize, pageToken } = req.query;
    
    const result = await getArticles({
      pageSize: pageSize ? parseInt(pageSize as string) : 50,
      pageToken: pageToken as string
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error getting articles:', error);
    res.status(500).json({ 
      error: 'Failed to get articles',
      message: error.message 
    });
  }
});

// Get folders
router.get('/folders', requireAuth, async (req, res) => {
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

export default router;
