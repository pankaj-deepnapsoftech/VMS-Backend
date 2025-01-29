import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotAuthenticated } from '../utils/customError.js';
import { VerifyToken } from '../utils/jwtTokens.js';

export const Authentication = AsyncHandler(async (req, _res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated('User not Authenticated', 'Authentication method');
  }

  const data = VerifyToken(token);
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError('Invalid User Please Try Again', 'Authentication method');
  }

  req.currentUser = user;
  next();
});

export const AdminAuthentication = AsyncHandler(async (req, _res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated('User not Authenticated', 'AdminAuthentication method');
  }

  const data = VerifyToken(token);
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError('Invalid User Please Try Again', 'AdminAuthentication method');
  }
  if(user.role !== "Admin"){
    throw new NotAuthenticated("you are not Allowed to asscess this routes",'AdminAuthentication method')
  }

  req.currentUser = user;
  next();
});

export const EmployeeAuthentication = AsyncHandler(async (req, _res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated('User not Authenticated', 'AdminAuthentication method');
  }

  const data = VerifyToken(token);
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError('Invalid User Please Try Again', 'AdminAuthentication method');
  }
  if(user.role !== "Employee"){
    throw new NotAuthenticated("you are not Allowed to asscess this routes",'AdminAuthentication method')
  }

  req.currentUser = user;
  next();
});
