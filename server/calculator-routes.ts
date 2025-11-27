// Calculator Routes - Google Sheets Integration
import { Router, Request, Response } from 'express';
import { 
  createCalculatorSheet, 
  getCalculatorData, 
  updateCalculatorData, 
  listCalculatorSheets,
  CALCULATOR_TEMPLATES 
} from './google-sheets';

const router = Router();

// List all available calculator types
router.get('/types', (req: Request, res: Response) => {
  const types = Object.keys(CALCULATOR_TEMPLATES).map(key => ({
    id: key,
    title: CALCULATOR_TEMPLATES[key as keyof typeof CALCULATOR_TEMPLATES].title,
  }));
  res.json(types);
});

// Create a new calculator sheet
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    
    if (!type || !CALCULATOR_TEMPLATES[type as keyof typeof CALCULATOR_TEMPLATES]) {
      return res.status(400).json({ error: 'Invalid calculator type' });
    }

    const result = await createCalculatorSheet(type as keyof typeof CALCULATOR_TEMPLATES);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating calculator sheet:', error);
    res.status(500).json({ error: error.message || 'Failed to create calculator' });
  }
});

// List all calculator sheets
router.get('/list', async (req: Request, res: Response) => {
  try {
    const sheets = await listCalculatorSheets();
    res.json(sheets);
  } catch (error: any) {
    console.error('Error listing calculator sheets:', error);
    res.status(500).json({ error: error.message || 'Failed to list calculators' });
  }
});

// Get calculator data
router.get('/data/:spreadsheetId', async (req: Request, res: Response) => {
  try {
    const { spreadsheetId } = req.params;
    const range = req.query.range as string || 'A1:F50';
    
    const data = await getCalculatorData(spreadsheetId, range);
    res.json({ data });
  } catch (error: any) {
    console.error('Error getting calculator data:', error);
    res.status(500).json({ error: error.message || 'Failed to get calculator data' });
  }
});

// Update calculator data
router.post('/data/:spreadsheetId', async (req: Request, res: Response) => {
  try {
    const { spreadsheetId } = req.params;
    const { range, values } = req.body;
    
    if (!range || !values) {
      return res.status(400).json({ error: 'Range and values are required' });
    }

    await updateCalculatorData(spreadsheetId, range, values);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating calculator data:', error);
    res.status(500).json({ error: error.message || 'Failed to update calculator data' });
  }
});

export default router;
