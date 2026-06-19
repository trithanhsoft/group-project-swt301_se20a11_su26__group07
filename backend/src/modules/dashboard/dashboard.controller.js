import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getSummary } from './dashboard.service.js';

export const summary = asyncHandler(async (req, res) => {
  const data = await getSummary();

  return sendSuccess(res, {
    message: 'Dashboard summary loaded.',
    data,
  });
});
