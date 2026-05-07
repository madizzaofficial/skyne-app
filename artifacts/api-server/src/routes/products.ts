import { Router, type IRouter } from "express";
import type { CreateContributionInput, ReviewContributionInput } from "../types/productContribution";
import {
  approveContribution,
  createProductContribution,
  getPendingContributions,
  rejectContribution,
  requestMoreInfo,
} from "../services/products/productContributionService";
import {
  lookupProductByBarcode,
  searchProducts,
} from "../services/products/productLookupService";

const router: IRouter = Router();

// GET /api/products/barcode/:barcode
router.get("/products/barcode/:barcode", async (req, res) => {
  const { barcode } = req.params;
  try {
    const result = await lookupProductByBarcode(barcode);
    const status =
      result.source === "not_found"
        ? 404
        : result.source === "open_beauty_facts_api" && !result.product
          ? 404
          : 200;
    res.status(status).json(result);
  } catch (err) {
    req.log.error({ err, barcode }, "barcode lookup failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// GET /api/products/search?q=...
router.get("/products/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(Number(req.query.limit) || 12, 30);

  if (!q || q.length < 2) {
    res.status(400).json({ message: "Le paramètre q doit faire au moins 2 caractères." });
    return;
  }

  try {
    const results = await searchProducts(q, limit);
    res.json({ results, count: results.length });
  } catch (err) {
    req.log.error({ err, q }, "product search failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// POST /api/products/contributions
router.post("/products/contributions", async (req, res) => {
  const input = req.body as CreateContributionInput;
  if (!input.barcode && !input.productId) {
    res.status(400).json({ message: "barcode ou productId est requis." });
    return;
  }
  try {
    const contribution = await createProductContribution(input);
    res.status(201).json(contribution);
  } catch (err) {
    req.log.error({ err }, "create contribution failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// GET /api/products/contributions/pending
router.get("/products/contributions/pending", async (req, res) => {
  try {
    const contributions = await getPendingContributions();
    res.json({ contributions, count: contributions.length });
  } catch (err) {
    req.log.error({ err }, "list contributions failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// POST /api/products/contributions/:id/approve
router.post("/products/contributions/:id/approve", async (req, res) => {
  const { id } = req.params;
  const input = req.body as ReviewContributionInput;
  if (!input.reviewerId) {
    res.status(400).json({ message: "reviewerId est requis." });
    return;
  }
  try {
    const result = await approveContribution(id, input);
    if (!result) {
      res.status(404).json({ message: "Contribution introuvable ou déjà traitée." });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err, id }, "approve contribution failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// POST /api/products/contributions/:id/reject
router.post("/products/contributions/:id/reject", async (req, res) => {
  const { id } = req.params;
  const input = req.body as ReviewContributionInput;
  if (!input.reviewerId) {
    res.status(400).json({ message: "reviewerId est requis." });
    return;
  }
  try {
    const result = await rejectContribution(id, input);
    if (!result) {
      res.status(404).json({ message: "Contribution introuvable ou déjà traitée." });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err, id }, "reject contribution failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

// POST /api/products/contributions/:id/needs-info
router.post("/products/contributions/:id/needs-info", async (req, res) => {
  const { id } = req.params;
  const input = req.body as ReviewContributionInput;
  if (!input.reviewerId) {
    res.status(400).json({ message: "reviewerId est requis." });
    return;
  }
  try {
    const result = await requestMoreInfo(id, input);
    if (!result) {
      res.status(404).json({ message: "Contribution introuvable ou déjà traitée." });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err, id }, "needs-info contribution failed");
    res.status(500).json({ message: "Erreur interne." });
  }
});

export default router;
