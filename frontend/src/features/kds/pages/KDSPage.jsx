import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChefHat, Clock3, RotateCcw } from 'lucide-react';
import { kdsApi } from '../api/kdsApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { formatDateTime } from '../../../utils/date.js';

const AUTO_REFRESH_MS = 15000;
const KDS_STATUS_COMPLETED = 'COMPLETED';

function getMinutesElapsed(isoString) {
  if (!isoString) {
    return 0;
  }

  const date = new Date(isoString);
  const milliseconds = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || milliseconds <= 0) {
    return 0;
  }

  return Math.floor(milliseconds / 60000);
}

function formatElapsedLabel(isoString) {
  const minutes = getMinutesElapsed(isoString);

  if (minutes <= 0) {
    return 'Vua tao';
  }

  if (minutes < 60) {
    return `${minutes} phut`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} gio`;
  }

  return `${hours} gio ${remainingMinutes} phut`;
}

function KdsOrderCard({ order, onComplete, isCompleting }) {
  const isCompleted = order.kdsStatus === KDS_STATUS_COMPLETED;
  const statusLabel = isCompleted ? 'Da hoan thanh' : 'Don moi';
  const statusVariant = isCompleted ? 'SUCCESS' : 'WARNING';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        borderLeft: isCompleted
          ? '4px solid var(--color-tertiary-container)'
          : '4px solid var(--color-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
            #{order.orderCode}
          </strong>
          <div style={{ color: 'var(--color-secondary)', fontSize: '12px' }}>
            Thu ngan: {order.staffUsername || 'Staff'}
          </div>
        </div>

        <StatusBadge status={statusVariant} customLabel={statusLabel} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--color-secondary)',
        }}
      >
        <div>
          <div style={{ marginBottom: '4px' }}>Tao luc</div>
          <strong style={{ color: 'var(--color-on-background)' }}>
            {formatDateTime(order.createdAt)}
          </strong>
        </div>

        <div>
          <div style={{ marginBottom: '4px' }}>
            {isCompleted ? 'Hoan thanh luc' : 'Thoi gian cho'}
          </div>
          <strong style={{ color: 'var(--color-on-background)' }}>
            {isCompleted
              ? order.kdsCompletedAt
                ? formatDateTime(order.kdsCompletedAt)
                : '--'
              : formatElapsedLabel(order.createdAt)}
          </strong>
        </div>
      </div>

      {order.note ? (
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-default)',
            backgroundColor: 'var(--color-surface-container-low)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-secondary)', marginBottom: '6px' }}>
            Ghi chu
          </div>
          <div style={{ lineHeight: 1.5, color: 'var(--color-on-background)' }}>{order.note}</div>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)' }}>
          Danh sach mon
        </div>

        {(order.items || []).length === 0 ? (
          <div style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>
            Khong co mon nao trong don.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px dashed var(--color-outline-variant)',
                }}
              >
                <div style={{ color: 'var(--color-on-background)', lineHeight: 1.4 }}>
                  {item.productName}
                </div>
                <strong style={{ color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                  x{item.quantity}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--color-outline-variant)',
          paddingTop: '12px',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-secondary)',
            fontSize: '12px',
          }}
        >
          <Clock3 size={14} />
          {isCompleted ? 'Da xu ly xong' : 'Cho bep thuc hien'}
        </div>

        {!isCompleted ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(order)}
            loading={isCompleting}
            icon={<CheckCircle2 size={16} />}
          >
            Hoan thanh
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function KdsColumn({ title, description, orders, emptyMessage, children }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '420px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-primary)' }}>{title}</h3>
          <strong style={{ color: 'var(--color-tertiary-container)', fontSize: '14px' }}>
            {orders.length} don
          </strong>
        </div>
        <div style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>{description}</div>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--color-secondary)',
            border: '1px dashed var(--color-outline-variant)',
            borderRadius: 'var(--radius-default)',
            padding: '24px',
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function KDSPage() {
  const hasLoadedOnceRef = useRef(false);
  const [newOrders, setNewOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [completingOrderId, setCompletingOrderId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'completed'

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      if (!hasLoadedOnceRef.current) {
        setIsLoading(true);
        setPageError('');
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await kdsApi.getOrders();

        if (!isCancelled) {
          setNewOrders(response.data.newOrders || []);
          setCompletedOrders(response.data.completedOrders || []);
          setPageError('');
        }
      } catch (loadError) {
        if (!isCancelled) {
          if (isLoading) {
            setNewOrders([]);
            setCompletedOrders([]);
          }

          setPageError(loadError.message || 'Khong tai duoc danh sach don KDS.');
        }
      } finally {
        if (!isCancelled) {
          hasLoadedOnceRef.current = true;
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [reloadNonce]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setReloadNonce((current) => current + 1);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timerId);
  }, []);

  const handleRefresh = () => {
    setReloadNonce((current) => current + 1);
  };

  const handleCompleteOrder = async (order) => {
    if (!order?.id || completingOrderId) {
      return;
    }

    setActionError('');
    setCompletingOrderId(order.id);

    try {
      const response = await kdsApi.completeOrder(order.id);
      const completedOrder = response.data.order;

      setNewOrders((previous) => previous.filter((item) => item.id !== order.id));
      setCompletedOrders((previous) => [
        completedOrder,
        ...previous.filter((item) => item.id !== order.id),
      ]);
      setToastType('success');
      setToastMsg(`Da hoan thanh don #${completedOrder.orderCode}.`);
    } catch (error) {
      setActionError(error.message || 'Khong the chuyen don sang da hoan thanh.');
      setToastType('error');
      setToastMsg(error.message || 'Cap nhat KDS that bai.');
      setReloadNonce((current) => current + 1);
    } finally {
      setCompletingOrderId('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Man hinh KDS"
        description="Theo doi don moi cho bep va danh dau hoan thanh ngay tren he thong staff."
        actions={
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing || Boolean(completingOrderId)}
            icon={<RotateCcw size={16} />}
          >
            {isRefreshing ? 'Dang tai...' : 'Tai lai'}
          </Button>
        }
      />

      {pageError ? <Alert type="error" message={pageError} onClose={() => setPageError('')} /> : null}
      {actionError ? <Alert type="error" message={actionError} onClose={() => setActionError('')} /> : null}

      {/* Tab Navigation */}
      <div
        className="tab-container"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: 'var(--spacing-xs)',
          borderBottom: '1px solid var(--color-surface-container-high)',
          paddingBottom: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('new')}
          className={`btn ${activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ChefHat size={18} />
          Đơn mới chờ làm ({newOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle2 size={18} />
          Đã hoàn thành ({completedOrders.length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--color-secondary)', margin: 0 }}>
            Dang tai man hinh KDS...
          </p>
        </div>
      ) : activeTab === 'new' ? (
        <KdsColumn
          title="Don moi"
          description="Cac don da thanh toan va dang cho bep thuc hien."
          orders={newOrders}
          emptyMessage="Khong co don moi nao dang cho xu ly."
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {newOrders.map((order) => (
              <KdsOrderCard
                key={order.id}
                order={order}
                onComplete={handleCompleteOrder}
                isCompleting={completingOrderId === order.id}
              />
            ))}
          </div>
        </KdsColumn>
      ) : (
        <KdsColumn
          title="Da hoan thanh"
          description="Cac don bep da xu ly xong, sap xep moi nhat len tren."
          orders={completedOrders}
          emptyMessage="Chua co don nao duoc danh dau hoan thanh."
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {completedOrders.map((order) => (
              <KdsOrderCard
                key={order.id}
                order={order}
                onComplete={handleCompleteOrder}
                isCompleting={false}
              />
            ))}
          </div>
        </KdsColumn>
      )}

      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--gradient-accent-soft)',
        }}
      >
        <ChefHat size={20} style={{ color: 'var(--color-primary)' }} />
        <div style={{ color: 'var(--color-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
          KDS tu dong refresh moi 15 giay. Don moi duoc sap theo gio tao tang dan de bep uu tien don den truoc.
        </div>
      </div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default KDSPage;
