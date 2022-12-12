import express from "express";
import { getLeaves } from "../services/merkle-tree.js";

const router = express.Router();

router.get("/leaves/:network", getLeaves);

export default router;
