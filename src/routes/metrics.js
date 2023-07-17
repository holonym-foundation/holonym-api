import express from "express";
import {
  usResidencyTotalCount,
  usResidencyTimeseries,
  sybilResistanceTotalCount,
  sybilResistanceTimeseries,
  sybilResistancePhoneTotalCount,
  sybilResistancePhoneTimeseries,
} from "../services/metrics.js";

const router = express.Router();

router.get("/us-residency-count/total", usResidencyTotalCount);
router.get("/us-residency-count/timeseries/:network", usResidencyTimeseries);
router.get("/sybil-resistance-count/total", sybilResistanceTotalCount);
router.get("/sybil-resistance-count/timeseries/:network", sybilResistanceTimeseries);
router.get("/sybil-resistance-count/phone/total", sybilResistancePhoneTotalCount);
router.get(
  "/sybil-resistance-count/phone/timeseries/:network",
  sybilResistancePhoneTimeseries
);

export default router;
