import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotFoundError } from '../utils/customError.js';
import { generateOTP } from '../utils/otpGenerater.js';
import { PasswordSignToken, SignToken, VerifyToken } from '../utils/jwtTokens.js';
import { SendMail } from '../utils/SendMain.js';
import { compare } from 'bcrypt';

const RegisterUser = AsyncHandler(async (req, res) => {
  const data = req.body;

  const existUser = await AuthModel.findOne({ email: data.email });
  if (existUser) {
    throw new BadRequestError('User already exist', 'RegisterUser method');
  }

  const { otp, expiresAt } = generateOTP();

  const result = await AuthModel.create({
    ...data,
    otp,
    otp_expire: expiresAt,
  });
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

  if (!user.employee_approve && user.role === 'Employee') {
    throw new BadRequestError('You are not verify By Admin', 'LoginUser method');
  }

  const isPasswordCurrect = await compare(password, user.password);
  if (!isPasswordCurrect) {
    throw new BadRequestError('Wrong Password Try Again...', 'LoginUser method');
  }

  const token = SignToken({ email: user.email, id: user._id });
  user.password = null;
  user.otp = null;

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
    Login_verification: true,
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
  await AuthModel.findOneAndUpdate({ email }, { password });
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
  const data = await AuthModel.findById(req?.currentUser._id).select('_id full_name email phone role Allowed_path email_verification Login_verification');

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
  await AuthModel.findByIdAndUpdate(user._id, { password: newPassword });
  return res.status(StatusCodes.OK).json({
    message: 'New password created Successful',
  });
});

const ResendOtp = AsyncHandler(async (req, res) => {
  const { otp, expiresAt } = generateOTP();

  const result = await AuthModel.findById(req?.currentUser._id);
  if (!result) {
    throw new NotFoundError('user not found', 'ResendOtp method');
  }

  await AuthModel.findByIdAndUpdate(req?.currentUser._id, {
    otp,
    otp_expire: expiresAt,
  });

  await SendMail('EmailVerification.ejs', { userName: result.full_name, otpCode: otp }, { email: result.email, subject: 'Email Verification' });

  return res.status(StatusCodes.OK).json({
    message: 'OTP send again Your E-mail',
  });
});

const GetAllUser = AsyncHandler(async (_req, res) => {
  const users = await AuthModel.find({ role: 'Customer' }).select('full_name email phone role Allowed_path');
  return res.status(StatusCodes.OK).json({
    message: 'all customer',
    users,
  });
});

const GetAllEmployee = AsyncHandler(async (_req, res) => {
  const users = await AuthModel.find({ role: 'Employee' }).select('full_name email phone role Allowed_path employee_approve');
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

export { RegisterUser, LoginUser, VerifyOTP, VerifyEmail, ResetPassword, LogoutUser, getlogedInUser, UpdateUserPath, ChnagePassword, ResendOtp, GetAllUser, employeeVerification, GetAllEmployee };
