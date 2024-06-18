import express from "express";
import {
  getHasValidKycSbt,
  getHasValidEPassportSbt,
  getHasPhoneSbt
} from "../services/sbts.js";

const router = express.Router();

router.get("/kyc/", getHasValidKycSbt);
router.get("/epassport/", getHasValidEPassportSbt);
router.get("/phone/", getHasPhoneSbt);

export default router;
