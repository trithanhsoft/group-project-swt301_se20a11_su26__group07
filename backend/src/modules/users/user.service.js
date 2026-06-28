import bcrypt from 'bcryptjs';
import { query } from '../../config/db.js';
import { ROLES } from '../../constants/roles.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPublicUser } from '../../utils/user.js';

const USER_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
});

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeRole(value) {
  return normalizeString(value).toUpperCase();
}

function normalizeStatus(value) {
  return normalizeString(value).toUpperCase();
}

function ensureValidRole(role) {
  if (![ROLES.ADMIN, ROLES.STAFF].includes(role)) {
    throw new ApiError(400, 'Role is invalid.');
  }
}

function ensureValidStatus(status) {
  if (![USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE].includes(status)) {
    throw new ApiError(400, 'Status is invalid.');
  }
}

function ensureValidUsername(username) {
  if (!username) {
    throw new ApiError(400, 'Username is required.');
  }

  if (username.length < 3 || username.length > 63) {
    throw new ApiError(400, 'Username must be between 3 and 63 characters.');
  }

  if (!USERNAME_PATTERN.test(username)) {
    throw new ApiError(400, 'Username format is invalid.');
  }
}

function ensureValidFullName(fullName) {
  if (!fullName) {
    throw new ApiError(400, 'Full name is required.');
  }

  if (fullName.length > 120) {
    throw new ApiError(400, 'Full name must not exceed 120 characters.');
  }
}

function ensureValidEmail(email) {
  if (!email) {
    throw new ApiError(400, 'Email is required.');
  }

  if (email.length > 120) {
    throw new ApiError(400, 'Email must not exceed 120 characters.');
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Email format is invalid.');
  }
}

function ensureValidPassword(password) {
  if (!password) {
    throw new ApiError(400, 'Password is required.');
  }

  if (password.length < 6 || password.length > 63) {
    throw new ApiError(400, 'Password must be between 6 and 63 characters.');
  }
}

async function findUserRowById(userId) {
  const result = await query(
    `select id, username, email, full_name, role, status, last_login_at, created_at, updated_at
     from app_users
     where id = $1 and deleted_at is null
     limit 1`,
    [userId],
  );

  return result.rows[0] || null;
}

async function findUserAuthRowById(userId) {
  const result = await query(
    `select id, username, email, full_name, password_hash, role, status, last_login_at, created_at, updated_at
     from app_users
     where id = $1 and deleted_at is null
     limit 1`,
    [userId],
  );

  return result.rows[0] || null;
}

async function ensureUniqueUsername(username, excludeUserId = null) {
  const params = [username];
  const conditions = ['lower(username) = lower($1)', 'deleted_at is null'];

  if (excludeUserId) {
    params.push(excludeUserId);
    conditions.push(`id <> $${params.length}`);
  }

  const result = await query(
    `select id
     from app_users
     where ${conditions.join(' and ')}
     limit 1`,
    params,
  );

  if (result.rows[0]) {
    throw new ApiError(409, 'Username already exists.');
  }
}

async function ensureUniqueEmail(email, excludeUserId = null) {
  const params = [email];
  const conditions = ['lower(email) = lower($1)', 'deleted_at is null'];

  if (excludeUserId) {
    params.push(excludeUserId);
    conditions.push(`id <> $${params.length}`);
  }

  const result = await query(
    `select id
     from app_users
     where ${conditions.join(' and ')}
     limit 1`,
    params,
  );

  if (result.rows[0]) {
    throw new ApiError(409, 'Email already exists.');
  }
}

async function countActiveAdmins() {
  const result = await query(
    `select count(*)::int as count
     from app_users
     where role = $1
       and status = $2
       and deleted_at is null`,
    [ROLES.ADMIN, USER_STATUSES.ACTIVE],
  );

  return Number(result.rows[0]?.count || 0);
}

async function ensureAdminRemovalAllowed(existingUser, nextRole, nextStatus) {
  const isRemovingActiveAdmin =
    existingUser.role === ROLES.ADMIN &&
    existingUser.status === USER_STATUSES.ACTIVE &&
    (nextRole !== ROLES.ADMIN || nextStatus !== USER_STATUSES.ACTIVE);

  if (!isRemovingActiveAdmin) {
    return;
  }

  const activeAdminCount = await countActiveAdmins();

  if (activeAdminCount <= 1) {
    throw new ApiError(400, 'You cannot remove the last active admin.');
  }
}

