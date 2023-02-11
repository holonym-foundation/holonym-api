import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import {
  logWithTimestamp,
  dateToMonthDayYearStr,
  convertEventsToTimeseries,
} from "../utils/utils.js";
import {
  resStoreAddrsByNetwork,
  sybilResistanceAddrsByNetwork,
  treeAddrsByNetwork,
} from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";

const timeseriesStartDate = new Date("Dec 08 2022").getTime();

async function usResidencyTotalCount(req, res) {
  logWithTimestamp("usResidencyTotalCount: Entered");
  let count = 0;
  for (const network of Object.keys(resStoreAddrsByNetwork)) {
    try {
      const contractAddr = resStoreAddrsByNetwork[network];
      const provider = providers[network];
      const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
      const usResidencyEvents = await contract.queryFilter("USResidency");
      count += usResidencyEvents?.length > 0 ? usResidencyEvents.length : 0;
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        "usResidencyTotalCount: Encountered error while getting smart contract events. Exiting"
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ result: count });
}

/**
 * This endpoint can be used to view the total number of US residency proofs
 * at any given day of the year.
 *
 * Returns an array of smart contract event objects such that every day of the year
 * has at least one corresponding object. If multiple events are emitted on a single
 * day, the event object corresponding to that day will be the last one of the day;
 * the other events in the day will not show up in the timeseries. Additionally,
 * a running total is added to each event (i.e., the nth event will have a property
 * `total` that equals n).
 */
async function usResidencyTimeseries(req, res) {
  logWithTimestamp("usResidencyTimeseries: Entered");
  const contractAddr = resStoreAddrsByNetwork[req.params.network];
  const provider = providers[req.params.network];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const usResidencyEvents = await contract.queryFilter("USResidency");
    const timeseries = await convertEventsToTimeseries(
      usResidencyEvents,
      timeseriesStartDate
    );
    if (req.query["only-total"]) {
      const newTimeseries = timeseries.map((event) => ({
        total: event.total,
        dateStr: event.dateStr,
      }));
      return res.status(200).json({ result: newTimeseries });
    }
    return res.status(200).json({ result: timeseries });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "usResidencyTimeseries: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

async function sybilResistanceTotalCount(req, res) {
  logWithTimestamp("sybilResistanceTotalCount: Entered");
  let count = 0;
  for (const network of Object.keys(sybilResistanceAddrsByNetwork)) {
    try {
      const contractAddr = sybilResistanceAddrsByNetwork[network];
      const provider = providers[network];
      const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
      const uniquenessEvents = await contract.queryFilter("Uniqueness");
      count += uniquenessEvents?.length > 0 ? uniquenessEvents.length : 0;
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        "sybilResistanceTotalCount: Encountered error while getting smart contract events. Exiting"
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ result: count });
}

/**
 * This endpoint can be used to view the total number of Sybil resistance proofs
 * at any given day of the year.
 *
 * Returns an array of smart contract event objects such that every day of the year
 * has at least one corresponding object. If multiple events are emitted on a single
 * day, the event object corresponding to that day will be the last one of the day;
 * the other events in the day will not show up in the timeseries. Additionally,
 * a running total is added to each event (i.e., the nth event will have a property
 * `total` that equals n).
 */
async function sybilResistanceTimeseries(req, res) {
  logWithTimestamp("sybilResistanceTimeseries: Entered");
  const contractAddr = sybilResistanceAddrsByNetwork[req.params.network];
  const provider = providers[req.params.network];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const uniquenessEvents = await contract.queryFilter("Uniqueness");
    const timeseries = await convertEventsToTimeseries(
      uniquenessEvents,
      timeseriesStartDate
    );
    if (req.query["only-total"]) {
      const newTimeseries = timeseries.map((event) => ({
        total: event.total,
        dateStr: event.dateStr,
      }));
      return res.status(200).json({ result: newTimeseries });
    }
    return res.status(200).json({ result: timeseries });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceTimeseries: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export {
  usResidencyTotalCount,
  usResidencyTimeseries,
  sybilResistanceTotalCount,
  sybilResistanceTimeseries,
};
