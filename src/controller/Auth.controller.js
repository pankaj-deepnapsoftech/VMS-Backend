import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError } from '../utils/customError.js';
import { generateOTP } from '../utils/otpGenerater.js';

// {
//   userName: 'nitin',
//   otpCode: '1234',
//   companyName: 'test',
//   otpValidity: '10',
// }

const RegisterUser = AsyncHandler(async (req, res) => {
  const data = req.body;

  const existUser = await AuthModel.findOne({ email: data.email });
  if (existUser) {
    throw new BadRequestError('User already exist', 'RegisterUser method');
  }

  const {otp,expiresAt} = generateOTP()

  const result = await AuthModel.create({...data,otp,email_expire:expiresAt,login_expire:expiresAt});
  result.password = null;
  return res.status(StatusCodes.OK).json({
    message: 'User created Successful',
    result
  });
});

export { RegisterUser };
