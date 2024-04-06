import express from "express";
import {
  sybilResistanceGovId,
  sybilResistanceEPassport,
  sybilResistancePhone,
} from "../services/sybil-resistance.js";

const router = express.Router();

router.get("/gov-id/:network", sybilResistanceGovId);
router.get("/epassport/:network", sybilResistanceEPassport);
router.get("/phone/:network", sybilResistancePhone);

export default router;
