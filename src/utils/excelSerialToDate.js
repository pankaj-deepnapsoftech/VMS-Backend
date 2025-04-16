export function excelSerialToDate(serial) {
  const excelStartDate = new Date(1899, 11, 30); // Excel starts counting from 1900-01-01 but has a bug and starts on 1899-12-30
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  return new Date(excelStartDate.getTime() + serial * millisecondsInDay);
}



export const jsDateFromExcelSerial = (serial) => {
  // Convert Excel serial date to JS Date
  const utc_days = Math.floor(Number(serial) - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
};
