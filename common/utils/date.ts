import moment from "moment";

export function getPhnomPenhTodayDate(format?: string) {
  return moment()
    .utc()
    .add(7, "hours")
    .format(format || "YYYY-MM-DD");
}

export function getPhnomPenhYesterdayDate(format?: string) {
  return moment()
    .utc()
    .add(7, "hours")
    .subtract(1, "days")
    .format(format || "YYYY-MM-DD");
}
