import { query } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Unauthorized. Please login first.');
    }

    const payload = verifyAccessToken(token);
    const result = await query(
      `select id, username, email, full_name, role, status, last_login_at, created_at, updated_at
       from app_users
       where id = $1 and deleted_at is null
       limit 1`,
      [payload.userId],
    );

    const user = result.rows[0];

    if (!user || user.status !== 'ACTIVE') {
      throw new ApiError(401, 'User session is invalid or inactive.');
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Unauthorized. Please login again.'));
  }
}
