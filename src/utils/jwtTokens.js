import jwt  from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const SignToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1d' });
};

export const VerifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
