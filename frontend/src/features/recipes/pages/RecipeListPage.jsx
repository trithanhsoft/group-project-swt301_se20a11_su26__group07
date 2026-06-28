import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { recipeApi } from '../api/recipeApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { formatVND } from '../../../utils/currency.js';

export function RecipeListPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      const loadRecipes = async () => {
        setIsLoading(true);
        setError('');

        try {
          const response = await recipeApi.getRecipes({
            search: searchQuery.trim(),
          });

          if (!isCancelled) {
            setRecipes(response.data.recipes || []);
          }
        } catch (loadError) {
          if (!isCancelled) {
            setRecipes([]);
            setError(loadError.message || 'Khong tai duoc danh sach cong thuc.');
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      void loadRecipes();
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [reloadNonce, searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await recipeApi.deleteRecipe(deleteId);
      setToastType('success');
      setToastMsg('Xoa cong thuc thanh cong.');
      setReloadNonce((current) => current + 1);
    } catch (deleteError) {
      setToastType('error');
      setToastMsg(deleteError.message || 'Xoa cong thuc that bai.');
    } finally {
      setDeleteId(null);
    }
  };

  const headers = [
    { key: 'id', label: 'Ma CT', style: { width: '90px' } },
    {
      key: 'productName',
      label: 'San pham ap dung',
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.productName}</strong>,
    },
    {
      key: 'productPrice',
      label: 'Don gia ban',
      style: { width: '140px' },
      render: (row) => formatVND(row.productPrice),
    },
    {
      key: 'productStatus',
      label: 'Trang thai SP',
      style: { width: '150px' },
      render: (row) => <StatusBadge status={row.productStatus} />,
    },
    {
      key: 'items',
      label: 'Nguyen lieu thanh phan',
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {row.items.map((item) => (
            <span
              key={`${row.id}-${item.ingredientId}`}
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-container-low)',
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              {item.ingredientName}: {item.quantity} {item.unit}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Hanh dong',
      style: { width: '120px', textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/recipes/${row.id}/edit`)}
            title="Chinh sua"
            style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row.id)}
            title="Xoa"
            style={{ color: 'var(--color-error)', display: 'flex', padding: 0 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quan ly cong thuc"
        description="Thiet lap dinh muc nguyen lieu cho tung san pham de chuan bi cho POS va tru kho."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setReloadNonce((current) => current + 1)}
              disabled={isLoading}
              icon={<RotateCcw size={16} />}
            >
              Tai lai
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.ADMIN_RECIPES_NEW)}
              icon={<Plus size={16} />}
            >
              Them cong thuc
            </Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <TextInput
          placeholder="Tim kiem cong thuc theo ten san pham..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <DataTable
        headers={headers}
        data={recipes}
        loading={isLoading}
        emptyMessage="Khong tim thay cong thuc nao phu hop."
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xoa cong thuc"
        message="Ban co chac chan muon xoa cong thuc nay? San pham se khong san sang cho POS cho den khi duoc thiet lap lai."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default RecipeListPage;
