import express from "express";
import {
  getHasValidKycSbt,
  getHasValidEPassportSbt,
  getHasValidZkPassportSbt,
  getHasPhoneSbt,
  getHasValidBiometricsSbt,
} from "../services/sbts.js";

const router = express.Router();

router.get("/kyc/", getHasValidKycSbt);
router.get("/epassport/", getHasValidEPassportSbt);
router.get("/zk-passport/", getHasValidZkPassportSbt);
router.get("/phone/", getHasPhoneSbt);
router.get("/biometrics/", getHasValidBiometricsSbt);

export default router;
