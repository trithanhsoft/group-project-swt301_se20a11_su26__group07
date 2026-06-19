import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ingredientApi } from '../api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { NumberInput } from '../../../components/forms/NumberInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { validateTextInput, validateNonNegativeNumber } from '../../../utils/validators.js';
import { ROUTES } from '../../../constants/routes.js';
import { UNITS } from '../../../constants/units.js';

const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';

export function IngredientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({ name: '', unit: 'GRAM', current_stock: '0', low_stock_threshold: '0', status: 'ACTIVE', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkApiAndLoad = async () => {
      setIsLoading(true);
      try {
        await ingredientApi.getIngredients();
        setIsUsingMock(false);
        if (isEditMode) {
          const res = await ingredientApi.getIngredient(id);
          setForm({
            name: res.data.name,
            unit: res.data.unit,
            current_stock: String(res.data.current_stock),
            low_stock_threshold: String(res.data.low_stock_threshold),
            status: res.data.status,
            notes: res.data.notes || ''
          });
        }
      } catch (err) {
        setIsUsingMock(true);
        const stored = localStorage.getItem(MOCK_INGREDIENTS_KEY);
        if (stored && isEditMode) {
          const list = JSON.parse(stored);
          const found = list.find(item => String(item.id) === String(id));
          if (found) {
            setForm({
              name: found.name,
              unit: found.unit,
              current_stock: String(found.current_stock),
              low_stock_threshold: String(found.low_stock_threshold),
              status: found.status,
              notes: found.notes || ''
            });
          } else {
            setSubmitError('Không tìm thấy nguyên liệu cần sửa trong bộ nhớ giả lập.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkApiAndLoad();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleValidation = () => {
    const nameErr = validateTextInput(form.name, 'Tên nguyên liệu', 63);
    const stockErr = validateNonNegativeNumber(form.current_stock, 'Tồn kho hiện tại');
    const thresholdErr = validateNonNegativeNumber(form.low_stock_threshold, 'Định mức tối thiểu');

    if (nameErr || stockErr || thresholdErr) {
      setErrors({
        name: nameErr,
        current_stock: stockErr,
        low_stock_threshold: thresholdErr
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!handleValidation()) return;

    setIsSubmitting(true);
    const ingredientData = {
      name: form.name.trim(),
      unit: form.unit,
      current_stock: Number(form.current_stock),
      low_stock_threshold: Number(form.low_stock_threshold),
      status: form.status,
      notes: form.notes.trim()
    };

    try {
      if (isUsingMock) {
        const stored = localStorage.getItem(MOCK_INGREDIENTS_KEY);
        let list = stored ? JSON.parse(stored) : [];
        if (isEditMode) {
          list = list.map(item => String(item.id) === String(id) ? { ...item, ...ingredientData } : item);
          setToastMsg('Cập nhật nguyên liệu thành công (Giả lập)');
        } else {
          const newId = list.length > 0 ? Math.max(...list.map(item => item.id)) + 1 : 1;
          list.push({ id: newId, ...ingredientData });
          setToastMsg('Thêm nguyên liệu thành công (Giả lập)');
        }
        localStorage.setItem(MOCK_INGREDIENTS_KEY, JSON.stringify(list));
        setTimeout(() => navigate(ROUTES.ADMIN_INGREDIENTS), 1000);
      } else {
        if (isEditMode) {
          await ingredientApi.updateIngredient(id, ingredientData);
          setToastMsg('Cập nhật nguyên liệu thành công');
        } else {
          await ingredientApi.createIngredient(ingredientData);
          setToastMsg('Thêm nguyên liệu thành công');
        }
        setTimeout(() => navigate(ROUTES.ADMIN_INGREDIENTS), 1000);
      }
    } catch (err) {
      setSubmitError(err.message || 'Lưu thông tin nguyên liệu thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title={isEditMode ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        description={isEditMode ? 'Cập nhật lại thông tin định lượng nguyên liệu.' : 'Đăng ký nguyên vật liệu pha chế mới.'}
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_INGREDIENTS)} icon={<ArrowLeft size={16} />}>
            Quay lại danh sách
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API nguyên liệu chưa hoàn tất kết nối CSDL."
        />
      )}

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải thông tin nguyên liệu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextInput
              label="Tên nguyên liệu"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Ví dụ: Hat ca phe Robusta, Sua dac Ong Tho..."
              maxLength={63}
              required
              disabled={isSubmitting}
            />

            <SelectInput
              label="Đơn vị tính"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              options={[
                { value: UNITS.GRAM, label: 'Gram (g)' },
                { value: UNITS.ML, label: 'Mililít (ml)' },
                { value: UNITS.PIECE, label: 'Cái / Quả (Chai, Hộp...)' }
              ]}
              disabled={isSubmitting}
            />

            <NumberInput
              label="Số lượng tồn kho hiện tại"
              name="current_stock"
              value={form.current_stock}
              onChange={handleChange}
              error={errors.current_stock}
              placeholder="Nhập số lượng thực tế hiện có"
              required
              disabled={isSubmitting}
            />

            <NumberInput
              label="Định mức tồn kho tối thiểu"
              name="low_stock_threshold"
              value={form.low_stock_threshold}
              onChange={handleChange}
              error={errors.low_stock_threshold}
              placeholder="Nhập ngưỡng để kích hoạt cảnh báo sắp hết hàng"
              required
              disabled={isSubmitting}
            />

            <SelectInput
              label="Trạng thái"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'ACTIVE', label: 'Đang áp dụng' },
                { value: 'INACTIVE', label: 'Ngưng sử dụng' }
              ]}
              disabled={isSubmitting}
            />

            <TextareaInput
              label="Ghi chú thêm"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Nhập nhà cung cấp hoặc lưu ý pha chế..."
              maxLength={255}
              disabled={isSubmitting}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_INGREDIENTS)} disabled={isSubmitting}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} icon={<Save size={16} />}>
                Lưu lại
              </Button>
            </div>
          </form>
        )}
      </div>

      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
    </div>
  );
}
export default IngredientFormPage;
