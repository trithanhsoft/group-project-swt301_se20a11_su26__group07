import bcrypt from 'bcryptjs';
import { query } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { signAccessToken } from '../../utils/jwt.js';
import { toPublicUser } from '../../utils/user.js';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validatePasswordValue(password) {
  if (!password) {
    throw new ApiError(400, 'Password is required.');
  }

  if (password.length < 6 || password.length > 63) {
    throw new ApiError(400, 'Password must be between 6 and 63 characters.');
  }
}

async function getUserAuthRowById(userId) {
  const result = await query(
    `select id, username, email, full_name, password_hash, role, status, last_login_at, created_at, updated_at
     from app_users
     where id = $1 and deleted_at is null
     limit 1`,
    [userId],
  );

  return result.rows[0] || null;
}

export async function loginWithUsernamePassword({ username, password }) {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required.');
  }

  const normalizedUsername = normalizeString(username);

  const result = await query(
    `select id, username, email, password_hash, full_name, role, status, last_login_at, created_at, updated_at
     from app_users
     where lower(username) = lower($1) and deleted_at is null
     limit 1`,
    [normalizedUsername],
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

  const updateResult = await query(
    `update app_users
     set last_login_at = now(), updated_at = now()
     where id = $1
     returning last_login_at, updated_at`,
    [user.id],
  );

  const publicUser = toPublicUser({
    ...user,
    last_login_at: updateResult.rows[0]?.last_login_at || user.last_login_at,
    updated_at: updateResult.rows[0]?.updated_at || user.updated_at,
  });
  const token = signAccessToken(publicUser);

  return { user: publicUser, token };
}

export async function updateCurrentUserProfile(userId, { fullName, email }) {
  const normalizedFullName = normalizeString(fullName);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedFullName) {
    throw new ApiError(400, 'Full name is required.');
  }

  if (normalizedFullName.length > 120) {
    throw new ApiError(400, 'Full name must not exceed 120 characters.');
  }

  if (!normalizedEmail) {
    throw new ApiError(400, 'Email is required.');
  }

  if (normalizedEmail.length > 120) {
    throw new ApiError(400, 'Email must not exceed 120 characters.');
  }

  if (!validateEmail(normalizedEmail)) {
    throw new ApiError(400, 'Email format is invalid.');
  }

  const duplicateEmailResult = await query(
    `select id
     from app_users
     where lower(email) = lower($1)
       and id <> $2
       and deleted_at is null
     limit 1`,
    [normalizedEmail, userId],
  );

  if (duplicateEmailResult.rows[0]) {
    throw new ApiError(409, 'Email already exists.');
  }

  const result = await query(
    `update app_users
     set full_name = $1,
         email = $2,
         updated_at = now()
     where id = $3 and deleted_at is null
     returning id, username, email, full_name, role, status, last_login_at, created_at, updated_at`,
    [normalizedFullName, normalizedEmail, userId],
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return toPublicUser(user);
}

export async function changeCurrentUserPassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword) {
    throw new ApiError(400, 'Current password is required.');
  }

  validatePasswordValue(newPassword);

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from the current password.');
  }

  const user = await getUserAuthRowById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'This account is inactive.');
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await query(
    `update app_users
     set password_hash = $1,
         updated_at = now()
     where id = $2`,
    [newPasswordHash, userId],
  );

  return { success: true };
}
