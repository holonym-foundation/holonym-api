import express from "express";
import { usResidencyCount, sybilResistanceCount } from "../services/metrics.js";

const router = express.Router();

router.get("/us-residency-count", usResidencyCount);
router.get("/sybil-resistance-count", sybilResistanceCount);

export default router;
