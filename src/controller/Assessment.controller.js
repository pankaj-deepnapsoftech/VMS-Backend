import { StatusCodes } from 'http-status-codes';
import { AssessmentModel } from '../models/Assessment.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

const createAssessment = AsyncHandler(async (req, res) => {
  const data = req.body;
  const file = req.file;

  let filePath = "";
  if (file) {
    filePath = `http://localhost:4000/images/${file.filename}`;
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

export { createAssessment, getAssessment };
