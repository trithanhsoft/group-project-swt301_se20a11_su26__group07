import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { changeCurrentUserPassword, loginWithUsernamePassword, updateCurrentUserProfile } from './auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const data = await loginWithUsernamePassword(req.body);

  return sendSuccess(res, {
    message: 'Login successfully.',
    data,
  });
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'Current user loaded.',
    data: {
      user: req.user,
    },
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateCurrentUserProfile(req.user.id, req.body);

  return sendSuccess(res, {
    message: 'Profile updated successfully.',
    data: {
      user,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await changeCurrentUserPassword(req.user.id, req.body);

  return sendSuccess(res, {
    message: 'Password changed successfully.',
  });
});
