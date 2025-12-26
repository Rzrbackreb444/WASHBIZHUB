import { Router } from 'express';
import { 
  getIndustryBenchmarks, 
  getLocationMarketInsights, 
  getFundingRates,
  getEquipmentPricing 
} from './platform-data-engine';

const router = Router();

router.get('/benchmarks', async (req, res) => {
  try {
    const benchmarks = await getIndustryBenchmarks();
    res.json(benchmarks);
  } catch (error: any) {
    console.error('Failed to get industry benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch industry benchmarks' });
  }
});

router.get('/funding-rates', async (req, res) => {
  try {
    const rates = await getFundingRates();
    res.json(rates);
  } catch (error: any) {
    console.error('Failed to get funding rates:', error);
    res.status(500).json({ error: 'Failed to fetch funding rates' });
  }
});

router.get('/equipment-pricing/:type?', async (req, res) => {
  try {
    const equipmentType = req.params.type || 'washer';
    const pricing = await getEquipmentPricing(equipmentType);
    res.json(pricing);
  } catch (error: any) {
    console.error('Failed to get equipment pricing:', error);
    res.status(500).json({ error: 'Failed to fetch equipment pricing' });
  }
});

router.get('/market-insights/:city?/:state?', async (req, res) => {
  try {
    const city = req.params.city || 'Los Angeles';
    const state = req.params.state || 'CA';
    const insights = await getLocationMarketInsights(city, state);
    res.json(insights);
  } catch (error: any) {
    console.error('Failed to get market insights:', error);
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
});

export default router;
