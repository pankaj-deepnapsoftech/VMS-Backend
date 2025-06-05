import { StatusCodes } from 'http-status-codes';
import { AuthModel, PasswordHistoryModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotFoundError } from '../utils/customError.js';
import { generateOTP } from '../utils/otpGenerater.js';
import { PasswordSignToken, SignToken, VerifyToken } from '../utils/jwtTokens.js';
import { SendMail } from '../utils/SendMain.js';
import { compare } from 'bcrypt';
import { config } from '../config/env.config.js';
import { AlreadyUsePassword } from '../helper/AlreadyUsedPassword.js';

const RegisterUser = AsyncHandler(async (req, res) => {
  const data = req.body;

  const existUser = await AuthModel.findOne({ email: data.email });

  if (existUser) {
    throw new BadRequestError('User already exist', 'RegisterUser method');
  }

  if (data.password.toLowerCase().includes(data.full_name.toLowerCase())) {
    throw new BadRequestError('Password Do not Contain your name', 'RegisterUser method');
  }

  const { otp, expiresAt } = generateOTP();

  const result = await AuthModel.create({
    ...data,
    otp,
    otp_expire: expiresAt,
    Organization: data?.Organization || '',
  });

  await PasswordHistoryModel.create({ user_id: result._id, password: result.password });

  result.password = null;
  result.otp = null;
  const token = SignToken({ email: result.email, id: result._id });
  SendMail('EmailVerification.ejs', { userName: result.full_name, otpCode: otp }, { email: result.email, subject: 'Email Verification' });
  return res.status(StatusCodes.OK).json({
    message: 'User created Successful',
    result,
    token,
  });
});

const LoginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await AuthModel.findOne({ email });
  if (!user) {
    throw new NotFoundError('User not exist', 'LoginUser method');
  }

  if (!user.employee_approve && user.role === 'Assessor') {
    throw new BadRequestError('You are not verify By Admin', 'LoginUser method');
  }

  if (user.deactivate) {
    throw new NotFoundError('You account suspend by admin', 'LoginUser method');
  }

  const isPasswordCurrect = await compare(password, user.password);
  if (!isPasswordCurrect) {
    throw new BadRequestError('Wrong Password Try Again...', 'LoginUser method');
  }

  // if (!user.email_verification) {
  //   throw new NotFoundError('User email not Verifyed', 'LoginUser method');
  // }

  const token = SignToken({ email: user.email, id: user._id });
  user.password = null;
  user.otp = null;

  res.cookie('tok', 'token', {
    httpOnly: true,
    secure: config.NODE_ENV !== 'developement',
    sameSite: 'None',
    maxAge: 1000000,
  });

  return res.status(StatusCodes.OK).json({
    message: 'Login Successful',
    user,
    token,
  });
});

const VerifyOTP = AsyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    throw new BadRequestError('OTP Is Required', 'VerifyOTP method');
  }
  const date = Date.now();
  if (date > req?.currentUser.otp_expire) {
    throw new BadRequestError('OTP is expire', 'VerifyOTP method');
  }
  if (otp !== req?.currentUser.otp) {
    throw new BadRequestError('Wrong OTP', 'VerifyOTP method');
  }
  await AuthModel.findByIdAndUpdate(req?.currentUser._id, {
    email_verification: true,
  });
  return res.status(StatusCodes.OK).json({
    message: 'OTP Verified Successful',
  });
});

const VerifyEmail = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await AuthModel.findOne({ email });
  if (!user) {
    throw new NotFoundError('User not exist', 'VerifyEmail method');
  }
  const token = PasswordSignToken({ email });

  const resetLink = `http://localhost:5173/reset-password?token=${token}&verification=true&testing=true`;
  await SendMail('ResetPassword.ejs', { resetLink, userEmail: email }, { email: email, subject: 'Reset Password Link' });
  return res.status(StatusCodes.OK).json({
    message: 'Password reset link send Successful',
  });
});

