import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { loginWithUsernamePassword } from './auth.service.js';

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
