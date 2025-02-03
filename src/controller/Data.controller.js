import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { DataModel } from '../models/Data.model.js';
import { NotFoundError } from '../utils/customError.js';
import { excelSerialToDate } from '../utils/excelSerialToDate.js';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  const id = req.currentUser?._id
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }
  const data = convertExcelToJson(file.path);
  const newdata = data.map((item) => convertKeysToUnderscore({...item,creator_id:id}));
  const result = await DataModel.create(newdata);

  fs.unlinkSync(file.path);

  return res.status(StatusCodes.OK).json({
    message: 'Data created Successful',
    result,
  });
});

const AddNewData = AsyncHandler(async (req, res) => {
  const data = req.body;
  for (let item in data) {
    if (!data[item]) {
      throw new NotFoundError('all fileld is required', 'AddNewData method');
    }
  }
  await DataModel.create(data);

  return res.status(StatusCodes.OK).json({
    message: 'data created',
  });
});

const getAllData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const getAllData = await DataModel.find({}).populate("Assigned_To","full_name").skip(skip).limit(limits).exec();
  return res.status(StatusCodes.OK).json({
    message: 'Data Found',
    data: getAllData,
  });
});

const DeteleOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await DataModel.findById(id).exec();
  if (!data) {
    throw new NotFoundError('data not Found', 'DeleteOneData method');
  }
  await DataModel.findByIdAndDelete(id).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data deleted Successful',
  });
});

const updateOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = await DataModel.findById(id).exec();
  if (!data) {
    throw new NotFoundError('data not Found', 'DeleteOneData method');
  }
  await DataModel.findByIdAndUpdate(id, update).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data updated Successful',
  });
});

const DataCounsts = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({}).exec();
  const totalData = data.length;
  const inProgress = data.filter((item) => item.Status?.toLocaleLowerCase().includes('open')).length;
  const open = data.filter((item) => item.Status?.toLocaleLowerCase() === 'open').length;
  const reopen = data.filter((item) => item.Status?.toLocaleLowerCase().includes('reopen')).length;
  const closed = data.filter((item) => item.Status?.toLocaleLowerCase().includes('closed')).length;
  const onHold = data.filter((item) => item.Status?.toLocaleLowerCase().includes('on hold')).length;
  return res.status(StatusCodes.OK).json({
    totalData,
    inProgress,
    open,
    reopen,
    closed,
    onHold,
  });
});

const vulnerableItems = AsyncHandler(async (_req, res) => {
  const currentYear = new Date().getFullYear();  // Get the current year

const data = await DataModel.aggregate([
  // Match documents from the current year only
  {
    $match: {
      createdAt: {
        $gte: new Date(currentYear, 0, 1),  // Start of the current year (January 1st)
        $lt: new Date(currentYear + 1, 0, 1) // Start of the next year (January 1st of the next year)
      }
    }
  },
  {
    $project: {
      month: { $month: '$createdAt' },
      Severity: 1
    }
  },
  {
    $group: {
      _id: { month: '$month' },
      name: { $push: '$Severity' }
    }
  },
  // Sort by year and month
  {
    $sort: { '_id.month': 1 }
  }
]);

  

  const newData = data.map((item) => ({
    month: months[item._id.month- 1],
    year:item._id.year,
    high: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('high')).length,
    low: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('low')).length,
    informational: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('informational')).length,
    medium: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('medium')).length,
    critical: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('critical')).length,
  }));

  return res.status(StatusCodes.OK).json({
    newData,
  });
});

