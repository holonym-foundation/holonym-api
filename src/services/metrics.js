import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import {
  logWithTimestamp,
  dateToMonthDayYearStr,
  fillInDates,
} from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import MerkleTreeABI from "../constants/MerkleTreeABI.js";

async function usResidencyTotalCount(req, res) {
  logWithTimestamp("usResidencyTotalCount: Entered");
  const contractAddr = contractAddresses["optimistic-goerli"]["ResidencyStore"];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const usResidencyEvents = await contract.queryFilter("USResidency");
    const count = usResidencyEvents?.length > 0 ? usResidencyEvents.length : 0;
    return res.status(200).json({ result: count });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "usResidencyTotalCount: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
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
  const contractAddr = contractAddresses["optimistic-goerli"]["ResidencyStore"];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const usResidencyEvents = await contract.queryFilter("USResidency");
    // TODO: Make the rest of this a separate function; this code is copied/pasted into the other timeseries endpoints
    const eventsWithTimestamps = [];
    let eventCount = 1;
    for (const event of usResidencyEvents) {
      const block = await event.getBlock();
      eventsWithTimestamps.push({
        ...event,
        timestamp: block.timestamp * 1000,
        total: eventCount,
        // dateStr: dateToMonthDayYearStr(new Date(block.timestamp * 1000)),
      });
      eventCount += 1;
    }
    const dataWithFilledInDates = fillInDates(eventsWithTimestamps).map((item) => ({
      ...item,
      dateStr: dateToMonthDayYearStr(new Date(item.timestamp)),
    }));
    const dataWithoutDuplicateDays = [];
    const uniqueDateStrings = [
      ...new Set(dataWithFilledInDates.map((item) => item.dateStr)),
    ];
    for (let i = dataWithFilledInDates.length - 1; i > 0; i--) {
      const thisDateStr = dataWithFilledInDates[i].dateStr;
      if (uniqueDateStrings.includes(thisDateStr)) {
        dataWithoutDuplicateDays.push(dataWithFilledInDates[i]);
        delete uniqueDateStrings[uniqueDateStrings.indexOf(thisDateStr)];
      }
    }
    const orderedDataWithoutDuplicates = dataWithoutDuplicateDays.reverse();
    return res.status(200).json({ result: orderedDataWithoutDuplicates });
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
  const contractAddr = contractAddresses["optimistic-goerli"]["AntiSybilStore"];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const uniquenessEvents = await contract.queryFilter("Uniqueness");
    const count = uniquenessEvents?.length > 0 ? uniquenessEvents.length : 0;
    return res.status(200).json({ result: count });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceTotalCount: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
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
  const contractAddr = contractAddresses["optimistic-goerli"]["AntiSybilStore"];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const uniquenessEvents = await contract.queryFilter("Uniqueness");
    const eventsWithTimestamps = [];
    let eventCount = 1;
    for (const event of uniquenessEvents) {
      const block = await event.getBlock();
      eventsWithTimestamps.push({
        ...event,
        timestamp: block.timestamp * 1000,
        total: eventCount,
        // dateStr: dateToMonthDayYearStr(new Date(block.timestamp * 1000)),
      });
      eventCount += 1;
    }
    const dataWithFilledInDates = fillInDates(eventsWithTimestamps).map((item) => ({
      ...item,
      dateStr: dateToMonthDayYearStr(new Date(item.timestamp)),
    }));
    const dataWithoutDuplicateDays = [];
    const uniqueDateStrings = [
      ...new Set(dataWithFilledInDates.map((item) => item.dateStr)),
    ];
    for (let i = dataWithFilledInDates.length - 1; i > 0; i--) {
      const thisDateStr = dataWithFilledInDates[i].dateStr;
      if (uniqueDateStrings.includes(thisDateStr)) {
        dataWithoutDuplicateDays.push(dataWithFilledInDates[i]);
        delete uniqueDateStrings[uniqueDateStrings.indexOf(thisDateStr)];
      }
    }
    const orderedDataWithoutDuplicates = dataWithoutDuplicateDays.reverse();
    return res.status(200).json({ result: orderedDataWithoutDuplicates });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceTimeseries: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
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
async function leavesTimeseries(req, res) {
  logWithTimestamp("leavesTimeseries: Entered");
  const contractAddr = contractAddresses["optimistic-goerli"]["MerkleTree"];
  try {
    const contract = new ethers.Contract(contractAddr, MerkleTreeABI, provider);
    const uniquenessEvents = await contract.queryFilter("LeafInserted");
    const eventsWithTimestamps = [];
    let eventCount = 1;
    for (const event of uniquenessEvents) {
      const block = await event.getBlock();
      eventsWithTimestamps.push({
        ...event,
        timestamp: block.timestamp * 1000,
        total: eventCount,
        // dateStr: dateToMonthDayYearStr(new Date(block.timestamp * 1000)),
      });
      eventCount += 1;
    }
    const dataWithFilledInDates = fillInDates(eventsWithTimestamps).map((item) => ({
      ...item,
      dateStr: dateToMonthDayYearStr(new Date(item.timestamp)),
    }));
    const dataWithoutDuplicateDays = [];
    const uniqueDateStrings = [
      ...new Set(dataWithFilledInDates.map((item) => item.dateStr)),
    ];
    for (let i = dataWithFilledInDates.length - 1; i > 0; i--) {
      const thisDateStr = dataWithFilledInDates[i].dateStr;
      if (uniqueDateStrings.includes(thisDateStr)) {
        dataWithoutDuplicateDays.push(dataWithFilledInDates[i]);
        delete uniqueDateStrings[uniqueDateStrings.indexOf(thisDateStr)];
      }
    }
    const orderedDataWithoutDuplicates = dataWithoutDuplicateDays.reverse();
    return res.status(200).json({ result: orderedDataWithoutDuplicates });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "leavesTimeseries: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export {
  usResidencyTotalCount,
  usResidencyTimeseries,
  sybilResistanceTotalCount,
  sybilResistanceTimeseries,
  leavesTimeseries,
};
