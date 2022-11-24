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