const VulnerableRiskRating = AsyncHandler(async (_req, res) => {
  const data = await DataModel.aggregate([
    {
      $group: { _id: { $month: '$createdAt' }, name: { $push: '$Severity' } },
    },
  ]);

  const Critical = data.reduce(
    (acc, item) => {
      acc['name'] = 'Critical';
      acc['0-30 Days'] += item._id === 1 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('critical')).length : 0;
      acc['31-60 Days'] += item._id === 2 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('critical')).length : 0;
      acc['61-90 Days'] += item._id === 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('critical')).length : 0;
      acc['90+ Days'] += item._id > 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('critical')).length : 0;
      return acc;
    },
    { '0-30 Days': 0, '31-60 Days': 0, '61-90 Days': 0, '90+ Days': 0 },
  );

  const High = data.reduce(
    (acc, item) => {
      acc['name'] = 'High';
      acc['0-30 Days'] += item._id === 1 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('high')).length : 0;
      acc['31-60 Days'] += item._id === 2 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('high')).length : 0;
      acc['61-90 Days'] += item._id === 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('high')).length : 0;
      acc['90+ Days'] += item._id > 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('high')).length : 0;
      return acc;
    },
    { '0-30 Days': 0, '31-60 Days': 0, '61-90 Days': 0, '90+ Days': 0 },
  );

  const Medium = data.reduce(
    (acc, item) => {
      acc['name'] = 'Medium';
      acc['0-30 Days'] += item._id === 1 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('medium')).length : 0;
      acc['31-60 Days'] += item._id === 2 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('medium')).length : 0;
      acc['61-90 Days'] += item._id === 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('medium')).length : 0;
      acc['90+ Days'] += item._id > 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('medium')).length : 0;
      return acc;
    },
    { '0-30 Days': 0, '31-60 Days': 0, '61-90 Days': 0, '90+ Days': 0 },
  );

  const Low = data.reduce(
    (acc, item) => {
      acc['name'] = 'Low';
      acc['0-30 Days'] += item._id === 1 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('low')).length : 0;
      acc['31-60 Days'] += item._id === 2 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('low')).length : 0;
      acc['61-90 Days'] += item._id === 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('low')).length : 0;
      acc['90+ Days'] += item._id > 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('low')).length : 0;
      return acc;
    },
    { '0-30 Days': 0, '31-60 Days': 0, '61-90 Days': 0, '90+ Days': 0 },
  );

  const info = data.reduce(
    (acc, item) => {
      acc['name'] = 'info';
      acc['0-30 Days'] += item._id === 1 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('informational')).length : 0;
      acc['31-60 Days'] += item._id === 2 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('informational')).length : 0;
      acc['61-90 Days'] += item._id === 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('informational')).length : 0;
      acc['90+ Days'] += item._id > 3 ? item.name.filter((n) => n?.toLocaleLowerCase().includes('informational')).length : 0;
      return acc;
    },
    { '0-30 Days': 0, '31-60 Days': 0, '61-90 Days': 0, '90+ Days': 0 },
  );

  return res.status(StatusCodes.OK).json({
    Critical,
    High,
    Medium,
    Low,
    info,
  });
});

const NewAndCloseVulnerable = AsyncHandler(async (_req, res) => {
 const currentYear = new Date().getFullYear();  

const data = await DataModel.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(currentYear, 0, 1), 
        $lt: new Date(currentYear + 1, 0, 1),
      }
    }
  },
  {
    $group: { 
      _id: { $month: '$createdAt' }, 
      name: { $push: '$Status' }
    },
  },
  {
    $sort: { '_id': 1 }
  }
]);


  const newData = data.map((item) => ({
    month: months[item._id - 1],
    Open: item. name.filter((ite) => ite?.toLocaleLowerCase().includes('open')).length,
    Closed: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('closed')).length,
  }));

  return res.status(StatusCodes.OK).json({
    newData,
  });
});

