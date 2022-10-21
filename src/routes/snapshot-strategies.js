import express from "express";
import { residesInUS, sybilResistance } from "../services/snapshot-strategies.js";

const router = express.Router();

router.get("/us-residency", residesInUS);
router.get("/sybil-resistance", sybilResistance);

export default router;
