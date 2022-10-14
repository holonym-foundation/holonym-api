import express from "express";
import { sybilResistance } from "../services/sybil-resistance.js";

const router = express.Router();

router.get("/", sybilResistance);

export default router;
