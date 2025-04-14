import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { DataModel } from '../models/Data.model.js';
import { NotFoundError } from '../utils/customError.js';
import { excelSerialToDate } from '../utils/excelSerialToDate.js';
import { config } from '../config/env.config.js';
import { InfraModel } from '../models/infra.model.js';
import { getExploitability } from './OpenApi.controller.js';

export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function convertKeysToUnderscore(obj) {
  const newObj = {};

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/\s+/g, '_');
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}

const CreateData = AsyncHandler(async (req, res) => {
  const id = req.currentUser?._id;
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }
  const data = convertExcelToJson(file.path);
  const newData = await Promise.all(data.map(async (item) => {
    const exploitability = await getExploitability(item.Title, item.Severity);
    return { ...item, exploitability };
  }));


  const newdata = newData.map((item) => convertKeysToUnderscore({ ...item, creator_id: id }));
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

  const getAllData = await DataModel.find({})
    .populate([
      { path: 'Assigned_To', select: 'full_name' },
      { path: 'creator_id', select: 'full_name' },
    ]).sort({ _id: -1 })
    .skip(skip)
    .limit(limits)
    .exec();
  const data = getAllData.map((item) => ({
    _id: item._id,
    Organization: item?.Organization,
    Application_Name: item?.Application_Name,
    Title: item?.Title,
    Assigned_To: item?.Assigned_To,
    Vulnerability_Classification: item?.Vulnerability_Classification,
    Scan_Type: item?.Scan_Type,
    Severity: item?.Severity,
    Priority: item?.Priority,
    Status: item?.Status,
    Remediated_Date: item?.Remediated_Date,
    Ageing: item?.Ageing,
    Remediate_Upcoming_Time_Line: item?.Remediate_Upcoming_Time_Line,
    creator: item?.creator_id?.full_name,
    detailed_Report: item?.docs,
    Exception_time: item?.Expection_time,
  }));
  return res.status(StatusCodes.OK).json({
    message: 'Data Found',
    data,
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

const DataCounsts = AsyncHandler(async (req, res) => {
  const data = await DataModel.find(
    req.currentUser?.Organization
      ? { Organization: req.currentUser?.Organization }
      : {}
  ).exec();

  const Infrastructure = (await InfraModel.find({})).length;

  const counts = data.reduce(
    (acc, item) => {
      const status = item.Status?.toLocaleLowerCase();

      if (status?.includes('in progress')) acc.inProgress++;
      if (status === 'open') acc.open++;
      if (status?.includes('reopen')) acc.reopen++;
      if (status?.includes('closed')) acc.closed++;
      if (status?.includes('on hold')) acc.onHold++;
      if (status?.includes('exception')) acc.Exceptions++;
      if (item.Scan_Type?.includes('Web Application')) acc.Application++;

      acc.totalData++;
      return acc;
    },
    {
      totalData: 0,
      inProgress: 0,
      open: 0,
      reopen: 0,
      closed: 0,
      onHold: 0,
      Exceptions: 0,
      Application: 0,
    },
  );

  return res.status(StatusCodes.OK).json({ ...counts, Infrastructure });
});

const vulnerableItems = AsyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based index
  const currentYear = now.getFullYear();

  // Calculate the start of the 2 months ago
  const startDate = new Date(currentYear, currentMonth - 2, 1); // Beginning of month 2 months ago
  const endDate = new Date(currentYear, currentMonth + 1, 1); // Beginning of next month

  const matchCondition = req.currentUser?.Organization
    ? { Organization: req.currentUser.Organization }
    : {};

  const data = await DataModel.aggregate([
    {
      $match: {
        ...matchCondition,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $project: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
        Severity: 1,
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        name: { $push: '$Severity' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const newData = data.map((item) => ({
    month: months[item._id.month - 1],
    year: item._id.year,
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


const VulnerableRiskRating = AsyncHandler(async (req, res) => {
  const currentDate = new Date();
  const past90Days = new Date();
  past90Days.setDate(currentDate.getDate() - 90); // 90 days ago

  // Dynamic match condition for organization filter
  const matchCondition = req.currentUser?.Organization
    ? { Organization: req.currentUser.Organization }
    : {};

  const data = await DataModel.aggregate([
    {
      $match: {
        ...matchCondition,
        createdAt: { $gte: past90Days, $lte: currentDate }, // Last 90 days data
      },
    },
    {
      $project: {
        monthDiff: {
          $divide: [{ $subtract: [currentDate, "$createdAt"] }, 1000 * 60 * 60 * 24], // Convert ms to days
        },
        Severity: 1,
      },
    },
    {
      $group: {
        _id: null,
        severities: { $push: { Severity: "$Severity", daysOld: "$monthDiff" } },
      },
    },
  ]);

  if (!data.length) {
    return res.status(StatusCodes.OK).json({});
  }

  const severityLevels = ["Critical", "High", "Medium", "Low", "Informational"];

  // Function to categorize severities by age range
  const categorizeSeverities = (severity) => {
    return data[0].severities.reduce(
      (acc, item) => {
        if (item.Severity?.toLowerCase() === severity.toLowerCase()) {
          if (item.daysOld <= 30) acc["0-30 Days"]++;
          else if (item.daysOld <= 60) acc["31-60 Days"]++;
          else if (item.daysOld <= 90) acc["61-90 Days"]++;
          else acc["90+ Days"]++;
        }
        return acc;
      },
      { name: severity, "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 }
    );
  };

  // Generate response dynamically for all severity levels
  const response = severityLevels.reduce((acc, level) => {
    acc[level] = categorizeSeverities(level);
    return acc;
  }, {});

  return res.status(StatusCodes.OK).json(response);
});


const NewAndCloseVulnerable = AsyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();

  const matchCondition = req.currentUser?.Organization
    ? { Organization: req.currentUser.Organization }
    : {};

  const data = await DataModel.aggregate([
    {
      $match: {
        ...matchCondition,
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        name: { $push: '$Status' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const newData = data.map((item) => ({
    month: months[item._id - 1],
    Open: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('open')).length,
    Closed: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('closed')).length,
    Exception: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('exception')).length,
  }));

  return res.status(StatusCodes.OK).json({
    newData,
  });
});

const ClosevulnerableItems = AsyncHandler(async (req, res) => {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);

  const data = await DataModel.find(
    req.currentUser?.Organization
      ? { Organization: req.currentUser?.Organization }
      : {}
  );

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

const CriticalHighVulnerable = AsyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const matchCondition = req.currentUser?.Organization
    ? { Organization: req.currentUser.Organization }
    : {};
  const data = await DataModel.find({ ...matchCondition, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

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

const CriticalHighVulnerableOverdue = AsyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const matchCondition = req.currentUser?.Organization
    ? { Organization: req.currentUser.Organization }
    : {};
  const data = await DataModel.find({ ...matchCondition, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

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
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
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
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
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
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
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
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
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
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    Severity: { $in: ['High', 'Low', 'Medium', 'Critical'] },
  });

  const high = data.filter((item) => item.Severity === 'High').length;
  const low = data.filter((item) => item.Severity === 'Low').length;
  const medium = data.filter((item) => item.Severity === 'Medium').length;
  const critical = data.filter((item) => item.Severity === 'Critical').length;

  return res.status(StatusCodes.OK).json({
    high,
    low,
    medium,
    critical,
  });
});

const BulkAsignedTask = AsyncHandler(async (req, res) => {
  const { tasks, Assigned_To } = req.body;
  if (tasks.length < 0 || !Assigned_To.trim()) {
    throw new NotFoundError('Tasks and Assigned To is required', BulkAsignedTask);
  }
  await DataModel.updateMany({ _id: { $in: tasks } }, { Assigned_To });
  return res.status(StatusCodes.OK).json({
    message: 'Tasks assined Successful',
  });
});

const TopVulnerabilities = AsyncHandler(async (req, res) => {
  const data = await DataModel.find(
    req.currentUser?.Organization
      ? { Organization: req.currentUser.Organization }
      : {}
  ).exec();

  const countMap = {};
  const detailsMap = {};

  data.forEach(item => {
    const title = item.Title?.trim().toLowerCase();
    if (!title) return;

    countMap[title] = (countMap[title] || 0) + 1;

    if (!detailsMap[title]) {
      detailsMap[title] = {
        name: item.Title.trim(),
        exploitability: item.exploitability || 0
      };
    }
  });

  const result = Object.keys(detailsMap).map(key => ({
    ...detailsMap[key],
    count: countMap[key]
  }));

  result.sort((a, b) => b.count - a.count);

  const top5 = result.slice(0, 5);

  return res.status(StatusCodes.OK).json({
    top5Vulnerabilities: top5,
  });
});


const GetAssetsOpenIssues = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { Organization } = req.body;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await DataModel.find({
    Organization,
    Status: 'Open',
  })
    .populate('Assigned_To', 'full_name')
    .skip(skip)
    .limit(limits);

  return res.status(StatusCodes.OK).json({
    data,
  });
});

const GetOrganization = AsyncHandler(async (_req, res) => {
  const find = await DataModel.find({});
  let obj = {};
  let data = [];
  find.map((item) => {
    if (!obj[item.Organization]) {
      obj[item.Organization] = true;
      data.push(item.Organization);
    }
  });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const ExpectionApprove = AsyncHandler(async (req, res) => {
  const Organization = req.currentUser?.Organization;
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const data = await DataModel.find({ Organization, Status: 'Exception', client_Approve: false }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.ACCEPTED).json({
    data,
  });
});

const ExpectionVerify = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const data = await DataModel.find({ Status: 'Exception', client_Approve: true }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.ACCEPTED).json({
    data,
  });
});

const UploadPdf = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    throw new NotFoundError('File is required', 'UploadPdf method');
  }
  const { filename } = req.file;
  const path = `${config.NODE_ENV !== 'development' ? config.FILE_URL : config.FILE_URL_LOCAL}/file/${filename}`;

  const find = await DataModel.findById(id);
  if (!find) {
    throw new NotFoundError('data not Found', 'UploadPdf method');
  }
  await DataModel.findByIdAndUpdate(id, { docs: path });
  return res.status(StatusCodes.OK).json({
    message: 'File uploaded successful',
  });
});

const AdminExpectionDataFiftyDays = AsyncHandler(async (_req, res) => {
  // Get the current date
  const currentDate = new Date();

  // First day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // 15th day of the current month (Middle day)
  const middleDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

  // Last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // 15th day of the next month
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);

  // Fetch the data for the date range between the first day of this month and the 15th day of the next month
  const data = await DataModel.find({
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(), // Start date
      $lte: nextMonthDate.toISOString(), // End date
    },
  });

  // Initialize counters
  let one = 0;
  let two = 0;
  let three = 0;

  // Process each data item and categorize by date ranges
  data.forEach((item) => {
    if (item.Expection_time >= firstDayOfMonth && item.Expection_time < middleDayOfMonth) {
      one += 1;
    }

    if (item.Expection_time >= middleDayOfMonth && item.Expection_time < lastDayOfMonth) {
      two += 1;
    }

    if (item.Expection_time >= lastDayOfMonth && item.Expection_time <= nextMonthDate) {
      three += 1;
    }
  });

  // Return response with counts and data
  return res.status(StatusCodes.OK).json({
    '15 days': one,
    '30 days': two,
    '45 days': three,
  });
});

const ClientExpectionDataFiftyDays = AsyncHandler(async (req, res) => {
  // Get the current date
  const currentDate = new Date();

  // First day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // 15th day of the current month (Middle day)
  const middleDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

  // Last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // 15th day of the next month
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);

  // Fetch the data for the date range between the first day of this month and the 15th day of the next month
  const data = await DataModel.find({
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(),
      $lte: nextMonthDate.toISOString(),
    },
    Organization: req.currentUser?.Organization,
  });

  // Initialize counters
  let one = 0;
  let two = 0;
  let three = 0;

  // Process each data item and categorize by date ranges
  data.forEach((item) => {
    if (item.Expection_time >= firstDayOfMonth && item.Expection_time < middleDayOfMonth) {
      one += 1;
    }

    if (item.Expection_time >= middleDayOfMonth && item.Expection_time < lastDayOfMonth) {
      two += 1;
    }

    if (item.Expection_time >= lastDayOfMonth && item.Expection_time <= nextMonthDate) {
      three += 1;
    }
  });

  return res.status(StatusCodes.OK).json({
    '15 days': one,
    '30 days': two,
    '45 days': three,
  });
});

const AdminRiskRating = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Status: 'Exception' });

  let monthlyData = {};

  for (let item of data) {
    const itemDate = new Date(item.createdAt);
    const month = itemDate.getMonth() + 1;

    if (!monthlyData[months[month - 1]]) {
      monthlyData[months[month - 1]] = { RiskAccepted: 0, AwaitingApproval: 0 };
    }

    if (item.client_Approve) {
      monthlyData[months[month - 1]].RiskAccepted += 1;
    } else {
      monthlyData[months[month - 1]].AwaitingApproval += 1;
    }
  }

  return res.status(StatusCodes.ACCEPTED).json({
    monthlyData,
  });
});

