import { TagModel } from "../models/Tags.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";


export const CraeteTags = AsyncHandler(async (req,res) => {
  const data = req.body;
  await TagModel.create(data);
  return res.status(201).json({
    message: "Tag created successfully",
  });
});


export const GetAllTags = AsyncHandler(async (req,res) => {
  const {page,limit} = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;
  const tags = await TagModel.find({}).sort({createdAt: -1}).skip(skip).limit(limitNumber);
  return res.status(200).json({
    message: "Tags fetched successfully",
    data: tags,
  });
});

export const deleteTag = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const tag = await TagModel.findByIdAndDelete(id);
  if (!tag) {
    throw new NotFoundError("Tag is Already Deleted");
  }
  return res.status(200).json({
    message: "Tag deleted successfully",
  });
});


export const UpdateTag = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const tag = await TagModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }
  return res.status(200).json({
    message: "Tag updated successfully",
    data: tag,
  });
});


export const AllTag = AsyncHandler(async (req, res) => {
  const tags = await TagModel.find({}).select("tag_color tag_name related");
  return res.status(200).json({
    message: "Tags fetched successfully",
    data: tags,
  });
});








