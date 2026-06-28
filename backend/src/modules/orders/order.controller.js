import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createOrder,
  getOrderByIdForStaff,
  listOrdersForStaff,
} from './order.service.js';

export const createNewOrder = asyncHandler(async (req, res) => {
  const order = await createOrder(req.body, req.user);

  return sendSuccess(res, {
    message: 'Order created successfully.',
    statusCode: 201,
    data: {
      order,
    },
  });
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await listOrdersForStaff(req.user, req.query);

  return sendSuccess(res, {
    message: 'Orders loaded successfully.',
    data: {
      orders,
    },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await getOrderByIdForStaff(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Order loaded successfully.',
    data: {
      order,
    },
  });
});