const ClientRiskRating = AsyncHandler(async (req, res) => {
  const data = await DataModel.find({ Status: 'Exception', Organization: req.currentUser?.Organization });
  let monthlyData = {};

  for (let item of data) {
    const itemDate = new Date(item.createdAt);
    const month = itemDate.getMonth() + 1;

    if (!monthlyData[months[month - 1]]) {
      monthlyData[months[month - 1]] = { RiskAccepted: 0, AwaitingApproval: 0 };
    }

    if (item.client_Approve) {
      monthlyData[months[month - 1]].RiskAccepted += 1;
    } else {
      monthlyData[months[month - 1]].AwaitingApproval += 1;
    }
  }

  return res.status(StatusCodes.ACCEPTED).json({
    monthlyData,
  });
});

const AdminDeferredVulnerableItems = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Status: 'Exception' });
  let obj = {};

  for (let item of data) {
    if (!obj[item.Scan_Type]) {
      obj[item.Scan_Type] = 1;
    } else {
      obj[item.Scan_Type] += 1;
    }
  }

  return res.status(StatusCodes.OK).json({
    data: obj,
  });
});

const ClientDeferredVulnerableItems = AsyncHandler(async (req, res) => {
  const data = await DataModel.find({ Status: 'Exception', Organization: req.currentUser?.Organization });
  let obj = {};

  for (let item of data) {
    if (!obj[item.Scan_Type]) {
      obj[item.Scan_Type] = 1;
    } else {
      obj[item.Scan_Type] += 1;
    }
  }

  return res.status(StatusCodes.OK).json({
    data: obj,
  });
});

const TopExploitability = AsyncHandler(async (req, res) => {
  const data = await DataModel.find();
  const obj = {
    easy: 0,
    network: 0,
    public: 0,
    high: 0
  };

  data.map((item) => {
    if (item.exploitability <= 3) {
      obj.easy += 1;
    } else if (item.exploitability > 3 && item.exploitability <= 5) {
      obj.network += 1;
    } else if (item.exploitability > 5 && item.exploitability <= 7) {
      obj.public += 1;
    } else {
      obj.high += 1;
    }
  });

  return res.status(StatusCodes.OK).json({
    data: obj,
    length: data.length,
  });

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
  BulkAsignedTask,
  TopVulnerabilities,
  GetAssetsOpenIssues,
  GetOrganization,
  ExpectionApprove,
  ExpectionVerify,
  UploadPdf,
  AdminExpectionDataFiftyDays,
  ClientExpectionDataFiftyDays,
  AdminRiskRating,
  ClientRiskRating,
  AdminDeferredVulnerableItems,
  ClientDeferredVulnerableItems,
  TopExploitability,
};
