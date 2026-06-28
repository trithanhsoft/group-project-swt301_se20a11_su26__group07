import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, RotateCcw } from 'lucide-react';
import { userApi } from '../api/userApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { formatDate, formatDateTime } from '../../../utils/date.js';
import { ROUTES } from '../../../constants/routes.js';

function renderRoleBadge(role) {
  if (role === 'ADMIN') {
    return <StatusBadge status="WARNING" customLabel="Quản trị viên" />;
  }

  return <StatusBadge status="SUCCESS" customLabel="Nhân viên" />;
}

export function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await userApi.getUsers({
        search: searchQuery.trim(),
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(response.data.users || []);
    } catch (loadError) {
      setError(loadError.message || 'Không tải được danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter, statusFilter]);

  const headers = [
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
      render: (row) => renderRoleBadge(row.role),
      style: { width: '140px' },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <StatusBadge status={row.status} />,
      style: { width: '150px' },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý người dùng"
        description="Admin tạo tài khoản nội bộ, cập nhật quyền truy cập và quản lý trạng thái hoạt động."
        actions={
          <>
            <Button variant="secondary" onClick={loadUsers} disabled={isLoading} icon={<RotateCcw size={16} />}>
              Tải lại
            </Button>
            <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_USERS_NEW)} icon={<Plus size={16} />}>
              Tạo tài khoản
            </Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <TextInput
              placeholder="Tìm theo username, họ tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        headers={headers}
        data={users}
        loading={isLoading}
        emptyMessage="Chưa có người dùng nào phù hợp với bộ lọc hiện tại."
      />
    </div>
  );
}

export default UserListPage;
