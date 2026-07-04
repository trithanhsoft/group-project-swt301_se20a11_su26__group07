import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { formatVND } from '../../../utils/currency.js';
import { toLocalDateString, formatDateTime } from '../../../utils/date.js';
import { hrApi } from '../api/hrApi.js';
import { userApi } from '../../users/api/userApi.js';
import { Users, DollarSign, Plus, Check, X, FileSpreadsheet, Edit, RotateCcw, UserPlus } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export function AdminHRPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'requests';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [isLoading, setIsLoading] = useState(false);

  // Requests Tab
  const [requests, setRequests] = useState([]);
  const [adminNoteModal, setAdminNoteModal] = useState({ show: false, requestId: null, status: 'APPROVED', note: '' });

  // Costs Report Tab
  const [reportDates, setReportDates] = useState(() => {
    const today = new Date();
    const startOfMonth = toLocalDateString(new Date(today.getFullYear(), today.getMonth(), 1));
    const endOfMonth = toLocalDateString(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    return { start_date: startOfMonth, end_date: endOfMonth };
  });
  const [costReport, setCostReport] = useState([]);

  // Users Tab
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userLoading, setUserLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
  };

  const loadRequestsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await hrApi.getRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách yêu cầu nghỉ.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCostsReport = async () => {
    if (!reportDates.start_date || !reportDates.end_date) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await hrApi.getAdminHRCosts(reportDates);
      setCostReport(res.data?.costs || []);
    } catch (err) {
      setError(err.message || 'Không tải được báo cáo chi phí.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUserLoading(true);
    setError('');
    try {
      const response = await userApi.getUsers({
        search: userSearchQuery.trim(),
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(response.data.users || []);
    } catch (loadError) {
      setError(loadError.message || 'Không tải được danh sách người dùng.');
    } finally {
      setUserLoading(false);
    }
  };



  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
    if (activeTab === 'requests') {
      loadRequestsData();
    } else if (activeTab === 'costs') {
      loadCostsReport();
    } else if (activeTab === 'users') {
      loadUsers();
    }
    /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  }, [activeTab]);

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        loadUsers();
      }, 250);
      return () => clearTimeout(timer);
    }
    /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  }, [userSearchQuery, roleFilter, statusFilter, activeTab]);

  const renderRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return <StatusBadge status="WARNING" customLabel="Quản trị viên" />;
    }
    return <StatusBadge status="SUCCESS" customLabel="Nhân viên" />;
  };

  const userHeaders = [
    {
      key: 'username',
      label: 'Tài khoản',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong style={{ color: 'var(--color-primary)' }}>{row.username}</strong>
          <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>{row.fullName}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    {
      key: 'role',
      label: 'Vai trò',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderRoleBadge(row.role)}
        </div>
      ),
      style: { width: '140px', textAlign: 'center' },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StatusBadge status={row.status} />
        </div>
      ),
      style: { width: '150px', textAlign: 'center' },
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => formatDate(row.createdAt) || '-',
      style: { width: '120px' },
    },
    {
      key: 'lastLoginAt',
      label: 'Lần đăng nhập cuối',
      render: (row) => formatDateTime(row.lastLoginAt) || 'Chưa đăng nhập',
      style: { width: '170px' },
    },
    {
      key: 'actions',
      label: 'Hành động',
      style: { width: '100px', textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${row.id}/edit`)}
            title="Chỉnh sửa"
            style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Handle Request Approval
  const openProcessModal = (requestId, status) => {
    setAdminNoteModal({ show: true, requestId, status, note: '' });
  };

  const handleProcessRequest = async () => {
    const { requestId, status, note } = adminNoteModal;
    try {
      await hrApi.processRequest(requestId, { status, admin_note: note });
      showToast(status === 'APPROVED' ? 'Đã phê duyệt yêu cầu.' : 'Đã từ chối yêu cầu.');
      setAdminNoteModal({ show: false, requestId: null, status: 'APPROVED', note: '' });
      loadRequestsData();
    } catch (err) {
      showToast(err.message || 'Xử lý yêu cầu thất bại.', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Quản lý nhân sự"
        description="Quản lý tài khoản người dùng, duyệt các yêu cầu và theo dõi tổng chi phí quỹ lương."
        actions={
          activeTab === 'users' ? (
            <>
              <Button variant="secondary" onClick={loadUsers} disabled={userLoading} icon={<RotateCcw size={16} />}>
                Tải lại
              </Button>
              <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_USERS_NEW)} icon={<Plus size={16} />}>
                Tạo tài khoản
              </Button>
            </>
          ) : undefined
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tab Navigation */}
      <div className="tab-container" style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-surface-container-high)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('requests')}
          className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} />
          Duyệt yêu cầu nghỉ phép
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} />
          Quản lý tài khoản
        </button>
        <button
          onClick={() => setActiveTab('costs')}
          className={`btn ${activeTab === 'costs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <DollarSign size={18} />
          Báo cáo chi phí nhân sự
        </button>
      </div>

      {/* --- TAB CONTENT: REQUESTS --- */}
      {activeTab === 'requests' && (
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Phê duyệt yêu cầu nghỉ phép & Đổi ca</h3>
          {requests.length === 0 ? (
            <p style={{ color: 'var(--color-secondary)', textAlign: 'center', padding: '40px' }}>Không có yêu cầu nghỉ phép nào từ nhân sự.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Loại</th>
                    <th>Ngày áp dụng</th>
                    <th>Lý do & Chi tiết</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Duyệt / Từ chối</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.staff_name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>@{req.staff_username}</div>
                      </td>
                      <td>
                        <span className={`badge ${req.type === 'LEAVE' ? 'badge-error' : 'badge-warning'}`}>
                          {req.type === 'LEAVE' ? 'Xin nghỉ' : 'Đổi ca'}
                        </span>
                      </td>
                      <td><strong>{formatDate(req.target_date)}</strong></td>
                      <td>
                        <div style={{ maxWidth: '300px', fontSize: '13px' }}>
                          <strong>{req.reason}</strong>
                          {req.type === 'SWAP' && (
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '4px' }}>
                              Đổi ca: {req.target_shift_name} sang cho <strong>{req.swap_with_staff_name}</strong>
                            </div>
                          )}
                          {req.admin_note && (
                            <div style={{ color: 'var(--color-primary)', fontSize: '11px', marginTop: '6px', fontStyle: 'italic' }}>
                              Ghi chú Admin: {req.admin_note} (xử lý bởi {req.processed_by_name})
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-error' : 'badge-neutral'}`}>
                          {req.status === 'APPROVED' ? 'Đã duyệt' : req.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openProcessModal(req.id, 'APPROVED')}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', display: 'flex', gap: '4px', alignItems: 'center' }}
                            >
                              <Check size={14} /> Duyệt
                            </button>
                            <button
                              onClick={() => openProcessModal(req.id, 'REJECTED')}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)' }}
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: COSTS REPORT --- */}
      {activeTab === 'costs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <TextInput
                type="date"
                label="Từ ngày"
                name="start_date"
                value={reportDates.start_date}
                onChange={(e) => setReportDates({ ...reportDates, start_date: e.target.value })}
              />
            </div>
            <div>
              <TextInput
                type="date"
                label="Đến ngày"
                name="end_date"
                value={reportDates.end_date}
                onChange={(e) => setReportDates({ ...reportDates, end_date: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <Button onClick={loadCostsReport} variant="primary" icon={<FileSpreadsheet size={16} />} disabled={isLoading}>
                Tra cứu báo cáo lương
              </Button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Báo cáo chi phí quỹ lương</h3>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Đang tổng hợp dữ liệu...</div>
            ) : costReport.length === 0 ? (
              <p style={{ color: 'var(--color-secondary)', textAlign: 'center', padding: '24px' }}>Không có dữ liệu chi phí trong khoảng thời gian đã chọn.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nhân viên</th>
                      <th>Username</th>
                      <th style={{ textAlign: 'center' }}>Số ca hoàn thành</th>
                      <th style={{ textAlign: 'right' }}>Tổng lương chi trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costReport.map((row) => (
                      <tr key={row.staff_id}>
                        <td><strong>{row.staff_name}</strong></td>
                        <td>@{row.staff_username}</td>
                        <td style={{ textAlign: 'center' }}>{row.completed_shifts}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                          {formatVND(Number(row.total_salary))}
                        </td>
                      </tr>
                    ))}
                    {/* Grand Total */}
                    <tr style={{ backgroundColor: 'var(--color-surface-container-low)', fontWeight: 'bold' }}>
                      <td colSpan={2}>TỔNG CỘNG CHI PHÍ NHÂN SỰ</td>
                      <td style={{ textAlign: 'center' }}>
                        {costReport.reduce((sum, r) => sum + Number(r.completed_shifts), 0)} ca
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontSize: '16px' }}>
                        {formatVND(costReport.reduce((sum, r) => sum + Number(r.total_salary), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: USERS (QUẢN LÝ TÀI KHOẢN) --- */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <TextInput
                  placeholder="Tìm theo username, họ tên hoặc email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ width: '180px' }}>
                <SelectInput
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Tất cả vai trò' },
                    { value: 'ADMIN', label: 'Quản trị viên' },
                    { value: 'STAFF', label: 'Nhân viên' },
                  ]}
                />
              </div>

              <div style={{ width: '180px' }}>
                <SelectInput
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'ACTIVE', label: 'Hoạt động' },
                    { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                  ]}
                />
              </div>
            </div>
          </div>

          <DataTable
            headers={userHeaders}
            data={users}
            loading={userLoading}
            emptyMessage="Chưa có người dùng nào phù hợp với bộ lọc hiện tại."
          />
        </div>
      )}

      {/* Admin Note processing request modal */}
      {adminNoteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '450px', backgroundColor: '#fff' }}>
            <h3>Xử lý yêu cầu</h3>
            <p>Trạng thái chọn: <strong>{adminNoteModal.status === 'APPROVED' ? 'PHÊ DUYỆT' : 'TỪ CHỐI'}</strong></p>
            <TextareaInput
              label="Ghi chú ý kiến của quản trị viên"
              name="note"
              value={adminNoteModal.note}
              onChange={(e) => setAdminNoteModal({ ...adminNoteModal, note: e.target.value })}
              placeholder="Nhập phản hồi cho nhân viên..."
              required
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button onClick={handleProcessRequest} variant="primary">Xác nhận</Button>
              <Button onClick={() => setAdminNoteModal({ show: false, requestId: null, status: 'APPROVED', note: '' })} variant="secondary">Hủy bỏ</Button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default AdminHRPage;
