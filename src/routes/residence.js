import express from "express";
import { getResidesInUS } from "../services/residence.js";

const router = express.Router();

router.get("/country/us/:network", getResidesInUS);

export default router;
