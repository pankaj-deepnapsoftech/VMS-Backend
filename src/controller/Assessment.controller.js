import { StatusCodes } from 'http-status-codes';
import { AssessmentModel } from '../models/Assessment.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/customError.js';
import { AuthModel } from '../models/Auth.model.js';

const createAssessment = AsyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  let filePath = '';
  if (file) {
    filePath = `http://localhost:4000/file/${file.filename}`;
  }

  const result = await AssessmentModel.create({ ...data, creator_id: req.currentUser?._id, code_Upload: filePath });
  return res.status(StatusCodes.OK).json({
    message: 'Assessment Scheduled Successful',
    data: result,
  });
});

const getAssessment = AsyncHandler(async (req, res) => {
  const { page, limit,tenant } = req.query;

  

  // Parse pagination values
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const Tenant_id = tenant || req.currentUser?.tenant;
 
  const data = await AssessmentModel.find(Tenant_id ? {Tenant_id,status:'Pending'} : {}).populate([
    { path: 'Tenant_id', select: 'company_name' }, 
    { path: 'Select_Tester', select: 'full_name' },
    { path: 'creator_id', select: 'fname lname' },
  ])
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);

  

  // Return the result
  return res.status(StatusCodes.OK).json({
    message: 'User Assessment',
    data: data,
  });
});

const getCompleted = AsyncHandler(async (req, res) => {
  const { page, limit,tenant } = req.query;

  

  // Parse pagination values
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const Tenant_id = tenant || req.currentUser?.tenant;
 
  const data = await AssessmentModel.find(Tenant_id ? {Tenant_id,status:'Completed'} : {}).populate([
    { path: 'Tenant_id', select: 'company_name' }, 
    { path: 'Select_Tester', select: 'full_name' },
    { path: 'creator_id', select: 'fname lname' },
  ])
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);

  
  // Return the result
  return res.status(StatusCodes.OK).json({
    message: 'User Assessment',
    data: data,
  });
});

const getInProgress = AsyncHandler(async (req, res) => {
  const { page, limit,tenant } = req.query;

  

  // Parse pagination values
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const Tenant_id = tenant || req.currentUser?.tenant;
 
  const data = await AssessmentModel.find(Tenant_id ? {Tenant_id,status:'In-Progress'} : {}).populate([
    { path: 'Tenant_id', select: 'company_name' }, 
    { path: 'Select_Tester', select: 'full_name' },
    { path: 'creator_id', select: 'fname lname' },
  ])
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);



  // Return the result
  return res.status(StatusCodes.OK).json({
    message: 'User Assessment',
    data: data,
  });
});

const deleteAssessment = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const find = await AssessmentModel.findById(id);

  if (!find) {
    throw new NotFoundError('Wrong Id', 'deleteAssessment Method');
  }
  await AssessmentModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: 'Data Deleted Successfully',
  });
});

const updateAssessment = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;
  let filepath = '';
  if (file) {
    filepath = `http://localhost:4000/file/${file.filename}`;
  }

  const find = await AssessmentModel.findById(id);
  if (!find) {
    throw new NotFoundError('data not found', 'updateAssessment method');
  }
  await AssessmentModel.findByIdAndUpdate(id, { ...data, code_Upload: filepath });
  return res.status(StatusCodes.OK).json({
    message: 'Data Update Successful',
  });
});

const tasterList = AsyncHandler(async (_req, res) => {
  const data = await AuthModel.find({ role: 'Assessor' });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const DashboardData = AsyncHandler(async (req, res) => {
  const filterData = [
    'Secure Code Scan',
    'Dynamic Application',
    'Web Application Penetration Testing',
    'Api Penetration Testing',
    'Infrastructure Vulnerability Scan',
    'Infrastructure Penetration Testing',
  ];
  const data = await AssessmentModel.find({ creator_id: req.currentUser?._id });
  let SecureCode = 0;
  let DynamicApplication = 0;
  let WebApplication = 0;
  let ApiPenetration = 0;
  let InfrastructureVulnerability = 0;
  let InfrastructurePenetration = 0;

  data.map((item) => {
    if (item.Type_Of_Assesment === filterData[0]) {
      SecureCode += 1;
    }

    if (item.Type_Of_Assesment === filterData[1]) {
      DynamicApplication += 1;
    }

    if (item.Type_Of_Assesment === filterData[2]) {
      WebApplication += 1;
    }

    if (item.Type_Of_Assesment === filterData[3]) {
      ApiPenetration += 1;
    }

    if (item.Type_Of_Assesment === filterData[4]) {
      InfrastructureVulnerability += 1;
    }

    if (item.Type_Of_Assesment === filterData[5]) {
      InfrastructurePenetration += 1;
    }
  });

  return res.status(StatusCodes.OK).json({
    SecureCode,
    DynamicApplication,
    WebApplication,
    ApiPenetration,
    InfrastructureVulnerability,
    InfrastructurePenetration,
  });
});

const AdminGetAssessment = AsyncHandler(async (_req,res) => {
  const data = await AssessmentModel.find({});
  return res.status(StatusCodes.OK).json({
    data
  });
});



export { 
  createAssessment,
  getAssessment,
  deleteAssessment,
  updateAssessment,
  tasterList,
  DashboardData,
  AdminGetAssessment,
  getCompleted,
  getInProgress
};
