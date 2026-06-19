import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RotateCcw } from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatVND } from '../../../utils/currency.js';
import { formatDateTime } from '../../../utils/date.js';

const MOCK_ORDERS_KEY = 'mini_pos_orders';
const DEFAULT_MOCK_ORDERS = [
  { id: 1, order_code: 'OD582910', total_amount: 54000, status: 'SUCCESS', created_by: 'staff', created_at: '2026-06-19T09:30:00Z', items: [{ product_name: 'Espresso', price: 25000, quantity: 1 }, { product_name: 'Ca phe sua da', price: 29000, quantity: 1 }] },
  { id: 2, order_code: 'OD910243', total_amount: 64000, status: 'SUCCESS', created_by: 'staff', created_at: '2026-06-19T10:15:00Z', items: [{ product_name: 'Bac siu', price: 32000, quantity: 2 }] },
];

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderApi.getOrders();
      setOrders(res.data || []);
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_ORDERS_KEY);
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders(DEFAULT_MOCK_ORDERS);
        localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleViewDetail = (id) => {
    navigate(`/staff/orders/${id}`);
  };

  const headers = [
    { key: 'order_code', label: 'Mã đơn hàng', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>#{row.order_code}</strong> },
    { key: 'created_by', label: 'Nhân viên bán hàng', render: (row) => row.created_by || row.user?.username || 'Staff' },
    { key: 'total_amount', label: 'Tổng thanh toán', render: (row) => formatVND(row.total_amount) },
    { key: 'created_at', label: 'Ngày bán', render: (row) => formatDateTime(row.created_at) },
    {
      key: 'actions',
      label: 'Chi tiết',
      style: { width: '80px', textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => handleViewDetail(row.id)}
            title="Xem chi tiết đơn hàng"
            style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}
          >
            <Eye size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Lịch sử đơn hàng"
        description="Tra cứu và xem chi tiết các đơn hàng bán ra tại quầy."
        actions={
          <Button variant="secondary" onClick={loadOrders} disabled={isLoading} icon={<RotateCcw size={16} />}>
            Tải lại
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API đơn hàng chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Orders Table */}
      <DataTable
        headers={headers}
        data={[...orders].reverse()}
        loading={isLoading}
        emptyMessage="Chưa có đơn hàng nào được thực hiện thành công."
      />
    </div>
  );
}
export default OrderHistoryPage;
