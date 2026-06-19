import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, PackageCheck, History } from 'lucide-react';
import { stockApi } from '../api/stockApi.js';
import { ingredientApi } from '../../ingredients/api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { NumberInput } from '../../../components/forms/NumberInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { validatePositiveNumber } from '../../../utils/validators.js';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';
const MOCK_TRANSACTIONS_KEY = 'mini_pos_transactions';

const DEFAULT_MOCK_TRANSACTIONS = [
  { id: 1, ingredient_name: 'Hat ca phe Robusta', type: 'IMPORT', quantity: 5000, before_stock: 0, after_stock: 5000, created_by: 'admin', date: '2026-06-19T08:00:00Z' },
  { id: 2, ingredient_name: 'Sua dac Ong Tho', type: 'IMPORT', quantity: 1000, before_stock: 0, after_stock: 1000, created_by: 'admin', date: '2026-06-19T08:05:00Z' },
  { id: 3, ingredient_name: 'Sua dac Ong Tho', type: 'ADJUST', quantity: -200, before_stock: 1000, after_stock: 800, created_by: 'admin', date: '2026-06-19T09:00:00Z' },
];

export function StockPage() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({ ingredient_id: '', type: 'IMPORT', quantity: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadIngredients = async () => {
    setIsLoading(true);
    try {
      const res = await ingredientApi.getIngredients();
      setIngredients((res.data || []).filter(item => item.status === 'ACTIVE'));
      setIsUsingMock(false);
    } catch (err) {
      const stored = localStorage.getItem(MOCK_INGREDIENTS_KEY);
      if (stored) {
        setIngredients(JSON.parse(stored).filter(item => item.status === 'ACTIVE'));
      }
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleValidation = () => {
    let isValid = true;
    const newErrors = {};

    if (!form.ingredient_id) {
      newErrors.ingredient_id = 'Vui lòng chọn một nguyên liệu.';
      isValid = false;
    }

    const qtyErr = validatePositiveNumber(form.quantity, 'Số lượng giao dịch');
    if (qtyErr) {
      newErrors.quantity = qtyErr;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!handleValidation()) return;

    setIsSubmitting(true);
    const selectedIng = ingredients.find(item => String(item.id) === String(form.ingredient_id));
    const qty = Number(form.quantity);
    const type = form.type;
    const stockChange = type === 'IMPORT' ? qty : -qty;

    try {
      if (isUsingMock) {
        const storedIng = localStorage.getItem(MOCK_INGREDIENTS_KEY);
        let listIng = storedIng ? JSON.parse(storedIng) : [];
        let beforeStock = 0;
        let afterStock = 0;

        // Check stock levels
        const foundItem = listIng.find(item => String(item.id) === String(form.ingredient_id));
        if (foundItem) {
          beforeStock = foundItem.current_stock;
          afterStock = beforeStock + stockChange;
          if (afterStock < 0) {
            throw new Error(`Số lượng tồn kho của ${foundItem.name} không thể âm sau khi điều chỉnh (Hiện tại: ${beforeStock}).`);
          }
        }

        listIng = listIng.map(item => {
          if (String(item.id) === String(form.ingredient_id)) {
            return { ...item, current_stock: afterStock };
          }
          return item;
        });

        const storedTx = localStorage.getItem(MOCK_TRANSACTIONS_KEY);
        let listTx = storedTx ? JSON.parse(storedTx) : DEFAULT_MOCK_TRANSACTIONS;
        const newId = listTx.length > 0 ? Math.max(...listTx.map(t => t.id)) + 1 : 1;
        
        listTx.push({
          id: newId,
          ingredient_name: selectedIng.name,
          type,
          quantity: stockChange,
          before_stock: beforeStock,
          after_stock: afterStock,
          created_by: 'admin',
          date: new Date().toISOString()
        });

        localStorage.setItem(MOCK_INGREDIENTS_KEY, JSON.stringify(listIng));
        localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(listTx));

        setToastMsg(`${type === 'IMPORT' ? 'Nhập kho' : 'Điều chỉnh'} thành công (Giả lập)`);
        setForm({ ingredient_id: '', type: 'IMPORT', quantity: '', notes: '' });
      } else {
        const payload = {
          ingredientId: Number(form.ingredient_id),
          quantity: qty,
          notes: form.notes.trim()
        };

        if (type === 'IMPORT') {
          await stockApi.importStock(payload);
        } else {
          await stockApi.adjustStock(payload);
        }

        setToastMsg(`${type === 'IMPORT' ? 'Nhập kho' : 'Điều chỉnh'} thành công`);
        setForm({ ingredient_id: '', type: 'IMPORT', quantity: '', notes: '' });
      }
      loadIngredients();
    } catch (err) {
      setSubmitError(err.message || 'Lưu thông tin giao dịch thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ingredientOptions = ingredients.map(item => ({
    value: item.id,
    label: `${item.name} (Tồn: ${item.current_stock} ${item.unit})`
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý giao dịch kho"
        description="Thực hiện nhập thêm nguyên vật liệu hoặc điều chỉnh hao hụt thực tế."
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_STOCK_TRANSACTIONS)} icon={<History size={16} />}>
            Xem lịch sử giao dịch
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API giao dịch kho chưa hoàn tất kết nối CSDL."
        />
      )}

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải danh sách nguyên liệu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <SelectInput
              label="Chọn nguyên liệu cần cập nhật"
              name="ingredient_id"
              value={form.ingredient_id}
              onChange={handleChange}
              error={errors.ingredient_id}
              options={ingredientOptions}
              placeholder="-- Chọn nguyên liệu active --"
              required
              disabled={isSubmitting}
            />

            <SelectInput
              label="Loại giao dịch kho"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={[
                { value: 'IMPORT', label: 'Nhập hàng thêm (+ Số lượng)' },
                { value: 'ADJUST', label: 'Điều chỉnh hao hụt (- Số lượng)' }
              ]}
              disabled={isSubmitting}
            />

            <NumberInput
              label="Số lượng nhập / giảm"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
              placeholder="Nhập số lượng thực tế cần tác động"
              required
              disabled={isSubmitting}
            />

            <TextareaInput
              label="Lý do / Ghi chú giao dịch"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Ví dụ: Nhập hàng từ NCC A, hao hụt nguyên liệu hỏng..."
              maxLength={255}
              disabled={isSubmitting}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="submit" variant="primary" loading={isSubmitting} icon={<PackageCheck size={16} />}>
                Xác nhận giao dịch
              </Button>
            </div>
          </form>
        )}
      </div>

      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
    </div>
  );
}
export default StockPage;
