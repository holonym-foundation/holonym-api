import express from "express";
import {
  usResidencyTotalCount,
  usResidencyTimeseries,
  sybilResistanceTotalCount,
  sybilResistanceTimeseries,
  leavesTimeseries,
} from "../services/metrics.js";

const router = express.Router();

router.get("/us-residency-count/total", usResidencyTotalCount);
router.get("/us-residency-count/timeseries/:network", usResidencyTimeseries);
router.get("/sybil-resistance-count/total", sybilResistanceTotalCount);
router.get("/sybil-resistance-count/timeseries/:network", sybilResistanceTimeseries);
router.get("/leaves/timeseries/:network", leavesTimeseries);

export default router;
