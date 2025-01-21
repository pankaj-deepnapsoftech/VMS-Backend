import { AuthModel } from '../models/Auth.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { BadRequestError, NotAuthenticated } from '../utils/customError.js';
import { VerifyToken } from '../utils/jwtTokens.js';

export const Authentication = AsyncHandler(async (req, res, next) => {
  const token = req.headers?.authorization.split(' ')[1];
  if (!token) {
    throw new NotAuthenticated(
      'User not Authenticated',
      'Authentication method',
    );
  }

  const data = VerifyToken(token);
  if (!data) {
    throw new BadRequestError(
      'Invalid User Please Try Again',
      'Authentication method',
    );
  }
  const user = await AuthModel.findById(data.id);
  if (!user) {
    throw new BadRequestError(
      'Invalid User Please Try Again',
      'Authentication method',
    );
  }

  req.currentUser = user;
  next();
});
