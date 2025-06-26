import express from "express";
import {
  getHasValidKycSbt,
  getHasValidEPassportSbt,
  getHasPhoneSbt,
  getHasValidBiometricsSbt,
} from "../services/sbts.js";

const router = express.Router();

router.get("/kyc/", getHasValidKycSbt);
router.get("/epassport/", getHasValidEPassportSbt);
router.get("/phone/", getHasPhoneSbt);
router.get("/biometrics/", getHasValidBiometricsSbt);

export default router;
