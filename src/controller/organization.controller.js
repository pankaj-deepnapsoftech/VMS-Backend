import { StatusCodes } from 'http-status-codes';
import { DataModel } from '../models/Data.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import moment from 'moment';
import { months } from './Data.controller.js';

const OrgnizationData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const find = await DataModel.find({ Organization: req.currentUser?.Organization }).sort({ id: -1 }).skip(skip).limit(limits);

  const data = find.map((item) => ({
    _id: item._id,
    Organization: item?.Organization,
    Application_Name: item?.Application_Name,
    Title: item?.Title,
    Vulnerability_Classification: item?.Vulnerability_Classification,
    Scan_Type: item?.Scan_Type,
    Severity: item?.Severity,
    Priority: item?.Priority,
    Status: item?.Status,
    Remediated_Date: item?.Remediated_Date,
    Ageing: item?.Ageing,
    Remediate_Upcoming_Time_Line: item?.Remediate_Upcoming_Time_Line,
    creator: item?.creator_id?.full_name,
  }));

  return res.status(StatusCodes.ACCEPTED).json({
    data,
  });
});

const CriticalHighVulnerableItems = AsyncHandler(async (req, res) => {
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
        Severity: { $in: ['High', 'Critical'] },
        Organization: req.currentUser?.Organization,
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

const LowMediumVulnerableItems = AsyncHandler(async (req, res) => {
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
        Severity: { $in: ['Low', 'Medium'] },
        Organization: req.currentUser?.Organization,
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

const CriticalHighVulnerableItemsOverdue = AsyncHandler(async (req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['High', 'Critical'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null },
        Organization: req.currentUser?.Organization,
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

const LowMediumVulnerableItemsOverdue = AsyncHandler(async (req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['Low', 'Medium'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null },
        Organization: req.currentUser?.Organization,
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

const ApplicationvulnerabilityCardData = AsyncHandler(async (req, res) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const data = await DataModel.find({
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    Severity: { $in: ['High', 'Low', 'Medium', 'Critical'] },
    Organization: req.currentUser?.Organization,
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

export { OrgnizationData, CriticalHighVulnerableItems, LowMediumVulnerableItems, CriticalHighVulnerableItemsOverdue, LowMediumVulnerableItemsOverdue, ApplicationvulnerabilityCardData };
