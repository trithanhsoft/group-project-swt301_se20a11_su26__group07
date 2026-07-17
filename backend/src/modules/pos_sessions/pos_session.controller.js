import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import {
  getActiveSession,
  openSession,
  closeSession,
  listSessions,
  midShiftCountSession,
  getSessionReport,
} from './pos_session.service.js';

export const getOpenSession = asyncHandler(async (req, res) => {
  const session = await getActiveSession(req.user.id);
  
  return sendSuccess(res, {
    message: 'Active POS session retrieved.',
    data: { session }
  });
});

export const postOpenSession = asyncHandler(async (req, res) => {
  const { startingCash, notes } = req.body;
  
  if (startingCash === undefined) {
    throw new ApiError(400, 'Starting cash is required.');
  }

  const session = await openSession(req.user.id, startingCash, notes);

  return sendSuccess(res, {
    message: 'Ca bán hàng đã được mở thành công.',
    statusCode: 201,
    data: { session }
  });
});

export const postCloseSession = asyncHandler(async (req, res) => {
  const { endingCashActual, notes } = req.body;
  
  if (endingCashActual === undefined) {
    throw new ApiError(400, 'Ending cash actual is required.');
  }

  // Find the active session first
  const activeSession = await getActiveSession(req.user.id);
  if (!activeSession) {
    throw new ApiError(404, 'Không tìm thấy ca bán hàng đang mở.');
  }

  const session = await closeSession(activeSession.id, endingCashActual, notes);

  return sendSuccess(res, {
    message: 'Ca bán hàng đã đóng thành công.',
    data: { session }
  });
});

export const getSessionsHistory = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  
  let staffId = undefined;
  // If user is STAFF, they can only view their own shift history
  if (req.user.role === ROLES.STAFF) {
    staffId = req.user.id;
  } else {
    // If admin, they can query specific staff via query params
    staffId = req.query.staffId;
  }

  const sessions = await listSessions({ staffId, dateFrom, dateTo });

  return sendSuccess(res, {
    message: 'POS sessions loaded successfully.',
    data: { sessions }
  });
});

export const postMidShiftCount = asyncHandler(async (req, res) => {
  const { midShiftCash, notes } = req.body;

  if (midShiftCash === undefined) {
    throw new ApiError(400, 'Số tiền bàn giao ca sáng (midShiftCash) là bắt buộc.');
  }

  // Find active session
  const activeSession = await getActiveSession(req.user.id);
  if (!activeSession) {
    throw new ApiError(404, 'Không tìm thấy ca làm việc đang hoạt động để thực hiện tổng kết.');
  }

  const session = await midShiftCountSession(activeSession.id, midShiftCash, notes);

  return sendSuccess(res, {
    message: 'Đã tổng kết và bàn giao ca sáng thành công.',
    data: { session }
  });
});

export const getSingleSessionReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, 'ID ca làm việc là bắt buộc.');
  }

  const report = await getSessionReport(id);

  // Security check: staff can only see their own reports (unless admin)
  if (req.user.role === ROLES.STAFF && report.session.staff_id !== req.user.id) {
    throw new ApiError(403, 'Bạn không có quyền truy cập báo cáo ca của nhân viên khác.');
  }

  return sendSuccess(res, {
    message: 'Báo cáo ca làm việc loaded thành công.',
    data: report
  });
});
