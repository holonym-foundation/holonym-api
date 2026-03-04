import express from "express";
import {
  sybilResistanceGovId,
  sybilResistancePhone,
  sybilResistanceBiometrics,
} from "../services/sybil-resistance.js";

const router = express.Router();

router.get("/gov-id/:network", sybilResistanceGovId);
router.get("/phone/:network", sybilResistancePhone);
router.get("/biometrics/:network", sybilResistanceBiometrics);

export default router;
