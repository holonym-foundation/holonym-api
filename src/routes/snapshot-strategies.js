import express from "express";
import {
  residesInUS,
  sybilResistanceGovId,
  sybilResistancePhone,
} from "../services/snapshot-strategies.js";

const router = express.Router();

router.get("/residence/country/us", residesInUS);
router.get("/sybil-resistance/gov-id", sybilResistanceGovId);
router.get("/sybil-resistance/phone", sybilResistancePhone);

export default router;
