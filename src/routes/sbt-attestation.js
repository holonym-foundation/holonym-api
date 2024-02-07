import express from "express";
import { sybilResistanceGovIdSBT, getAttestor } from "../services/sbt-attestation.js";

const router = express.Router();

router.get("/sbts/gov-id/", sybilResistanceGovIdSBT);
router.get("/attestor", getAttestor);

export default router;
