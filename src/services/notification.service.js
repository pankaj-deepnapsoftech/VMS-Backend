import { NotificationModel } from "../models/Notifictaion.model.js";


export const CreateNotification = async (data) => {
  const res = await NotificationModel.create(data);
  return res;
};