const ResetPassword = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new NotFoundError('Token Is Required', 'ResetPassword method');
  }

  const { password } = req.body;
  const { email } = VerifyToken(token);
  const user = await AuthModel.findOne({ email });

  const alreadyUsed = await AlreadyUsePassword(user._id, password);
  if (alreadyUsed) {
    throw new BadRequestError('This password is Already Used', 'ChnagePassword method');
  }
  const result = await AuthModel.findOneAndUpdate({ email }, { password }, { new: true });
  await PasswordHistoryModel.create({ user_id: result._id, password: result.password });
  return res.status(StatusCodes.OK).json({
    message: 'Password reset successful',
  });
});

const LogoutUser = AsyncHandler(async (req, res) => {
  await AuthModel.findByIdAndUpdate(req?.currentUser._id, {
    Login_verification: false,
    otp: null,
    otp_expire: null,
  });
  return res.status(StatusCodes.OK).json({
    message: 'Logout Successful',
  });
});

const getlogedInUser = AsyncHandler(async (req, res) => {
  const data = await AuthModel.findById(req?.currentUser._id).select(
    '_id full_name email phone role Allowed_path email_verification Login_verification employee_approve owner allowed_paths mustChangePassword',
  );

  return res.status(StatusCodes.OK).json({
    message: 'user Data',
    data,
  });
});

const UpdateUserPath = AsyncHandler(async (req, res) => {
  const data = req.body;
  await AuthModel.findByIdAndUpdate(req?.currentUser._id, {
    Allowed_path: data,
  });
  return res.status(StatusCodes.OK).json({
    message: 'Paths added Successful',
  });
});

const ChnagePassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await AuthModel.findById(req?.currentUser._id);

  const isPasswordCurrect = await compare(oldPassword, user.password);
  if (!isPasswordCurrect) {
    throw new BadRequestError('Wrong Password Try Again...', 'ChnagePassword method');
  }

  const alreadyUsed = await AlreadyUsePassword(req?.currentUser._id, newPassword);
  if (alreadyUsed) {
    throw new BadRequestError('This password is Already Used', 'ChnagePassword method');
  }
  const result = await AuthModel.findByIdAndUpdate(user._id, { password: newPassword, mustChangePassword: true }, { new: true });
  await PasswordHistoryModel.create({ user_id: result._id, password: result.password });
  return res.status(StatusCodes.OK).json({
    message: 'New password created Successful',
  });
});

const ResendOtp = AsyncHandler(async (req, res) => {
  const { otp, expiresAt } = generateOTP();

  const email = req.body.email;

  const result = await AuthModel.findById(req?.currentUser._id);
  if (!result) {
    throw new NotFoundError('user not found', 'ResendOtp method');
  }

  await AuthModel.findByIdAndUpdate(req?.currentUser._id, {
    otp,
    otp_expire: expiresAt,
    email_verification: false,
  });

  await SendMail('EmailVerification.ejs', { userName: result.full_name, otpCode: otp }, { email: email, subject: 'Email Verification' });

  return res.status(StatusCodes.OK).json({
    message: 'OTP send in Your E-mail',
  });
});

const GetAllEmployee = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  // const users = await AuthModel.find({ role: 'Assessor' }).select('full_name email phone role Allowed_path employee_approve deactivate').sort({ _id: -1 }).skip(skip).limit(limits);
  const users = await AuthModel.find({ role: { $ne: 'Admin' } })
    .select('full_name email phone role Allowed_path employee_approve deactivate')
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);
  return res.status(StatusCodes.OK).json({
    message: 'all customer',
    users,
  });
});

const employeeVerification = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await AuthModel.findById(id);
  if (!user) {
    throw new BadRequestError('User not found', 'employeeVerification method');
  }
  await AuthModel.findByIdAndUpdate(id, { employee_approve: true });
  return res.status(StatusCodes.OK).json({
    message: 'Employee Approve Successful',
  });
});

const GetAllCISO = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const find = await AuthModel.find({ role: 'ClientCISO' }).select('full_name email phone role Allowed_path employee_approve Organization').sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    data: find,
  });
});

