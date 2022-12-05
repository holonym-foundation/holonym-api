import express from "express";
import { sybilResistance } from "../services/sybil-resistance.js";

const router = express.Router();

router.get("/gov-id", sybilResistance);

export default router;
