import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import {
  createOrder,
  getOrderByIdForStaff,
  listOrdersForStaff,
  listOrdersForAdmin,
  getOrderByIdForAdmin,
  refundOrderItems,
} from './order.service.js';

export const getVietQRConfig = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'VietQR configuration loaded successfully.',
    data: {
      bankId: env.vietqrBankId,
      accountNo: env.vietqrAccountNo,
      accountName: env.vietqrAccountName,
      template: env.vietqrTemplate,
    },
  });
});

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
  let orders;
  if (req.user.role === 'ADMIN') {
    orders = await listOrdersForAdmin(req.user, req.query);
  } else {
    orders = await listOrdersForStaff(req.user, req.query);
  }

  return sendSuccess(res, {
    message: 'Orders loaded successfully.',
    data: {
      orders,
    },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  let order;
  if (req.user.role === 'ADMIN') {
    order = await getOrderByIdForAdmin(req.params.id, req.user);
  } else {
    order = await getOrderByIdForStaff(req.params.id, req.user);
  }

  return sendSuccess(res, {
    message: 'Order loaded successfully.',
    data: {
      order,
    },
  });
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await refundOrderItems(req.params.id, req.body, req.user);

  return sendSuccess(res, {
    message: 'Hoàn tiền đơn hàng thành công.',
    data: {
      order,
    },
  });
});
