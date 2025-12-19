import { Router } from "express";
import {
  runSelfAudit,
  generateImprovementPlan as generateResearchPlan,
  expandManufacturerCoverage,
  runFullExpansion,
  analyzeCompetitor as analyzeCompetitorBasic,
} from "../services/ai-research-engine";
import {
  runFullAudit,
  generateImprovementPlan,
  analyzeCompetitor,
  getMarketIntelligence,
  expandFromResearch,
} from "../services/washbizhub-perfection-engine";
import { importAAdvantageData } from "../scripts/import-aadvantage-codes";

const router = Router();

router.get("/audit", async (req, res) => {
  try {
    const audit = await runSelfAudit();
    res.json(audit);
  } catch (error) {
    console.error("[AI Research] Audit error:", error);
    res.status(500).json({ error: "Failed to run self-audit" });
  }
});

router.get("/improvement-plan", async (req, res) => {
  try {
    const plan = await generateImprovementPlan();
    res.json({ plan });
  } catch (error) {
    console.error("[AI Research] Plan error:", error);
    res.status(500).json({ error: "Failed to generate improvement plan" });
  }
});

router.post("/expand/:manufacturer", async (req, res) => {
  try {
    const { manufacturer } = req.params;
    const result = await expandManufacturerCoverage(decodeURIComponent(manufacturer));
    res.json(result);
  } catch (error) {
    console.error("[AI Research] Expand error:", error);
    res.status(500).json({ error: "Failed to expand manufacturer" });
  }
});

router.post("/full-expansion", async (req, res) => {
  try {
    const result = await runFullExpansion();
    res.json(result);
  } catch (error) {
    console.error("[AI Research] Full expansion error:", error);
    res.status(500).json({ error: "Failed to run full expansion" });
  }
});

router.post("/analyze-competitor", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Competitor name required" });
    }
    const result = await analyzeCompetitor(name);
    res.json(result);
  } catch (error) {
    console.error("[AI Research] Competitor analysis error:", error);
    res.status(500).json({ error: "Failed to analyze competitor" });
  }
});

// ==================== PERFECTION ENGINE ROUTES ====================

router.get("/full-audit", async (req, res) => {
  try {
    const audit = await runFullAudit();
    res.json(audit);
  } catch (error) {
    console.error("[Perfection Engine] Full audit error:", error);
    res.status(500).json({ error: "Failed to run full audit" });
  }
});

router.get("/perfection-plan", async (req, res) => {
  try {
    const plan = await generateImprovementPlan();
    res.json({ plan });
  } catch (error) {
    console.error("[Perfection Engine] Plan error:", error);
    res.status(500).json({ error: "Failed to generate perfection plan" });
  }
});

router.get("/market-intelligence", async (req, res) => {
  try {
    const intelligence = await getMarketIntelligence();
    res.json(intelligence);
  } catch (error) {
    console.error("[Perfection Engine] Market intel error:", error);
    res.status(500).json({ error: "Failed to get market intelligence" });
  }
});

router.post("/import-research", async (req, res) => {
  try {
    const { brandData } = req.body;
    if (!brandData) {
      return res.status(400).json({ error: "Brand data required" });
    }
    const result = await expandFromResearch(brandData);
    res.json(result);
  } catch (error) {
    console.error("[Perfection Engine] Import error:", error);
    res.status(500).json({ error: "Failed to import research data" });
  }
});

router.post("/import-aadvantage", async (req, res) => {
  try {
    const result = await importAAdvantageData();
    res.json(result);
  } catch (error) {
    console.error("[Perfection Engine] AAdvantage import error:", error);
    res.status(500).json({ error: "Failed to import AAdvantage data" });
  }
});

export default router;
