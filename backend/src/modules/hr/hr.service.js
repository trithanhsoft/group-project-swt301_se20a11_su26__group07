import { query } from '../../config/db.js';

// --- SHIFTS MASTER DATA ---

export async function listShifts() {
  const result = await query(
    `SELECT * FROM shifts WHERE deleted_at IS NULL ORDER BY start_time`
  );
  return result.rows;
}

export async function createShift({ name, start_time, end_time, hourly_rate }) {
  const result = await query(
    `INSERT INTO shifts (name, start_time, end_time, hourly_rate)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, start_time, end_time, hourly_rate]
  );
  return result.rows[0];
}

export async function updateShift(id, { name, start_time, end_time, hourly_rate }) {
  const result = await query(
    `UPDATE shifts
     SET name = $1, start_time = $2, end_time = $3, hourly_rate = $4, updated_at = NOW()
     WHERE id = $5 AND deleted_at IS NULL
     RETURNING *`,
    [name, start_time, end_time, hourly_rate, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Ca làm việc không tồn tại hoặc đã bị xóa.');
  }
  return result.rows[0];
}

export async function deleteShift(id) {
  const result = await query(
    `UPDATE shifts
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('Ca làm việc không tồn tại hoặc đã bị xóa.');
  }
  return result.rows[0];
}

// --- STAFF AVAILABILITY ---

export async function listAvailability({ staff_id, start_date, end_date }) {
  let sql = `
    SELECT sa.*, u.full_name as staff_name, u.username as staff_username
    FROM staff_availability sa
    JOIN app_users u ON sa.staff_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (staff_id) {
    params.push(staff_id);
    sql += ` AND sa.staff_id = $${params.length}`;
  }
  if (start_date) {
    params.push(start_date);
    sql += ` AND sa.available_date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND sa.available_date <= $${params.length}`;
  }

  sql += ` ORDER BY sa.available_date, sa.start_time`;

  const result = await query(sql, params);
  return result.rows;
}

export async function createAvailability(staffId, { available_date, start_time, end_time, note }) {
  // Check if overlap exists for the same staff on same date
  const overlapCheck = await query(
    `SELECT id FROM staff_availability
     WHERE staff_id = $1 AND available_date = $2
       AND start_time < $3 AND end_time > $4`,
    [staffId, available_date, end_time, start_time]
  );

  if (overlapCheck.rows.length > 0) {
    throw new Error('Khung giờ rảnh đã đăng ký bị trùng lặp.');
  }

  const result = await query(
    `INSERT INTO staff_availability (staff_id, available_date, start_time, end_time, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [staffId, available_date, start_time, end_time, note]
  );
  return result.rows[0];
}

export async function deleteAvailability(id, staffId, isAdmin = false) {
  let result;
  if (isAdmin) {
    result = await query(
      `DELETE FROM staff_availability WHERE id = $1 RETURNING *`,
      [id]
    );
  } else {
    result = await query(
      `DELETE FROM staff_availability WHERE id = $1 AND staff_id = $2 RETURNING *`,
      [id, staffId]
    );
  }

  if (result.rows.length === 0) {
    throw new Error('Lịch rảnh không tồn tại hoặc bạn không có quyền xóa.');
  }
  return result.rows[0];
}

// --- STAFF SHIFTS ---

