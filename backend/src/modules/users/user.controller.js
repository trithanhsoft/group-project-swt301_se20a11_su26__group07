import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createUser, getUserById, listUsers, resetUserPassword, updateUser } from './user.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers(req.query);

  return sendSuccess(res, {
    message: 'Users loaded successfully.',
    data: {
      users,
    },
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);

  return sendSuccess(res, {
    message: 'User loaded successfully.',
    data: {
      user,
    },
  });
});

export const createNewUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);

  return sendSuccess(res, {
    message: 'User created successfully.',
    statusCode: 201,
    data: {
      user,
    },
  });
});

export const updateExistingUser = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body, req.user);

  return sendSuccess(res, {
    message: 'User updated successfully.',
    data: {
      user,
    },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await resetUserPassword(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Password has been reset successfully.',
    data: {
      user,
    },
  });
});
