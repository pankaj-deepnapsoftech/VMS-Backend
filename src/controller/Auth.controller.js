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
import axios from 'axios';
import { JWTSecretencrypt } from '../utils/TokenIncrypt.js';

const RegisterUser = AsyncHandler(async (req, res) => {
  const data = req.body;

  const existUser = await AuthModel.findOne({ email: data.email });

  if (existUser) {
    throw new BadRequestError('User already exist', 'RegisterUser method');
  }

  if (data?.password?.toLowerCase().includes(data?.fname?.toLowerCase() || data?.lname?.toLowerCase())) {
    throw new BadRequestError('Password Do not Contain your name', 'RegisterUser method');
  }

  await AuthModel.create(data);

  SendMail("RegisterEmail.ejs", { fullName: `${data?.fname} ${data?.lname}`, email: data.email, password: data.password, loginLink: config.NODE_ENV !== "development" ? config.CLIENT_URL + "/sign-in" : config.CLIENT_URL_LOCAL + "/sign-in" }, { email: data.email, subject: "Registeration Successful" });

  return res.status(StatusCodes.OK).json({
    message: 'User created Successful',
  });
});

const LoginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const query = req.query;
  let data;

  if (query?.token) {
    const { email } = VerifyToken(query.token);
    if (email) {
      data = { email_verification: true };
    }
  }

  const user = await AuthModel.findOne({ email }).select("-security_questions");

  if (!user) {
    throw new NotFoundError('Invalid email or password', 'LoginUser method');
  }

  if (user.deactivate) {
    throw new NotFoundError('You account suspend by admin', 'LoginUser method');
  }
  const isPasswordCurrect = await compare(password, user.password);
  if (!isPasswordCurrect) {
    throw new BadRequestError('Invalid email or password', 'LoginUser method');
  }
  user.password = null;

  if (query?.token) {
    await AuthModel.findByIdAndUpdate(user._id, data);
  }

  const token = SignToken({ email: user.email, id: user._id });
  const newToken = JWTSecretencrypt({token});

  res.status(StatusCodes.OK).json({
    message: 'Login Successful',
    user,
    token:newToken,
  });

  await AuthModel.findByIdAndUpdate(user._id, { loginedInSession: true });
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
  await AuthModel.findByIdAndUpdate(req?.currentUser._id, { loginedInSession: false });
  return res.status(StatusCodes.OK).json({
    message: 'Logout Successful',
  });
});

const getlogedInUser = AsyncHandler(async (req, res) => {
  const user = await AuthModel.findById(req?.currentUser._id).select(
    '_id fname lname email phone email_verification mustChangePassword deactivate profile security_questions createdAt',
  ).populate([{ path: "tenant" }, { path: "role" }, { path: "partner" }]);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
  }

  const userObj = user.toObject();
  userObj.security_questions = user.security_questions?.length || 0;

  return res.status(StatusCodes.OK).json({
    message: 'User Data',
    data: { ...userObj, tenant: user?.tenant && user?.tenant?._id, role: user?.role && user?.role?.role, allowed_path: user?.role && user?.role?.allowed_path },
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

  const user = await AuthModel.findById(id);
  if (!user) {
    throw new NotFoundError('Something Went Wrong', 'UpdateUserProfile method');
  }
  await AuthModel.findByIdAndUpdate(id, { ...data,email_verification: true });
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

const GetAllUsers = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await AuthModel.find({ _id: { $ne: req?.currentUser?._id },role:{$exists:true} }).select("-password -security_questions -mustChangePassword").populate([{ path: "tenant", select: "company_name" }, { path: "role", select: "role" }, { path: "partner", select: "company_name" }]).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "all users Data",
    data
  });
});

const UpdateUserByAdmin = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await AuthModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data not found", "UpdateUserByAdmin method");
  };
  await AuthModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "User Updated Successful"
  });
});

const getAllUserByTenant = AsyncHandler(async (req, res) => {
  const tenant = req?.currentUser?.tenant || req.query?.tenant;
  const data = await AuthModel.find({ tenant }).select("fname lname email");
  return res.status(StatusCodes.OK).json({
    message: "All User Data",
    data
  });
});

const Verifycaptcha = AsyncHandler(async (req,res) => {
  const {token} = req.body;
  const data = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
    params: {
      secret: config.RECAPTCHA_SECRET,
      response: token,
    },
  });
  return res.status(StatusCodes.OK).json({
    success:data.data.success
  });
});


export const ChangePasswordViaQuestion = AsyncHandler(async (req,res) => {
  const {email} = req.query;
  console.log(email);
});






export {
  RegisterUser,
  LoginUser,
  VerifyOTP,
  VerifyEmail,
  ResetPassword,
  LogoutUser,
  getlogedInUser,
  ChnagePassword,
  ResendOtp,
  DeactivatePath,
  UpdateUserProfile,
  ResetPasswordByQuestions,
  DeleteUser,
  GetAllUsers,
  UpdateUserByAdmin,
  getAllUserByTenant,
  Verifycaptcha
};
