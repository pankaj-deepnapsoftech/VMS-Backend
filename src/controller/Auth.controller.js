import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError } from '../utils/customError.js';
import { generateOTP } from '../utils/otpGenerater.js';
import { SignToken } from '../utils/jwtTokens.js';
import { SendMail } from '../utils/SendMain.js';

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
    email_expire: expiresAt,
    login_expire: expiresAt,
  });
  result.password = null;
  const token = SignToken({ email: result.email, id: result._id });
  SendMail(
    'EmailVerification.ejs',
    { userName: result.full_name, otpCode: otp },
    { email: result.email, subject: 'Email Verification' },
  );
  return res.status(StatusCodes.OK).json({
    message: 'User created Successful',
    result,
    token,
  });
});

const LoginUser = AsyncHandler(async (req,res) => {
  const data = req.body;
})

export { RegisterUser,LoginUser };