export async function listAssignedShifts({ staff_id, start_date, end_date }) {
  let sql = `
    SELECT ss.*, s.name as shift_name, s.start_time, s.end_time,
           u.full_name as staff_name, u.username as staff_username
    FROM staff_shifts ss
    JOIN shifts s ON ss.shift_id = s.id
    JOIN app_users u ON ss.staff_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (staff_id) {
    params.push(staff_id);
    sql += ` AND ss.staff_id = $${params.length}`;
  }
  if (start_date) {
    params.push(start_date);
    sql += ` AND ss.shift_date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND ss.shift_date <= $${params.length}`;
  }

  sql += ` ORDER BY ss.shift_date, s.start_time`;

  const result = await query(sql, params);
  return result.rows;
}

export async function assignShift(creatorId, { staff_id, shift_id, shift_date, custom_start_time, custom_end_time }) {
  // 1. Fetch shift info
  const shiftRes = await query(`SELECT * FROM shifts WHERE id = $1 AND deleted_at IS NULL`, [shift_id]);
  if (shiftRes.rows.length === 0) {
    throw new Error('Ca làm việc mẫu không tồn tại.');
  }
  const shift = shiftRes.rows[0];

  let start_time = shift.start_time;
  let end_time = shift.end_time;
  let hasCustom = false;

  if (custom_start_time && custom_end_time) {
    const startParts = custom_start_time.split(':');
    const startMin = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    const endParts = custom_end_time.split(':');
    const endMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

    // 6 AM is 360 minutes, 11 PM is 1380 minutes
    if (startMin < 360 || endMin > 1380 || startMin >= endMin) {
      throw new Error('Chọn giờ tùy chọn trong khoảng 6h sáng tới 11h tối và không qua đêm.');
    }

    const start = new Date(`1970-01-01T${custom_start_time}`);
    const end = new Date(`1970-01-01T${custom_end_time}`);
    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours < 3 || diffHours > 16) {
      throw new Error('Thời gian ca làm việc linh động phải từ 3 đến 16 tiếng.');
    }
    start_time = custom_start_time;
    end_time = custom_end_time;
    hasCustom = true;
  }

  // 2. Check conflicts (already assigned a shift overlapping with this time)
  const overlappingShifts = await query(
    `SELECT ss.id FROM staff_shifts ss
     JOIN shifts s ON ss.shift_id = s.id
     WHERE ss.staff_id = $1 AND ss.shift_date = $2
       AND COALESCE(ss.custom_start_time, s.start_time) < $3 
       AND COALESCE(ss.custom_end_time, s.end_time) > $4`,
    [staff_id, shift_date, end_time, start_time]
  );
  if (overlappingShifts.rows.length > 0) {
    throw new Error('Nhân viên này đã được phân công ca làm khác trùng giờ vào ngày này.');
  }

  // 3. Calculate hours & total salary
  const start = new Date(`1970-01-01T${start_time}`);
  const end = new Date(`1970-01-01T${end_time}`);
  let diffHours = (end - start) / (1000 * 60 * 60);
  if (diffHours < 0) diffHours += 24;

  const rateSnapshot = hasCustom ? 25000 : Number(shift.hourly_rate);
  const totalSalary = diffHours * rateSnapshot;

  // 4. Insert
  const result = await query(
    `INSERT INTO staff_shifts (staff_id, shift_id, shift_date, hourly_rate_snapshot, total_salary, custom_start_time, custom_end_time, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [staff_id, shift_id, shift_date, rateSnapshot, totalSalary, hasCustom ? custom_start_time : null, hasCustom ? custom_end_time : null, creatorId]
  );
  return result.rows[0];
}

export async function updateShiftStatus(id, status) {
  const result = await query(
    `UPDATE staff_shifts
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Phân lịch làm việc không tồn tại.');
  }
  return result.rows[0];
}

export async function deleteShiftAssignment(id) {
  const result = await query(
    `DELETE FROM staff_shifts WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error('Lịch phân ca không tồn tại.');
  }
  return result.rows[0];
}

// --- STAFF REQUESTS ---

export async function listRequests({ staff_id, status }) {
  let sql = `
    SELECT sr.*, u.full_name as staff_name, u.username as staff_username,
           s.name as target_shift_name, s.start_time, s.end_time,
           u2.full_name as swap_with_staff_name,
           u3.full_name as processed_by_name
    FROM staff_requests sr
    JOIN app_users u ON sr.staff_id = u.id
    LEFT JOIN shifts s ON sr.target_shift_id = s.id
    LEFT JOIN app_users u2 ON sr.swap_with_staff_id = u2.id
    LEFT JOIN app_users u3 ON sr.processed_by = u3.id
    WHERE 1=1
  `;
  const params = [];

  if (staff_id) {
    params.push(staff_id);
    sql += ` AND sr.staff_id = $${params.length}`;
  }
  if (status) {
    params.push(status);
    sql += ` AND sr.status = $${params.length}`;
  }

  sql += ` ORDER BY sr.created_at DESC`;

  const result = await query(sql, params);
  return result.rows;
}

export async function createRequest(staffId, { type, reason, target_date, target_shift_id, swap_with_staff_id }) {
  const result = await query(
    `INSERT INTO staff_requests (staff_id, type, reason, target_date, target_shift_id, swap_with_staff_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING *`,
    [staffId, type, reason, target_date, target_shift_id || null, swap_with_staff_id || null]
  );
  return result.rows[0];
}

