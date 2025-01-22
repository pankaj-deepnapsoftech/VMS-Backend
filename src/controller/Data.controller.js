import fs from 'fs';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { StatusCodes } from 'http-status-codes';
import { DataModel } from '../models/Data.model.js';

function convertKeysToUnderscore(obj) {
    const newObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = key.replace(/\s+/g, '_'); 
            newObj[newKey] = obj[key];
        }
    }

    return newObj; 
}

const CreateData = AsyncHandler(async (req, res) => {
  const file = req.file;

  const data = convertExcelToJson(file.path);

  const newdata = data.map((item) => convertKeysToUnderscore(item));

   const result = newdata.map(async (item)=> await DataModel.create(item))

  fs.unlinkSync(file.path);

  return res.status(StatusCodes.OK).json({
    result,
  });
});

export { CreateData };