const ClosevulnerableItems = AsyncHandler(async (_req, res) => {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);

  const data = await DataModel.find({});

  let TargetMet = 0;
  let TargetMissed = 0;
  let NoTarget = 0;
  let ApproachingTarget = 0;
  let InFlight = 0;

  for (const item of data) {
    const remediatedDate = item.Remediated_Date ? excelSerialToDate(item.Remediated_Date) : null;
    const statusLower = item.Status?.toLocaleLowerCase();

    if (statusLower?.includes('closed')) {
      TargetMet++;
    }

    if (remediatedDate && statusLower?.includes('open')) {
      TargetMissed++;
    }

    if (!remediatedDate) {
      NoTarget++;
    }

    if (remediatedDate && remediatedDate > today && remediatedDate < futureDate) {
      ApproachingTarget++;
    }

    if (remediatedDate && remediatedDate > futureDate) {
      InFlight++;
    }
  }

  return res.status(StatusCodes.OK).json({
    TargetMet,
    TargetMissed,
    NoTarget,
    ApproachingTarget,
    InFlight,
  });
});

const vulnerableTargets = AsyncHandler(async (_req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1), // Start of current month
          $lt: new Date(currentYear, currentMonth + 1, 0), // End of current month
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month
        name: { $push: { target: '$Status', time: '$Remediated_Date', createdAt: '$createdAt' } },
      },
    },
  ]);

  const newData = data.map((item) => ({
    data: item.name.filter((ite) => ite.target?.toLocaleLowerCase().includes('closed')),
  }))[0];

  const count = newData.data.reduce(
    (r, i) => {
      const remediatedDate = excelSerialToDate(i.time);
      const createdAtDate = new Date(i.createdAt);

      const differenceInDays = (remediatedDate - createdAtDate) / (24 * 60 * 60 * 1000);
      r['totalData'] += differenceInDays;

      return r;
    },
    { totalData: 0 },
  );

  const newCount = newData.data.length ? count.totalData / newData.data.length : 0;

  return res.status(StatusCodes.OK).json({
    averageDifferenceInDays: newCount.toFixed(),
  });
});

const CriticalVulnerable = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Severity: 'Critical', Status: 'Closed' });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const AssignedTask = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Assigned_To } = req.body;
  const find = await DataModel.findById(id).exec();
  if (!find) {
    throw new NotFoundError('Data not found', 'AssignedTask method');
  }
  await DataModel.findByIdAndUpdate(id, { Assigned_To });
  return res.status(StatusCodes.OK).json({
    message: 'Task Assigned Successful',
  });
});

const CriticalHighVulnerable = AsyncHandler(async (_req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const data = await DataModel.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

  let webApplication = 0;
  let mobileApplication = 0;
  let ApiServer = 0;

  for (let item of data) {
    if (item.Scan_Type.toLowerCase().includes('web application')) {
      webApplication++;
    }

    if (item.Scan_Type.toLowerCase().includes('mobile application')) {
      mobileApplication++;
    }

    if (item.Scan_Type.toLowerCase().includes('api Server')) {
      ApiServer++;
    }
  }

  return res.status(StatusCodes.OK).json({
    webApplication,
    mobileApplication,
    ApiServer,
  });
});

const CriticalHighVulnerableOverdue = AsyncHandler(async (_req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const data = await DataModel.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

  let webApplication = 0;
  let mobileApplication = 0;
  let ApiServer = 0;

  var todays = new Date();
  todays.setHours(0, 0, 0, 0);

  for (let item of data) {
    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('web application') && excelSerialToDate(item.Remediated_Date) > todays) {
      webApplication++;
    }

    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('mobile application') && excelSerialToDate(item.Remediated_Date) > todays) {
      mobileApplication++;
    }

    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('api Server') && excelSerialToDate(item.Remediated_Date) > todays) {
      ApiServer++;
    }
  }

  return res.status(StatusCodes.OK).json({
    webApplication,
    mobileApplication,
    ApiServer,
  });
});

const CriticalHighVulnerableItems = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  // Get the start of the period (two months ago) and the end of the period (current date)
  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  // Fetch data from the database
  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['High', 'Critical'] }, // Only select those with 'High' or 'Critical' severity
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: { $push: { Application_Name: '$Application_Name', Severity: '$Severity', Scan_Type: '$Scan_Type' } },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 } 
    }
  ]);

  // Helper function to get month name from month number
  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  // Initialize a map to store counts for each application and scan type
  const appCounts = {};

  // Determine the year range dynamically
  const years = new Set();
  data.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  res.status(StatusCodes.OK).json({ results });
});

