import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { stockApi } from '../api/stockApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { CompactCode } from '../../../components/common/CompactCode.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatDateTime } from '../../../utils/date.js';
import { ROUTES } from '../../../constants/routes.js';
import { STOCK_TRANSACTION_TYPES } from '../../../constants/stockTransactionTypes.js';

function getTransactionBadge(row) {
  if (row.type === STOCK_TRANSACTION_TYPES.ORDER_DEDUCT) {
    return {
      status: 'ERROR',
      label: 'Khấu trừ đơn',
    };
  }

  if (row.context === 'DAILY_COUNT') {
    return {
      status: 'WARNING',
      label: 'Kiểm kê ngày',
    };
  }

  if (row.type === STOCK_TRANSACTION_TYPES.IMPORT) {
    return {
      status: 'SUCCESS',
      label: 'Nhập kho',
    };
  }

  return {
    status: 'WARNING',
    label: 'Điều chỉnh',
  };
}

function formatStockDelta(value) {
  const numericValue = Number(value || 0);
  return `${numericValue > 0 ? '+' : ''}${numericValue}`;
}

export function StockTransactionPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await stockApi.getTransactions();
      setTransactions(response.data.transactions || []);
    } catch (loadError) {
      setTransactions([]);
      setError(loadError.message || 'Không tải được lịch sử giao dịch kho.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const headers = [
    {
      key: 'ingredientCode',
      label: 'Mã NL',
      style: { width: '120px', whiteSpace: 'nowrap' },
      render: (row) => <CompactCode value={row.ingredientId} prefix="NL" />,
    },
    {
      key: 'ingredientName',
      label: 'Nguyên liệu',
      style: { minWidth: '220px' },
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.ingredientName}</strong>,
    },
    {
      key: 'context',
      label: 'Nguồn',
      style: { width: '150px', textAlign: 'center', whiteSpace: 'nowrap' },
      render: (row) => {
        const badge = getTransactionBadge(row);
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StatusBadge status={badge.status} customLabel={badge.label} />
          </div>
        );
      },
    },
    {
      key: 'sessionCode',
      label: 'Phiên',
      style: { width: '170px', whiteSpace: 'nowrap' },
      render: (row) => row.sessionCode || '-',
    },
    {
      key: 'quantity',
      label: 'Biến động',
      style: { width: '120px', textAlign: 'right', whiteSpace: 'nowrap' },
      render: (row) => (
        <span
          style={{
            color: row.quantity >= 0 ? 'var(--color-tertiary-container)' : 'var(--color-error)',
            fontWeight: '700',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatStockDelta(row.quantity)}
        </span>
      ),
    },
    {
      key: 'beforeStock',
      label: 'Tồn trước',
      style: { width: '110px', textAlign: 'right', whiteSpace: 'nowrap' },
      render: (row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.beforeStock}</span>
      ),
    },
    {
      key: 'afterStock',
      label: 'Tồn sau',
      style: { width: '110px', textAlign: 'right', whiteSpace: 'nowrap' },
      render: (row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.afterStock}</span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Người thực hiện',
      style: { width: '140px', whiteSpace: 'nowrap' },
      render: (row) => row.createdBy || 'Hệ thống',
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      style: { width: '150px', whiteSpace: 'nowrap' },
      render: (row) => formatDateTime(row.createdAt) || '-',
    },
    {
      key: 'note',
      label: 'Ghi chú',
      style: { minWidth: '220px' },
      render: (row) => row.note || '-',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Lịch sử giao dịch kho"
        description="Theo dõi toàn bộ các lần nhập kho, kiểm kê ngày và khấu trừ tồn nguyên liệu."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.ADMIN_STOCK)}
              icon={<ArrowLeft size={16} />}
            >
              Quay lại quản lý kho
            </Button>
            <Button
              variant="secondary"
              onClick={loadTransactions}
              disabled={isLoading}
              icon={<RotateCcw size={16} />}
            >
              Tải lại
            </Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <DataTable
        headers={headers}
        data={transactions}
        loading={isLoading}
        emptyMessage="Chưa có giao dịch kho nào được ghi nhận."
        style={{ minWidth: '1400px' }}
      />
    </div>
  );
}

export default StockTransactionPage;
