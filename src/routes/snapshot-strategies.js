import express from "express";
import { residesInUS } from "../services/snapshot-strategies.js";

const router = express.Router();

router.get("/us-residency", residesInUS);

export default router;