const LowMediumVulnerableItems = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  // Get the start of the period (two months ago) and the end of the period (current date)
  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  // Fetch data from the database
  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['Low', 'Medium'] }, // Only select those with 'High' or 'Critical' severity
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: { $push: { Application_Name: '$Application_Name', Severity: '$Severity', Scan_Type: '$Scan_Type' } },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 } 
    }
  ]);

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  data.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  res.status(StatusCodes.OK).json({ results });
});

const CriticalHighVulnerableItemsOverdue = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['High', 'Critical'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null }, // Ensure Remediated_Date exists and is not null
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' }, // Extract month from createdAt
        year: { $year: '$createdAt' }, // Extract year from createdAt
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: {
          $push: {
            Application_Name: '$Application_Name',
            Severity: '$Severity',
            Scan_Type: '$Scan_Type',
            Remediated_Date: '$Remediated_Date',
            createdAt: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 } 
    }
  ]);

  const newdata = data.map((item) => ({
    _id: item._id,
    data: item.data.filter((ite) => moment(ite.Remediated_Date).isBefore(currentDate)),
  }));

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  newdata.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  return res.status(StatusCodes.OK).json({
    results,
  });
});

const LowMediumVulnerableItemsOverdue = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['Low', 'Medium'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null }, // Ensure Remediated_Date exists and is not null
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' }, // Extract month from createdAt
        year: { $year: '$createdAt' }, // Extract year from createdAt
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: {
          $push: {
            Application_Name: '$Application_Name',
            Severity: '$Severity',
            Scan_Type: '$Scan_Type',
            Remediated_Date: '$Remediated_Date',
            createdAt: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 } 
    }
  ]);

  const newdata = data.map((item) => ({
    _id: item._id,
    data: item.data.filter((ite) => moment(ite.Remediated_Date).isBefore(currentDate)),
  }));

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  newdata.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  return res.status(StatusCodes.OK).json({
    results,
  });
});

const ApplicationvulnerabilityCardData = AsyncHandler(async (_req, res) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const data = await DataModel.find({
    createdAt: { $gte:startOfMonth,$lt:endOfMonth },
    Severity:{$in:["High","Low","Medium","Critical"]}
  });

  const high = data.filter((item) =>item.Severity === 'High').length;
  const low = data.filter((item) =>item.Severity === 'Low').length;
  const medium = data.filter((item) =>item.Severity === 'Medium').length;
  const critical = data.filter((item) =>item.Severity === 'Critical').length;

  return res.status(StatusCodes.OK).json({
    high,
    low,
    medium,
    critical,
  });
});

const BulkAsignedTask = AsyncHandler(async(req,res)=>{
  const {tasks,Assigned_To} = req.body;
  if(tasks.length < 0 || !Assigned_To.trim()){
    throw new NotFoundError("Tasks and Assigned To is required",BulkAsignedTask)
  }
  await DataModel.updateMany({_id:{$in:tasks}},{Assigned_To})
  return res.status(StatusCodes.OK).json({
    message:"Tasks assined Successful"
  })
});

export {
  CreateData,
  getAllData,
  DeteleOneData,
  updateOneData,
  DataCounsts,
  vulnerableItems,
  VulnerableRiskRating,
  NewAndCloseVulnerable,
  ClosevulnerableItems,
  vulnerableTargets,
  CriticalVulnerable,
  AssignedTask,
  CriticalHighVulnerable,
  CriticalHighVulnerableOverdue,
  AddNewData,
  CriticalHighVulnerableItems,
  LowMediumVulnerableItems,
  CriticalHighVulnerableItemsOverdue,
  LowMediumVulnerableItemsOverdue,
  ApplicationvulnerabilityCardData,
  BulkAsignedTask
};
