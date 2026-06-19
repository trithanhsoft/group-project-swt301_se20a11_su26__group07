import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, RotateCcw, AlertOctagon } from 'lucide-react';
import { ingredientApi } from '../api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';
const DEFAULT_MOCK_INGREDIENTS = [
  { id: 1, name: 'Hat ca phe Robusta', unit: 'GRAM', current_stock: 5000, low_stock_threshold: 1000, status: 'ACTIVE' },
  { id: 2, name: 'Sua dac Ong Tho', unit: 'ML', current_stock: 800, low_stock_threshold: 1000, status: 'ACTIVE' },
  { id: 3, name: 'Sua tuoi khong duong', unit: 'ML', current_stock: 2000, low_stock_threshold: 500, status: 'ACTIVE' },
  { id: 4, name: 'Siro Dao', unit: 'ML', current_stock: 0, low_stock_threshold: 200, status: 'INACTIVE' },
];

export function IngredientListPage() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadIngredients = async () => {
    setIsLoading(true);
    try {
      const res = await ingredientApi.getIngredients();
      setIngredients(res.data || []);
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_INGREDIENTS_KEY);
      if (stored) {
        setIngredients(JSON.parse(stored));
      } else {
        setIngredients(DEFAULT_MOCK_INGREDIENTS);
        localStorage.setItem(MOCK_INGREDIENTS_KEY, JSON.stringify(DEFAULT_MOCK_INGREDIENTS));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    let result = [...ingredients];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(q));
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'LOW') {
        result = result.filter(item => Number(item.current_stock) <= Number(item.low_stock_threshold));
      } else {
        result = result.filter(item => item.status === statusFilter);
      }
    }

    setFilteredIngredients(result);
  }, [ingredients, searchQuery, statusFilter]);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleEdit = (id) => {
    navigate(`/admin/ingredients/${id}/edit`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      if (isUsingMock) {
        const updated = ingredients.filter(item => item.id !== deleteId);
        setIngredients(updated);
        localStorage.setItem(MOCK_INGREDIENTS_KEY, JSON.stringify(updated));
        showToast('Xóa nguyên liệu thành công (Giả lập)');
      } else {
        await ingredientApi.deleteIngredient(deleteId);
        showToast('Xóa nguyên liệu thành công');
        loadIngredients();
      }
    } catch (err) {
      showToast(err.message || 'Xóa nguyên liệu thất bại.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const headers = [
    { key: 'id', label: 'Mã NL', style: { width: '80px' } },
    { key: 'name', label: 'Tên nguyên liệu', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.name}</strong> },
    { key: 'unit', label: 'Đơn vị tính' },
    {
      key: 'current_stock',
      label: 'Tồn kho hiện tại',
      render: (row) => {
        const isLow = Number(row.current_stock) <= Number(row.low_stock_threshold);
        return (
          <span style={{
            color: isLow ? 'var(--color-error)' : 'var(--color-on-background)',
            fontWeight: isLow ? 'bold' : 'normal',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {row.current_stock}
            {isLow && <AlertOctagon size={14} title="Dưới định mức tối thiểu!" />}
          </span>
        );
      }
    },
    { key: 'low_stock_threshold', label: 'Định mức tối thiểu' },
    { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Hành động',
      style: { width: '120px', textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => handleEdit(row.id)} title="Chỉnh sửa" style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}>
            <Edit size={16} />
          </button>
          <button type="button" onClick={() => handleDeleteClick(row.id)} title="Xóa" style={{ color: 'var(--color-error)', display: 'flex', padding: 0 }}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý nguyên liệu"
        description="Quản lý nguyên vật liệu pha chế, thiết lập định mức tồn kho an toàn."
        actions={
          <>
            <Button variant="secondary" onClick={loadIngredients} disabled={isLoading} icon={<RotateCcw size={16} />}>
              Tải lại
            </Button>
            <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_INGREDIENTS_NEW)} icon={<Plus size={16} />}>
              Thêm nguyên liệu
            </Button>
          </>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API nguyên liệu chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Filters card */}
      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <TextInput
              placeholder="Tìm kiếm nguyên liệu theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <SelectInput
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                { value: 'LOW', label: 'Hàng sắp hết (Dưới định mức)' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        headers={headers}
        data={filteredIngredients}
        loading={isLoading}
        emptyMessage="Không tìm thấy nguyên liệu nào phù hợp."
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xóa nguyên liệu"
        message="Bạn có chắc chắn muốn xóa nguyên liệu này? Các công thức tham chiếu đến nguyên liệu này có thể bị ảnh hưởng."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}
export default IngredientListPage;
