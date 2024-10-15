import express from "express";
import { setKycSbt } from "../services/testnet-minter.js";

const router = express.Router();

router.post("/kyc", setKycSbt);

export default router;
