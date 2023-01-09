import express from "express";
import { getResidesInUS, usResidents } from "../services/residence.js";

const router = express.Router();

router.get("/country/us/:network", getResidesInUS);
router.get("/country/us/crypto-addresses/:network", usResidents);

export default router;
