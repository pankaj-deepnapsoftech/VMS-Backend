// exportToExcel.js
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Save JSON array to Excel with only actual dataset fields
 * @param {Array<Object>} jsonData
 * @param {string} fileName
 * @returns {Promise<string>} file path
 */
export async function saveJsonToExcel(jsonData, fileName = "data.xlsx") {
  try {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error("jsonData must be a non-empty array of objects.");
    }

    // Remove unwanted fields (like Proof_of_Concept and Exploit_Details)
    const fieldsToIgnore = ["Proof_of_Concept", "Exploit_Details"];
    const cleanedData = jsonData.map(obj => {
      const newObj = {};
      for (const key in obj) {
        if (!fieldsToIgnore.includes(key)) {
          // Convert ObjectId or Date to string
          if (typeof obj[key] === "object" && obj[key] !== null) {
            if (obj[key]._bsontype === "ObjectID") {
              newObj[key] = obj[key].toString();
            } else if (obj[key] instanceof Date) {
              newObj[key] = obj[key].toISOString();
            } else {
              newObj[key] = obj[key];
            }
          } else {
            newObj[key] = obj[key];
          }
        }
      }
      return newObj;
    });

    // Use keys only from the first object
    const headers = Object.keys(cleanedData[0]);

    // Normalize data (fill missing keys with empty string)
    const normalizedData = cleanedData.map(obj => {
      const normalized = {};
      headers.forEach(key => {
        normalized[key] = obj[key] ?? "";
      });
      return normalized;
    });

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(normalizedData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Prepare folder
    const exportDir = path.join(__dirname, "../../public", "temp");
    await fs.promises.mkdir(exportDir, { recursive: true });

    // Timestamp filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const finalFileName = fileName.replace(".xlsx", `-${timestamp}.xlsx`);
    const filePath = path.join(exportDir, finalFileName);

    // Write Excel file
    XLSX.writeFile(workbook, filePath);
    console.log(`✅ Excel file saved at: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("❌ Error saving Excel file:", error);
    throw error;
  }
}
