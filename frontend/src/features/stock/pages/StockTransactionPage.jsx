import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { stockApi } from '../api/stockApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatDateTime } from '../../../utils/date.js';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_TRANSACTIONS_KEY = 'mini_pos_transactions';
const DEFAULT_MOCK_TRANSACTIONS = [
  { id: 1, ingredient_name: 'Hat ca phe Robusta', type: 'IMPORT', quantity: 5000, before_stock: 0, after_stock: 5000, created_by: 'admin', date: '2026-06-19T08:00:00Z' },
  { id: 2, ingredient_name: 'Sua dac Ong Tho', type: 'IMPORT', quantity: 1000, before_stock: 0, after_stock: 1000, created_by: 'admin', date: '2026-06-19T08:05:00Z' },
  { id: 3, ingredient_name: 'Sua dac Ong Tho', type: 'ADJUST', quantity: -200, before_stock: 1000, after_stock: 800, created_by: 'admin', date: '2026-06-19T09:00:00Z' },
];

export function StockTransactionPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await stockApi.getTransactions();
      setTransactions(res.data || []);
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_TRANSACTIONS_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        setTransactions(DEFAULT_MOCK_TRANSACTIONS);
        localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(DEFAULT_MOCK_TRANSACTIONS));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const headers = [
    { key: 'id', label: 'Mã GD', style: { width: '80px' } },
    { key: 'ingredient_name', label: 'Tên nguyên liệu', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.ingredient_name || row.ingredient?.name}</strong> },
    {
      key: 'type',
      label: 'Loại giao dịch',
      render: (row) => {
        const type = String(row.type).toUpperCase();
        if (type === 'IMPORT') return <StatusBadge status="SUCCESS" customLabel="Nhập hàng" />;
        if (type === 'ADJUST') return <StatusBadge status="WARNING" customLabel="Điều chỉnh" />;
        return <StatusBadge status="INFO" customLabel="Khấu trừ đơn" />;
      }
    },
    {
      key: 'quantity',
      label: 'Số lượng thay đổi',
      render: (row) => {
        const qty = Number(row.quantity);
        const isPos = qty > 0;
        return (
          <span style={{ color: isPos ? 'var(--color-tertiary-container)' : 'var(--color-error)', fontWeight: 'bold' }}>
            {isPos ? `+${qty}` : qty}
          </span>
        );
      }
    },
    { key: 'before_stock', label: 'Tồn trước' },
    { key: 'after_stock', label: 'Tồn sau' },
    { key: 'created_by', label: 'Người thực hiện', render: (row) => row.created_by || row.user?.username || 'Hệ thống' },
    { key: 'date', label: 'Ngày thực hiện', render: (row) => formatDateTime(row.date || row.created_at) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Lịch sử giao dịch kho"
        description="Tra cứu vết điều chỉnh, nhập hàng hoặc khấu trừ nguyên liệu bán hàng."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_STOCK)} icon={<ArrowLeft size={16} />}>
              Quay lại Nhập/Điều chỉnh
            </Button>
            <Button variant="secondary" onClick={loadTransactions} disabled={isLoading} icon={<RotateCcw size={16} />}>
              Tải lại
            </Button>
          </>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API lịch sử giao dịch chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Transactions Table */}
      <DataTable
        headers={headers}
        data={[...transactions].reverse()}
        loading={isLoading}
        emptyMessage="Chưa có giao dịch kho nào được thực hiện."
      />
    </div>
  );
}
export default StockTransactionPage;
