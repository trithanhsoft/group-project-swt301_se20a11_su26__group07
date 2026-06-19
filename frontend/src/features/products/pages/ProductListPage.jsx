import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { formatVND } from '../../../utils/currency.js';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_PRODUCTS_KEY = 'mini_pos_products';
const DEFAULT_MOCK_PRODUCTS = [
  { id: 1, name: 'Espresso', price: 25000, status: 'ACTIVE', description: 'Cà phê nguyên chất đậm đặc', has_recipe: true },
  { id: 2, name: 'Ca phe sua da', price: 29000, status: 'ACTIVE', description: 'Cà phê sữa đá truyền thống', has_recipe: true },
  { id: 3, name: 'Bac siu', price: 32000, status: 'ACTIVE', description: 'Nhiều sữa ít cà phê', has_recipe: true },
  { id: 4, name: 'Tra dao cam sa', price: 39000, status: 'INACTIVE', description: 'Trà đào cam sả thanh mát', has_recipe: false },
];

export function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Dialog & Toast States
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productApi.getProducts();
      setProducts(res.data || []);
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_PRODUCTS_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts(DEFAULT_MOCK_PRODUCTS);
        localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(DEFAULT_MOCK_PRODUCTS));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, statusFilter]);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/${id}/edit`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      if (isUsingMock) {
        const updated = products.filter(p => p.id !== deleteId);
        setProducts(updated);
        localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(updated));
        showToast('Xóa sản phẩm thành công (Giả lập)');
      } else {
        await productApi.deleteProduct(deleteId);
        showToast('Xóa sản phẩm thành công');
        loadProducts();
      }
    } catch (err) {
      showToast(err.message || 'Xóa sản phẩm thất bại.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const headers = [
    { key: 'id', label: 'Mã SP', style: { width: '80px' } },
    { key: 'name', label: 'Tên sản phẩm', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.name}</strong> },
    { key: 'price', label: 'Đơn giá', render: (row) => formatVND(row.price) },
    { key: 'recipe', label: 'Công thức', render: (row) => <StatusBadge status={row.has_recipe ? 'ĐÃ THIẾT LẬP' : 'CHƯA THIẾT LẬP'} /> },
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
        title="Quản lý sản phẩm"
        description="Quản lý danh mục các đồ uống được kinh doanh tại quầy bán hàng."
        actions={
          <>
            <Button variant="secondary" onClick={loadProducts} disabled={isLoading} icon={<RotateCcw size={16} />}>
              Tải lại
            </Button>
            <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_PRODUCTS_NEW)} icon={<Plus size={16} />}>
              Thêm sản phẩm
            </Button>
          </>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API sản phẩm chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Filters card */}
      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <TextInput
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <SelectInput
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngưng hoạt động' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        headers={headers}
        data={filteredProducts}
        loading={isLoading}
        emptyMessage="Không tìm thấy sản phẩm nào phù hợp."
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách? Thao tác này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}
export default ProductListPage;
