import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const SignToken = (payload,expire = "1d") => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: expire });
};

export const VerifyToken = (token) => {
  const data = jwt.verify(token, config.JWT_SECRET);
  return data || null;
};

export const PasswordSignToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '10min' });
};
