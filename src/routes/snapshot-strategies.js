import express from "express";
import { residesInUS, sybilResistance } from "../services/snapshot-strategies.js";

const router = express.Router();

router.get("/residence/country/us", residesInUS);
router.get("/sybil-resistance", sybilResistance);

export default router;
