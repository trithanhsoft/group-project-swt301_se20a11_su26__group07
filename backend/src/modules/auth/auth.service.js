import bcrypt from 'bcryptjs';
import { query } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { signAccessToken } from '../../utils/jwt.js';

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
  };
}

export async function loginWithUsernamePassword({ username, password }) {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required.');
  }

  const result = await query(
    `select id, username, email, password_hash, full_name, role, status
     from app_users
     where username = $1 and deleted_at is null
     limit 1`,
    [username],
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'This account is inactive.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  await query('update app_users set last_login_at = now() where id = $1', [user.id]);

  const publicUser = toPublicUser(user);
  const token = signAccessToken(publicUser);

  return { user: publicUser, token };
}
