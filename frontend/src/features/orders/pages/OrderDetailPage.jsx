import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatVND } from '../../../utils/currency.js';
import { formatDateTime } from '../../../utils/date.js';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_ORDERS_KEY = 'mini_pos_orders';

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrderDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await orderApi.getOrder(id);
        setOrder(res.data);
        setIsUsingMock(false);
      } catch (err) {
        setIsUsingMock(true);
        const stored = localStorage.getItem(MOCK_ORDERS_KEY);
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find(o => String(o.id) === String(id));
          if (found) {
            setOrder(found);
          } else {
            setError('Không tìm thấy đơn hàng trong bộ nhớ.');
          }
        } else {
          setError('Không tìm thấy dữ liệu hóa đơn.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetail();
  }, [id]);

  const headers = [
    { key: 'product_name', label: 'Tên món nước', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.product_name || row.product?.name}</strong> },
    { key: 'price', label: 'Đơn giá', render: (row) => formatVND(row.price) },
    { key: 'quantity', label: 'Số lượng' },
    {
      key: 'total',
      label: 'Thành tiền',
      render: (row) => formatVND(row.price * row.quantity)
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title={order ? `Chi tiết đơn hàng #${order.order_code}` : 'Thông tin chi tiết đơn hàng'}
        description="Tra cứu chi tiết thành phần món nước và đơn giá đã bán."
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.STAFF_ORDERS)} icon={<ArrowLeft size={16} />}>
            Quay lại lịch sử
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API đơn hàng chưa hoàn tất kết nối CSDL."
        />
      )}

      {error && <Alert type="error" message={error} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải thông tin đơn hàng...</p>
        </div>
      ) : order ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
          
          {/* Left card: purchased items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0, marginBottom: '16px' }}>
                Danh sách món nước đã gọi
              </h3>
              <DataTable
                headers={headers}
                data={order.items || order.order_items || []}
                loading={false}
              />
            </div>
          </div>

          {/* Right card: summaries */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px', margin: 0 }}>
              Thông tin thanh toán
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Mã hóa đơn</span>
                <strong style={{ color: 'var(--color-on-background)' }}>#{order.order_code}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Thời gian tạo</span>
                <span style={{ color: 'var(--color-on-background)' }}>{formatDateTime(order.created_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Thu ngân thực hiện</span>
                <span style={{ color: 'var(--color-on-background)', textTransform: 'capitalize' }}>
                  {order.created_by || order.user?.username || 'Staff'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Trạng thái đơn</span>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)' }}>Tổng cộng</span>
                <strong style={{ fontSize: '18px', color: 'var(--color-tertiary-container)' }}>
                  {formatVND(order.total_amount)}
                </strong>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
export default OrderDetailPage;
