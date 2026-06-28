import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { completeKdsOrder, listKdsOrdersForStaff } from './kds.service.js';

export const getKdsOrders = asyncHandler(async (req, res) => {
  const orders = await listKdsOrdersForStaff(req.user);

  return sendSuccess(res, {
    message: 'KDS orders loaded successfully.',
    data: orders,
  });
});

export const markKdsOrderCompleted = asyncHandler(async (req, res) => {
  const order = await completeKdsOrder(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'KDS order completed successfully.',
    data: {
      order,
    },
  });
});

