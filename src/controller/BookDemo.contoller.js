import { StatusCodes } from "http-status-codes";
import { BookDemoModal } from "../models/BookDemo.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

export const AddBookDemo = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await BookDemoModal.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Information Submited, My team get back to you",
    data:result
  });
});