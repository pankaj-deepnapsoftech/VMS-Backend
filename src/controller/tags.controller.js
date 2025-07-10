import { TagModel } from "../models/Tags.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


export const CraeteTags = AsyncHandler(async (req,res) => {
  const data = req.body;
  await TagModel.create(data);
  return res.status(201).json({
    message: "Tag created successfully",
  });
});