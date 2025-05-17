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


export function convertKeysToUnderscore(obj) {
  const newObj = {};

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/\s+/g, '_'); // Replace spaces with underscores
      const value = obj[key];

      // Trim only if value is a string (to avoid errors with non-string data)
      newObj[newKey] = typeof(value) === 'string' ? value.trim() : value;
    }
  }

  return newObj;
}



