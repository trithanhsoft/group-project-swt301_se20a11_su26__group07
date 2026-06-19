import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { NumberInput } from '../../../components/forms/NumberInput.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { validateTextInput, validatePositiveNumber } from '../../../utils/validators.js';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_PRODUCTS_KEY = 'mini_pos_products';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({ name: '', price: '', status: 'ACTIVE', description: '' });
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
        await productApi.getProducts();
        setIsUsingMock(false);
        if (isEditMode) {
          const res = await productApi.getProduct(id);
          setForm({
            name: res.data.name,
            price: String(res.data.price),
            status: res.data.status,
            description: res.data.description || ''
          });
        }
      } catch (err) {
        setIsUsingMock(true);
        const stored = localStorage.getItem(MOCK_PRODUCTS_KEY);
        if (stored && isEditMode) {
          const list = JSON.parse(stored);
          const found = list.find(p => String(p.id) === String(id));
          if (found) {
            setForm({
              name: found.name,
              price: String(found.price),
              status: found.status,
              description: found.description || ''
            });
          } else {
            setSubmitError('Không tìm thấy sản phẩm cần sửa trong bộ nhớ giả lập.');
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
    const nameErr = validateTextInput(form.name, 'Tên sản phẩm', 63);
    const priceErr = validatePositiveNumber(form.price, 'Đơn giá');

    if (nameErr || priceErr) {
      setErrors({
        name: nameErr,
        price: priceErr
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
    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      status: form.status,
      description: form.description.trim()
    };

    try {
      if (isUsingMock) {
        const stored = localStorage.getItem(MOCK_PRODUCTS_KEY);
        let list = stored ? JSON.parse(stored) : [];
        if (isEditMode) {
          list = list.map(p => String(p.id) === String(id) ? { ...p, ...productData } : p);
          setToastMsg('Cập nhật sản phẩm thành công (Giả lập)');
        } else {
          const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
          list.push({ id: newId, ...productData, has_recipe: false });
          setToastMsg('Thêm sản phẩm thành công (Giả lập)');
        }
        localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(list));
        setTimeout(() => navigate(ROUTES.ADMIN_PRODUCTS), 1000);
      } else {
        if (isEditMode) {
          await productApi.updateProduct(id, productData);
          setToastMsg('Cập nhật sản phẩm thành công');
        } else {
          await productApi.createProduct(productData);
          setToastMsg('Thêm sản phẩm thành công');
        }
        setTimeout(() => navigate(ROUTES.ADMIN_PRODUCTS), 1000);
      }
    } catch (err) {
      setSubmitError(err.message || 'Lưu thông tin sản phẩm thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        description={isEditMode ? 'Cập nhật lại thông tin của sản phẩm đồ uống.' : 'Tạo mới sản phẩm đồ uống vào thực đơn.'}
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)} icon={<ArrowLeft size={16} />}>
            Quay lại danh sách
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API sản phẩm chưa hoàn tất kết nối CSDL."
        />
      )}

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải thông tin sản phẩm...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextInput
              label="Tên sản phẩm"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Ví dụ: Ca phe den da, Tra dao cam sa..."
              maxLength={63}
              required
              disabled={isSubmitting}
            />

            <NumberInput
              label="Đơn giá (VND)"
              name="price"
              value={form.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="Nhập giá bán (ví dụ: 25000)"
              allowDecimals={false}
              required
              disabled={isSubmitting}
            />

            <SelectInput
              label="Trạng thái kinh doanh"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động (Được bán trên POS)' },
                { value: 'INACTIVE', label: 'Ngưng hoạt động' }
              ]}
              disabled={isSubmitting}
            />

            <TextareaInput
              label="Mô tả sản phẩm"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Nhập mô tả ngắn về thành phần hoặc hương vị..."
              maxLength={255}
              disabled={isSubmitting}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)} disabled={isSubmitting}>
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
export default ProductFormPage;
