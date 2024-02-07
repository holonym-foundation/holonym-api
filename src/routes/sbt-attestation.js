import express from "express";
import {
  sybilResistanceGovIdSBT,
  getAttestorAddress,
} from "../services/sbt-attestation.js";

const router = express.Router();

router.get("/sbts/gov-id/", sybilResistanceGovIdSBT);
router.get("/attestor-address", getAttestorAddress);

export default router;
