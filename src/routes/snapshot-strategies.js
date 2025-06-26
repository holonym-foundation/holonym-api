import express from "express";
import {
  residesInUS,
  sybilResistanceGovId,
  sybilResistancePhone,
  sybilResistanceBiometrics,
} from "../services/snapshot-strategies.js";

const router = express.Router();

router.get("/residence/country/us", residesInUS);
router.get("/sybil-resistance/gov-id", sybilResistanceGovId);
router.get("/sybil-resistance/phone", sybilResistancePhone);
router.get("/sybil-resistance/biometrics", sybilResistanceBiometrics);

export default router;