const getAllSME = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  let owner;
  if (req.currentUser?.role === 'ClientCISO') {
    owner = req.currentUser?._id;
  }

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const find = await AuthModel.find(owner ? { owner } : { role: 'ClientSME' })
    .select('full_name email phone role Allowed_path employee_approve owner')
    .populate({ path: 'owner', select: 'Organization' })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);
  return res.status(StatusCodes.OK).json({
    data: find,
  });
});

const GetOrganizationData = AsyncHandler(async (_req, res) => {
  const find = await AuthModel.find({ role: 'ClientCISO' }).select('Organization');
  return res.status(StatusCodes.OK).json({
    data: find,
  });
});

const AddPathsAccess = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const user = await AuthModel.findById(id);
  if (!user) {
    throw new NotFoundError('user not found', 'AddPathsAccess method');
  }
  await AuthModel.updateMany({ $or: [{ _id: id }, { owner: id }] }, { allowed_paths: data });
  return res.status(StatusCodes.CREATED).json({
    message: 'path allowed',
  });
});

const getPathAccessById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await AuthModel.findById(id);
  if (!user) {
    throw new NotFoundError('User not Exist', 'getPathAccessById method');
  }

  return res.status(StatusCodes.OK).json({
    data: user.allowed_paths,
  });
});

const DeactivatePath = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deactivate } = req.body;
  const find = await AuthModel.findById(id);
  if (!find) {
    throw new NotFoundError('User not found', 'DeactivatePath method');
  }

  await AuthModel.findByIdAndUpdate(id, { deactivate });

  return res.status(StatusCodes.ACCEPTED).json({
    message: 'User Status Change',
  });
});

const UpdateUserProfile = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  const date = Date.now();
  if (date > req?.currentUser.otp_expire) {
    throw new BadRequestError('OTP is expire', 'VerifyOTP method');
  }

  if (data.otp !== req?.currentUser.otp) {
    throw new BadRequestError('Wrong OTP', 'UpdateUserProfile method');
  }

  const user = await AuthModel.findById(id);
  if (!user) {
    throw new NotFoundError('Something Went Wrong', 'UpdateUserProfile method');
  }
  await AuthModel.findByIdAndUpdate(id, { ...data, otp: null, otp_expire: null, email_verification: true });
  return res.status(StatusCodes.ACCEPTED).json({
    message: 'User Profile Update',
  });
});

const ResetPasswordByQuestions = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { email } = req.params;
  const user = await AuthModel.findOne({ email });

  if (!user) {
    throw new NotFoundError('User Not Found', 'ResetPasswordByQuestions method');
  }
  const filter = user.security_questions.find((item) => item.question.includes(data.question) && item.answer === data.answer);

  if (!filter) {
    throw new NotFoundError('Wrong Answer', 'ResetPasswordByQuestions method');
  }

  const token = PasswordSignToken({ email });

  const resetLink = `${config.NODE_ENV !== 'development' ? config.CLIENT_URL : config.CLIENT_URL_LOCAL}/reset-password?token=${token}&verification=true&testing=true`;

  return res.status(StatusCodes.OK).json({
    resetLink,
  });
});

const DeleteUser = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await AuthModel.findById(id);
  if (!user) {
    throw new BadRequestError('User is alrady deleted', 'DeleteUser method');
  }
  await AuthModel.findByIdAndDelete(id);
  await PasswordHistoryModel.deleteMany({ user_id: id });
  return res.status(StatusCodes.OK).json({
    message: 'User Deleted Successful',
  });
});

const NewUser = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limit;
  const users = await AuthModel.find({ role: '' }).select('full_name email phone ').sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: 'data',
    data: users,
  });
});

export {
  RegisterUser,
  LoginUser,
  VerifyOTP,
  VerifyEmail,
  ResetPassword,
  LogoutUser,
  getlogedInUser,
  UpdateUserPath,
  ChnagePassword,
  ResendOtp,
  employeeVerification,
  GetAllEmployee,
  GetAllCISO,
  getAllSME,
  GetOrganizationData,
  AddPathsAccess,
  getPathAccessById,
  DeactivatePath,
  UpdateUserProfile,
  ResetPasswordByQuestions,
  DeleteUser,
  NewUser,
};
