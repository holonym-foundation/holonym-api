import express from "express";
import {
  sybilResistanceGovId,
  sybilResistancePhone,
} from "../services/sybil-resistance.js";

const router = express.Router();

router.get("/gov-id/:network", sybilResistanceGovId);
router.get("/phone/:network", sybilResistancePhone);

export default router;
