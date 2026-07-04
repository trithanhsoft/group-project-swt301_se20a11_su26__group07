import { useEffect, useState } from 'react';
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

function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod === 'CASH') {
    return 'Tien mat';
  }

  return paymentMethod || '--';
}

function getKdsStatusLabel(kdsStatus) {
  return kdsStatus === 'COMPLETED' ? 'Da hoan thanh' : 'Don moi';
}

function getKdsStatusVariant(kdsStatus) {
  return kdsStatus === 'COMPLETED' ? 'SUCCESS' : 'WARNING';
}

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadOrderDetail = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await orderApi.getOrder(id);

        if (!isCancelled) {
          setOrder(response.data.order || null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setOrder(null);
          setError(loadError.message || 'Khong tai duoc thong tin don hang.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrderDetail();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const headers = [
    {
      key: 'productName',
      label: 'Ten mon nuoc',
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.productName}</strong>,
    },
    {
      key: 'unitPrice',
      label: 'Don gia',
      render: (row) => formatVND(row.unitPrice),
    },
    {
      key: 'quantity',
      label: 'So luong',
    },
    {
      key: 'subtotal',
      label: 'Thanh tien',
      render: (row) => formatVND(row.subtotal),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title={order ? `Chi tiet don hang #${order.orderCode}` : 'Thong tin chi tiet don hang'}
        description="Xem lai san pham, snapshot gia va thong tin thanh toan cua don hang."
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.STAFF_ORDERS)} icon={<ArrowLeft size={16} />}>
            Quay lai lich su
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Dang tai thong tin don hang...</p>
        </div>
      ) : order ? (
        <div className="responsive-split-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0, marginBottom: '16px' }}>
                Danh sach mon da ban
              </h3>
              <DataTable headers={headers} data={order.items || []} loading={false} />
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--color-primary)',
                borderBottom: '1px solid var(--color-outline-variant)',
                paddingBottom: '12px',
                margin: 0,
              }}
            >
              Thong tin thanh toan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Ma don hang</span>
                <strong style={{ color: 'var(--color-on-background)' }}>#{order.orderCode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Thoi gian tao</span>
                <span style={{ color: 'var(--color-on-background)' }}>{formatDateTime(order.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Thoi gian thanh toan</span>
                <span style={{ color: 'var(--color-on-background)' }}>
                  {order.paidAt ? formatDateTime(order.paidAt) : '--'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Thu ngan thuc hien</span>
                <span style={{ color: 'var(--color-on-background)', textTransform: 'capitalize' }}>
                  {order.staffUsername || 'Staff'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Phuong thuc</span>
                <span style={{ color: 'var(--color-on-background)' }}>
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Khach dua</span>
                <span style={{ color: 'var(--color-on-background)' }}>
                  {order.amountReceived === null ? '--' : formatVND(order.amountReceived)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Tien thoi</span>
                <span style={{ color: 'var(--color-on-background)' }}>
                  {order.changeAmount === null ? '--' : formatVND(order.changeAmount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Trang thai don</span>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Trang thai KDS</span>
                <StatusBadge
                  status={getKdsStatusVariant(order.kdsStatus)}
                  customLabel={getKdsStatusLabel(order.kdsStatus)}
                />
              </div>
              {order.note ? (
                <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px' }}>
                  <div
                    style={{
                      color: 'var(--color-secondary)',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    Ghi chu
                  </div>
                  <div style={{ color: 'var(--color-on-background)', lineHeight: 1.5 }}>
                    {order.note}
                  </div>
                </div>
              ) : null}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)' }}>Tong cong</span>
                <strong style={{ fontSize: '18px', color: 'var(--color-tertiary-container)' }}>
                  {formatVND(order.totalAmount)}
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
