import express from "express";
import { getResidesInUS } from "../services/residence.js";

const router = express.Router();

router.get("/country/us", getResidesInUS);

export default router;
