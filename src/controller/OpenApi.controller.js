import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { GPTResponse } from "../utils/ChatGpt.js";
import { NotFoundError } from "../utils/customError.js";
import { OpenAiHistoryModel } from "../models/OpenAi.model.js";

export const ProblemSolution = AsyncHandler(async (req, res) => {
  const { text, task } = req.body;
  if (!text.trim()) {
    throw new NotFoundError("text is required field", "ProblemSolution method");
  }
  const response = await GPTResponse(text);
  const result = await OpenAiHistoryModel.create({ text, sender_id: req.currentUser?._id, gpt_res: response, task });
  return res.status(StatusCodes.OK).json({
    result
  });
});


export const GetGptHistory = AsyncHandler(async (req,res) => {
  const {id} = req.params;
  const data = await OpenAiHistoryModel.find({$or:[{task:id},{sender_id:req.currentUser?._id}]});
  return res.status(StatusCodes.OK).json({
    data
  });
});


export const AdminGptGetHistroy = AsyncHandler(async (req,res) => {
  const {id} = req.params;
  const data = await OpenAiHistoryModel.find({task:id});
  return res.status(StatusCodes.OK).json({
    data
  });
});








