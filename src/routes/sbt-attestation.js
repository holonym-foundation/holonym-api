import express from "express";
import {
  sybilResistanceGovIdSBT,
  sybilResistanceEPassportSBT,
  sybilResistancePhoneSBT,
  getAttestor
} from "../services/sbt-attestation.js";

const router = express.Router();

router.get("/sbts/gov-id/", sybilResistanceGovIdSBT);
router.get("/sbts/e-passport/", sybilResistanceEPassportSBT);
router.get("/sbts/phone/", sybilResistancePhoneSBT);
router.get("/attestor", getAttestor);

export default router;
