import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotAuthenticated } from '../utils/customError.js';
import { VerifyToken } from '../utils/jwtTokens.js';
import { JWTencryptToDecrypt } from '../utils/TokenIncrypt.js';

export const Authentication = AsyncHandler(async (req, _res, next) => {
  let encryptToken = req.headers?.authorization?.split(' ')[1];
  const validate = JWTencryptToDecrypt(encryptToken);

  if (!validate?.token) {
    throw new NotAuthenticated('User not Authenticated', 'Authentication method');
  }

  if (!validate?.frontend) {
    throw new NotAuthenticated('User not Valid', 'Authentication method');
  }

  const data = VerifyToken(validate?.token);
  const user = await AuthModel.findById(data.id);

  if (!user || !user.loginedInSession) {
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
  if (user.role !== 'Admin') {
    throw new NotAuthenticated('you are not Allowed to asscess this routes', 'AdminAuthentication method');
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
  if (user.role !== 'Assessor') {
    throw new NotAuthenticated('you are not Allowed to asscess this routes', 'AdminAuthentication method');
  }

  req.currentUser = user;
  next();
});

export const ClientCISOAuthentication = AsyncHandler(async (req, _res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated('User not Authenticated', 'AdminAuthentication method');
  }

  const data = VerifyToken(token);
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError('Invalid User Please Try Again', 'AdminAuthentication method');
  }
  if (user.role !== 'ClientCISO') {
    throw new NotAuthenticated('you are not Allowed to asscess this routes', 'AdminAuthentication method');
  }

  req.currentUser = user;
  next();
});

export const ClientSMEAuthentication = AsyncHandler(async (req, _res, next) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated('User not Authenticated', 'AdminAuthentication method');
  }

  const data = VerifyToken(token);
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError('Invalid User Please Try Again', 'AdminAuthentication method');
  }
  if (user.role !== 'ClientSME') {
    throw new NotAuthenticated('you are not Allowed to asscess this routes', 'AdminAuthentication method');
  }

  req.currentUser = user;
  next();
});