export async function listUsers({ search = '', role, status }) {
  const params = [];
  const conditions = ['deleted_at is null'];

  const normalizedSearch = normalizeString(search);
  const normalizedRole = normalizeRole(role);
  const normalizedStatus = normalizeStatus(status);

  if (normalizedSearch) {
    params.push(`%${normalizedSearch}%`);
    conditions.push(
      `(username ilike $${params.length} or full_name ilike $${params.length} or email ilike $${params.length})`,
    );
  }

  if (normalizedRole && normalizedRole !== 'ALL') {
    ensureValidRole(normalizedRole);
    params.push(normalizedRole);
    conditions.push(`role = $${params.length}`);
  }

  if (normalizedStatus && normalizedStatus !== 'ALL') {
    ensureValidStatus(normalizedStatus);
    params.push(normalizedStatus);
    conditions.push(`status = $${params.length}`);
  }

  const result = await query(
    `select id, username, email, full_name, role, status, last_login_at, created_at, updated_at
     from app_users
     where ${conditions.join(' and ')}
     order by created_at desc, username asc`,
    params,
  );

  return result.rows.map(toPublicUser);
}

export async function getUserById(userId) {
  const user = await findUserRowById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return toPublicUser(user);
}

export async function createUser(payload) {
  const username = normalizeString(payload.username);
  const email = normalizeEmail(payload.email);
  const fullName = normalizeString(payload.fullName);
  const password = payload.password;
  const role = normalizeRole(payload.role);
  const status = normalizeStatus(payload.status || USER_STATUSES.ACTIVE);

  ensureValidUsername(username);
  ensureValidEmail(email);
  ensureValidFullName(fullName);
  ensureValidPassword(password);
  ensureValidRole(role);
  ensureValidStatus(status);

  await ensureUniqueUsername(username);
  await ensureUniqueEmail(email);

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `insert into app_users (username, email, password_hash, full_name, role, status)
     values ($1, $2, $3, $4, $5, $6)
     returning id, username, email, full_name, role, status, last_login_at, created_at, updated_at`,
    [username, email, passwordHash, fullName, role, status],
  );

  return toPublicUser(result.rows[0]);
}

export async function updateUser(userId, payload, actorUser) {
  const existingUser = await findUserAuthRowById(userId);

  if (!existingUser) {
    throw new ApiError(404, 'User not found.');
  }

  const nextFullName =
    payload.fullName === undefined ? existingUser.full_name : normalizeString(payload.fullName);
  const nextEmail =
    payload.email === undefined ? existingUser.email : normalizeEmail(payload.email);
  const nextRole =
    payload.role === undefined ? existingUser.role : normalizeRole(payload.role);
  const nextStatus =
    payload.status === undefined ? existingUser.status : normalizeStatus(payload.status);

  ensureValidFullName(nextFullName);
  ensureValidEmail(nextEmail);
  ensureValidRole(nextRole);
  ensureValidStatus(nextStatus);

  await ensureUniqueUsername(existingUser.username, existingUser.id);
  await ensureUniqueEmail(nextEmail, existingUser.id);

  if (String(actorUser.id) === String(existingUser.id) && nextStatus === USER_STATUSES.INACTIVE) {
    throw new ApiError(400, 'You cannot deactivate your own account.');
  }

  if (
    String(actorUser.id) === String(existingUser.id) &&
    existingUser.role === ROLES.ADMIN &&
    nextRole !== ROLES.ADMIN
  ) {
    throw new ApiError(400, 'You cannot change your own admin role.');
  }

  await ensureAdminRemovalAllowed(existingUser, nextRole, nextStatus);

  const result = await query(
    `update app_users
     set full_name = $1,
         email = $2,
         role = $3,
         status = $4,
         updated_at = now()
     where id = $5 and deleted_at is null
     returning id, username, email, full_name, role, status, last_login_at, created_at, updated_at`,
    [nextFullName, nextEmail, nextRole, nextStatus, userId],
  );

  return toPublicUser(result.rows[0]);
}

export async function resetUserPassword(userId, payload) {
  const existingUser = await findUserRowById(userId);

  if (!existingUser) {
    throw new ApiError(404, 'User not found.');
  }

  const newPassword = payload.newPassword;
  ensureValidPassword(newPassword);

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await query(
    `update app_users
     set password_hash = $1,
         updated_at = now()
     where id = $2 and deleted_at is null`,
    [newPasswordHash, userId],
  );

  return toPublicUser(existingUser);
}
