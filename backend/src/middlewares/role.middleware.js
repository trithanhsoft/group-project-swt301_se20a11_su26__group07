import { ApiError } from '../utils/ApiError.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized. Please login first.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied. You do not have permission for this action.'));
    }

    return next();
  };
}
