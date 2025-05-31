import { PasswordHistoryModel } from "../models/Auth.model.js";
import { compare } from 'bcrypt';

export const AlreadyUsePassword = async (id, password) => {
  const data = await PasswordHistoryModel.find({ user_id: id }).sort({ _id: -1 }).limit(10);
  let isPasswordCurrect = false;
  for (const item of data) {
    const match = await compare(password, item.password);
    if (match) {
      isPasswordCurrect = true;
      break;
    }
  }
  return isPasswordCurrect;
};