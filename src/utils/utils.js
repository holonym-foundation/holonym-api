import { strict as assert } from "node:assert";

export function logWithTimestamp(message) {
  console.log(`${new Date().toISOString()} ${message}`);
}

export function assertValidAddress(address) {
  try {
    assert.ok(typeof address == "string");
    assert.equal(address.length, 42);
    assert.ok(address.startsWith("0x"));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function dateToMonthDayYearStr(date) {
  return (
    date.toString().split(" ")[1] +
    " " +
    date.toString().split(" ")[2] +
    " " +
    date.toString().split(" ")[3]
  );
}

/**
 * Fill in missing days in data array. Pseudocode:
 * Convert
 *    [{ time: "0", total: 1 }, { time: "2", total: 2 }]
 * to
 *    [{ time: "0", total: 1 }, { time: "1", total: 1 }, { time: "2", total: 2 }]
 * @param {Array<object>} data Objects in this array must have a `timestamp` property
 * @returns
 */
export function fillInDates(data) {
  // TODO: Add startDate param. This will allow us to synchronize multiple timeseries datasets
  const allDatesInData = data.map((timeObj) => timeObj.timestamp);
  const startTime = data[0].timestamp;
  const endTime = data[data.length - 1].timestamp;
  let i = 0;
  for (
    let t = new Date(startTime).getTime();
    t < new Date(endTime).getTime();
    t += 86400000
  ) {
    const dateString = dateToMonthDayYearStr(new Date(t));
    if (!allDatesInData.includes(dateString)) {
      allDatesInData.push(dateString);
      data.push({
        timestamp: dateString,
      });
    }
    i += 1;
  }
  const sortedData = data.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  let lastItem = {};
  return sortedData.map((item, index) => {
    if (Object.keys(item).length > 1) {
      lastItem = item;
      return item;
    } else {
      return {
        total: lastItem.total,
        timestamp: item.timestamp,
      };
    }
  });
}

/**
 * @param {Array<ethers.Event>} events
 * @param {number} startTime Unix timestamp representing day at which timeseries should start
 */
export async function convertEventsToTimeseries(events, startTime) {
  const eventsWithTimestamps = startTime ? [{ timestamp: startTime }] : [];
  let eventCount = 1;
  for (const event of events) {
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
    // fill in totals for dates added
    if (!dataWithFilledInDates[i].total) {
      dataWithFilledInDates[i].total = 0;
    }
  }

  return dataWithoutDuplicateDays.reverse();
}
