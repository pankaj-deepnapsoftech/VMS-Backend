import { StatusCodes } from 'http-status-codes';
import { NotificationModel } from '../models/Notifictaion.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/customError.js';
import { AuthModel } from '../models/Auth.model.js';

const CreateNotification = AsyncHandler(async (req, res) => {
  const data = req.body;
  await NotificationModel.create(data);
  return res.status(StatusCodes.OK).json({
    Message: 'Notification Send',
  });
});

const GetNotification = AsyncHandler(async (req, res) => {
  const data = await NotificationModel.find({ reciver_id: req.currentUser?._id }).sort({ _id: -1 });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const NotificationViewed = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const find = await NotificationModel.findById(id);
  if (!find) {
    throw new NotFoundError('Data Not Found', 'NotificationViewed method');
  }
  await NotificationModel.findByIdAndUpdate(id, { view: true,options:false,expection_id:null });
  res.status(StatusCodes.OK).json({
    message: 'notification viewed',
  });
});

const orginzationNotification = AsyncHandler(async (req, res) => {
  const { Organization, text } = req.body;

  const data = await AuthModel.findOne({ Organization });
  if (!data) {
    throw new NotFoundError('Organization name not match ', 'orginzationNotification method');
  }

  await NotificationModel.create({ reciver_id: data._id, title: text });
  return res.status(StatusCodes.ACCEPTED).json({
    message: 'Notification Send to Client',
  });
});

export { CreateNotification, GetNotification, NotificationViewed, orginzationNotification };