export async function processRequest(adminId, id, { status, admin_note }) {
  // 1. Fetch request details
  const reqRes = await query(`SELECT * FROM staff_requests WHERE id = $1`, [id]);
  if (reqRes.rows.length === 0) {
    throw new Error('Yêu cầu không tồn tại.');
  }
  const request = reqRes.rows[0];

  if (request.status !== 'PENDING') {
    throw new Error('Yêu cầu này đã được xử lý trước đó.');
  }

  // 2. Perform automated action if APPROVED
  if (status === 'APPROVED') {
    if (request.type === 'LEAVE') {
      // Set staff_shifts of that staff on that date/shift to ABSENT or just delete it
      // Let's set status to ABSENT and set total_salary = 0
      await query(
        `UPDATE staff_shifts
         SET status = 'ABSENT', total_salary = 0, updated_at = NOW()
         WHERE staff_id = $1 AND shift_date = $2 AND (shift_id = $3 OR $3 IS NULL)`,
        [request.staff_id, request.target_date, request.target_shift_id]
      );
    } else if (request.type === 'SWAP') {
      if (!request.swap_with_staff_id) {
        throw new Error('Không có thông tin nhân viên nhận đổi ca.');
      }
      // Check if swap target staff has overlap conflict
      const targetShiftRes = await query(`SELECT start_time, end_time FROM shifts WHERE id = $1`, [request.target_shift_id]);
      if (targetShiftRes.rows.length > 0) {
        const targetShift = targetShiftRes.rows[0];
        const overlappingShifts = await query(
          `SELECT ss.id FROM staff_shifts ss
           JOIN shifts s ON ss.shift_id = s.id
           WHERE ss.staff_id = $1 AND ss.shift_date = $2
             AND s.start_time < $3 AND s.end_time > $4`,
          [request.swap_with_staff_id, request.target_date, targetShift.end_time, targetShift.start_time]
        );
        if (overlappingShifts.rows.length > 0) {
          throw new Error('Nhân viên nhận ca bị trùng lịch làm việc khác vào ngày này.');
        }
      }

      // Perform swap: update staff_id in staff_shifts to swap_with_staff_id
      const swapRes = await query(
        `UPDATE staff_shifts
         SET staff_id = $1, updated_at = NOW()
         WHERE staff_id = $2 AND shift_date = $3 AND shift_id = $4
         RETURNING id`,
        [request.swap_with_staff_id, request.staff_id, request.target_date, request.target_shift_id]
      );
      if (swapRes.rows.length === 0) {
        throw new Error('Không tìm thấy lịch phân ca phù hợp để thực hiện đổi ca.');
      }
    }
  }

  // 3. Update request status
  const result = await query(
    `UPDATE staff_requests
     SET status = $1, admin_note = $2, processed_by = $3, processed_at = NOW(), updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, admin_note, adminId, id]
  );
  return result.rows[0];
}

// --- STATS & COST REPORTS ---

export async function getSalarySummary(staffId, { start_date, end_date }) {
  const result = await query(
    `SELECT 
       COUNT(id) filter (where status = 'COMPLETED') as completed_shifts,
       COUNT(id) filter (where status = 'ABSENT') as absent_shifts,
       COALESCE(SUM(total_salary) filter (where status = 'COMPLETED'), 0) as total_earned
     FROM staff_shifts
     WHERE staff_id = $1 AND shift_date >= $2 AND shift_date <= $3`,
    [staffId, start_date, end_date]
  );
  return result.rows[0];
}

export async function getHRCostReport({ start_date, end_date }) {
  const result = await query(
    `SELECT 
       u.id as staff_id, u.full_name as staff_name, u.username as staff_username,
       COUNT(ss.id) filter (where ss.status = 'COMPLETED') as completed_shifts,
       COALESCE(SUM(ss.total_salary) filter (where ss.status = 'COMPLETED'), 0) as total_salary
     FROM app_users u
     LEFT JOIN staff_shifts ss ON u.id = ss.staff_id AND ss.shift_date >= $1 AND ss.shift_date <= $2
     WHERE u.deleted_at IS NULL
     GROUP BY u.id, u.full_name, u.username
     ORDER BY total_salary DESC`,
    [start_date, end_date]
  );
  return result.rows;
}
