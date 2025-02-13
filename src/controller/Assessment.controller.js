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
  const data = await AssessmentModel.find({ creator_id: req.currentUser?._id });
  return res.status(StatusCodes.OK).json({
    message: 'User Assessment',
    data,
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
    message:"Data Update Successful"
  })
});

const tasterList = AsyncHandler(async (_req,res) => {
  const data =await AuthModel.find({role:"Assessor"})
  return res.status(StatusCodes.OK).json({
    data
  })
})

export { createAssessment, getAssessment, deleteAssessment, updateAssessment,tasterList };
