import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
