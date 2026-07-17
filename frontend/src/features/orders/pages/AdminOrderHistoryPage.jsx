import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RotateCcw, Search } from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { formatVND } from '../../../utils/currency.js';
import { formatDateTime } from '../../../utils/date.js';

function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod === 'CASH') {
    return 'Tiền mặt';
  }
  if (paymentMethod === 'QR') {
    return 'Chuyển khoản (VietQR)';
  }
  return paymentMethod || '--';
}

export function AdminOrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);

  // Search/Filters states
  const [orderCode, setOrderCode] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Active filters applied to request
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await orderApi.getOrders(appliedFilters);
        if (!isCancelled) {
          setOrders(response.data.orders || []);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setOrders([]);
          setError(loadError.message || 'Không tải được danh sách đơn hàng quản trị.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [appliedFilters, reloadNonce]);

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    if (orderCode.trim()) filters.orderCode = orderCode.trim();
    if (staffUsername.trim()) filters.staffUsername = staffUsername.trim();
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setOrderCode('');
    setStaffUsername('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({});
  };

  const headers = [
    {
      key: 'orderCode',
      label: 'Mã đơn hàng',
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>#{row.orderCode}</strong>,
    },
    {
      key: 'staffUsername',
      label: 'Nhân viên bán',
      render: (row) => row.staffUsername || 'Staff',
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (row) => formatVND(row.totalAmount),
    },
    {
      key: 'refundedAmount',
      label: 'Đã hoàn trả',
      render: (row) => row.refundedAmount > 0 ? (
        <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>-{formatVND(row.refundedAmount)}</span>
      ) : '--',
    },
    {
      key: 'netAmount',
      label: 'Thực thu (Net)',
      render: (row) => formatVND(row.totalAmount - row.refundedAmount),
    },
    {
      key: 'paymentMethod',
      label: 'Thanh toán',
      render: (row) => getPaymentMethodLabel(row.paymentMethod),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Ngày bán',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Chi tiết',
      style: { width: '80px', textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/orders/${row.id}`)}
            title="Xem chi tiết đơn hàng"
            style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý đơn hàng"
        description="Tra cứu và quản trị toàn bộ đơn hàng, thực hiện hoàn tiền theo sản phẩm hoặc hủy hóa đơn."
        actions={
          <Button
            variant="secondary"
            onClick={() => setReloadNonce((current) => current + 1)}
            disabled={isLoading}
            icon={<RotateCcw size={16} />}
          >
            Tải lại
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSearch} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <TextInput
            label="Mã đơn hàng"
            placeholder="Ví dụ: OD..."
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
          />
          <TextInput
            label="Tên nhân viên (Username)"
            placeholder="Username..."
            value={staffUsername}
            onChange={(e) => setStaffUsername(e.target.value)}
          />
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-on-surface)' }}>Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-outline)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
                fontSize: '14px'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PARTIALLY_REFUNDED">Hoàn một phần</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>
          <TextInput
            label="Từ ngày"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <TextInput
            label="Đến ngày"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" type="button" onClick={handleReset} disabled={isLoading}>
            Đặt lại bộ lọc
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading} icon={<Search size={16} />}>
            Tìm kiếm
          </Button>
        </div>
      </form>

      <DataTable
        headers={headers}
        data={orders}
        loading={isLoading}
        emptyMessage="Không tìm thấy đơn hàng nào phù hợp với bộ lọc."
        style={{ minWidth: '1120px' }}
      />
    </div>
  );
}

export default AdminOrderHistoryPage;
