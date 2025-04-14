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
  const data = await OpenAiHistoryModel.find({task:id,sender_id:req.currentUser?._id});
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



export const getExploitability = async (input,val) => {
  const text = `${input} cvss scores in ${val} only number`;
  const response = await GPTResponse(text);
  const scores = response.match(/\d+(\.\d+)?/g); 
  if (scores && scores?.length > 0) {
    return parseFloat(scores[scores.length - 1]);
  }
  return  0;
};










