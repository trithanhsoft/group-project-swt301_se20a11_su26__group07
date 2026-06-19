import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import { recipeApi } from '../api/recipeApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { formatVND } from '../../../utils/currency.js';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_RECIPES_KEY = 'mini_pos_recipes';
const DEFAULT_MOCK_RECIPES = [
  { id: 1, product_id: 1, product_name: 'Espresso', price: 25000, items: [{ ingredient_id: 1, name: 'Hat ca phe Robusta', quantity: 20, unit: 'GRAM' }] },
  { id: 2, product_id: 2, product_name: 'Ca phe sua da', price: 29000, items: [{ ingredient_id: 1, name: 'Hat ca phe Robusta', quantity: 20, unit: 'GRAM' }, { ingredient_id: 2, name: 'Sua dac Ong Tho', quantity: 40, unit: 'ML' }] },
  { id: 3, product_id: 3, product_name: 'Bac siu', price: 32000, items: [{ ingredient_id: 1, name: 'Hat ca phe Robusta', quantity: 10, unit: 'GRAM' }, { ingredient_id: 2, name: 'Sua dac Ong Tho', quantity: 60, unit: 'ML' }, { ingredient_id: 3, name: 'Sua tuoi khong duong', quantity: 80, unit: 'ML' }] },
];

export function RecipeListPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const res = await recipeApi.getRecipes();
      setRecipes(res.data || []);
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_RECIPES_KEY);
      if (stored) {
        setRecipes(JSON.parse(stored));
      } else {
        setRecipes(DEFAULT_MOCK_RECIPES);
        localStorage.setItem(MOCK_RECIPES_KEY, JSON.stringify(DEFAULT_MOCK_RECIPES));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleEdit = (id) => {
    navigate(`/admin/recipes/${id}/edit`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      if (isUsingMock) {
        const updated = recipes.filter(r => r.id !== deleteId);
        setRecipes(updated);
        localStorage.setItem(MOCK_RECIPES_KEY, JSON.stringify(updated));
        
        const storedProducts = localStorage.getItem('mini_pos_products');
        if (storedProducts) {
          const products = JSON.parse(storedProducts);
          const foundRecipe = recipes.find(r => r.id === deleteId);
          if (foundRecipe) {
            const updatedProducts = products.map(p => 
              p.id === foundRecipe.product_id ? { ...p, has_recipe: false } : p
            );
            localStorage.setItem('mini_pos_products', JSON.stringify(updatedProducts));
          }
        }

        showToast('Xóa công thức thành công (Giả lập)');
      } else {
        await recipeApi.deleteRecipe(deleteId);
        showToast('Xóa công thức thành công');
        loadRecipes();
      }
    } catch (err) {
      showToast(err.message || 'Xóa công thức thất bại.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const headers = [
    { key: 'id', label: 'Mã CT', style: { width: '80px' } },
    { key: 'product_name', label: 'Sản phẩm áp dụng', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.product_name || row.product?.name}</strong> },
    { key: 'price', label: 'Đơn giá bán', render: (row) => formatVND(row.price || row.product?.price || 0) },
    {
      key: 'ingredients',
      label: 'Nguyên liệu thành phần',
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(row.items || row.recipe_items || []).map((item, idx) => (
            <span key={idx} style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-container-low)',
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-outline-variant)'
            }}>
              {item.name || item.ingredient?.name}: {item.quantity} {item.unit || item.ingredient?.unit}
            </span>
          ))}
        </div>
      )
    },
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
        title="Quản lý công thức"
        description="Định mức chi tiết thành phần nguyên vật liệu pha chế cho từng sản phẩm đồ uống."
        actions={
          <>
            <Button variant="secondary" onClick={loadRecipes} disabled={isLoading} icon={<RotateCcw size={16} />}>
              Tải lại
            </Button>
            <Button variant="primary" onClick={() => navigate(ROUTES.ADMIN_RECIPES_NEW)} icon={<Plus size={16} />}>
              Thiết lập công thức
            </Button>
          </>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API công thức pha chế chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Table */}
      <DataTable
        headers={headers}
        data={recipes}
        loading={isLoading}
        emptyMessage="Chưa có công thức sản phẩm nào được thiết lập."
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xóa công thức"
        message="Bạn có chắc muốn xóa công thức pha chế của sản phẩm này? Sản phẩm này sẽ không thể bán tại quầy POS nếu chưa có công thức mới."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}
export default RecipeListPage;
