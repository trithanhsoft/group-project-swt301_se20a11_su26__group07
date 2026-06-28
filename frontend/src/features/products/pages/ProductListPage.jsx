import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { CompactCode } from '../../../components/common/CompactCode.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { TagBadge } from '../../../components/common/TagBadge.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { PRODUCT_TAG_SUGGESTIONS } from '../../../constants/productTags.js';
import { ROUTES } from '../../../constants/routes.js';
import { formatVND } from '../../../utils/currency.js';

const centeredCellContentStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const numericValueStyle = {
  display: 'inline-block',
  fontWeight: '700',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

function mergeTagOptions(tags, selectedTag) {
  const mergedTags = Array.from(
    new Set([
      ...PRODUCT_TAG_SUGGESTIONS,
      ...(tags || []),
      ...(selectedTag && selectedTag !== 'ALL' ? [selectedTag] : []),
    ]),
  );
  return [
    { value: 'ALL', label: 'Tất cả tag' },
    ...mergedTags.map((tag) => ({ value: tag, label: tag })),
  ];
}

export function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const tagOptions = useMemo(() => mergeTagOptions(availableTags, tagFilter), [availableTags, tagFilter]);

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      const loadProducts = async () => {
        setIsLoading(true);
        setError('');

        try {
          const response = await productApi.getProducts({
            search: searchQuery.trim(),
            status: statusFilter,
            tag: tagFilter,
          });

          if (!isCancelled) {
            setProducts(response.data.products || []);
            setAvailableTags(response.data.tags || []);
          }
        } catch (loadError) {
          if (!isCancelled) {
            setProducts([]);
            setAvailableTags([]);
            setError(loadError.message || 'Không tải được danh sách sản phẩm.');
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      void loadProducts();
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [reloadNonce, searchQuery, statusFilter, tagFilter]);

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await productApi.deleteProduct(deleteId);
      setToastType('success');
      setToastMsg('Xóa sản phẩm thành công.');
      setReloadNonce((current) => current + 1);
    } catch (deleteError) {
      setToastType('error');
      setToastMsg(deleteError.message || 'Xóa sản phẩm thất bại.');
    } finally {
      setDeleteId(null);
    }
  };

  const headers = [
    {
      key: 'id',
      label: 'Mã SP',
      style: { width: '124px', whiteSpace: 'nowrap' },
      render: (row) => <CompactCode value={row.id} prefix="SP" />,
    },
    {
      key: 'name',
      label: 'Tên sản phẩm',
      style: { minWidth: '260px' },
      render: (row) => (
        <strong style={{ color: 'var(--color-primary)', lineHeight: 1.4 }}>{row.name}</strong>
      ),
    },
    {
      key: 'tag',
      label: 'Tag',
      style: { width: '140px', textAlign: 'center', whiteSpace: 'nowrap' },
      render: (row) => (
        <div style={centeredCellContentStyle}>
          <TagBadge label={row.tag} />
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Đơn giá',
      render: (row) => <span style={numericValueStyle}>{formatVND(row.price)}</span>,
      style: { width: '148px', textAlign: 'right', whiteSpace: 'nowrap' },
    },
    {
      key: 'hasRecipe',
      label: 'Công thức',
      render: (row) => (
        <div style={centeredCellContentStyle}>
          <StatusBadge
            status={row.hasRecipe ? 'SUCCESS' : 'ERROR'}
            customLabel={row.hasRecipe ? 'Đã thiết lập' : 'Chưa thiết lập'}
          />
        </div>
      ),
      style: { width: '164px', textAlign: 'center', whiteSpace: 'nowrap' },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <div style={centeredCellContentStyle}>
          <StatusBadge status={row.status} />
        </div>
      ),
      style: { width: '132px', textAlign: 'center', whiteSpace: 'nowrap' },
    },
    {
      key: 'actions',
      label: 'Hành động',
      style: { width: '96px', textAlign: 'right', whiteSpace: 'nowrap' },
      render: (row) => (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/products/${row.id}/edit`)}
            title="Chỉnh sửa"
            style={{ color: 'var(--color-primary)', display: 'flex', padding: 0 }}
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row.id)}
            title="Xóa"
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
        title="Quản lý sản phẩm"
        description="Quản lý danh mục đồ uống và lọc nhanh theo tag như Cà phê, Espresso, Freeze."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setReloadNonce((current) => current + 1)}
              disabled={isLoading}
              icon={<RotateCcw size={16} />}
            >
              Tải lại
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.ADMIN_PRODUCTS_NEW)}
              icon={<Plus size={16} />}
            >
              Thêm sản phẩm
            </Button>
          </>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
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
                { value: 'INACTIVE', label: 'Ngưng hoạt động' },
              ]}
            />
          </div>

          <div style={{ width: '180px' }}>
            <SelectInput value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} options={tagOptions} />
          </div>
        </div>
      </div>

      <DataTable
        headers={headers}
        data={products}
        loading={isLoading}
        emptyMessage="Không tìm thấy sản phẩm nào phù hợp."
        style={{ minWidth: '1040px' }}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách? Thao tác này sẽ ẩn sản phẩm khỏi hệ thống quản lý."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default ProductListPage;
