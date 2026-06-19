import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';
import { recipeApi } from '../api/recipeApi.js';
import { productApi } from '../../products/api/productApi.js';
import { ingredientApi } from '../../ingredients/api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { SelectInput } from '../../../components/forms/SelectInput.jsx';
import { NumberInput } from '../../../components/forms/NumberInput.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { ROUTES } from '../../../constants/routes.js';

const MOCK_RECIPES_KEY = 'mini_pos_recipes';
const MOCK_PRODUCTS_KEY = 'mini_pos_products';
const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';

export function RecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [productId, setProductId] = useState('');
  const [recipeItems, setRecipeItems] = useState([{ ingredient_id: '', quantity: '' }]);
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkApiAndLoad = async () => {
      setIsLoading(true);
      try {
        const [prodRes, ingRes, recsRes] = await Promise.all([
          productApi.getProducts(),
          ingredientApi.getIngredients(),
          recipeApi.getRecipes()
        ]);
        
        setIsUsingMock(false);
        setIngredients(ingRes.data.filter(i => i.status === 'ACTIVE'));
        
        const productsWithRecipe = recsRes.data.map(r => r.product_id);
        const filteredProds = prodRes.data.filter(p => 
          p.status === 'ACTIVE' && (!productsWithRecipe.includes(p.id) || (isEditMode && String(p.id) === String(productId)))
        );
        setProducts(filteredProds);

        if (isEditMode) {
          const recRes = await recipeApi.getRecipe(id);
          setProductId(String(recRes.data.product_id));
          setRecipeItems(recRes.data.items.map(item => ({
            ingredient_id: String(item.ingredient_id),
            quantity: String(item.quantity)
          })));
        }
      } catch (err) {
        setIsUsingMock(true);
        const storedIng = localStorage.getItem(MOCK_INGREDIENTS_KEY);
        const storedProd = localStorage.getItem(MOCK_PRODUCTS_KEY);
        const storedRec = localStorage.getItem(MOCK_RECIPES_KEY);

        const loadedIngs = storedIng ? JSON.parse(storedIng) : [];
        setIngredients(loadedIngs.filter(i => i.status === 'ACTIVE'));

        const loadedProds = storedProd ? JSON.parse(storedProd) : [];
        const loadedRecs = storedRec ? JSON.parse(storedRec) : [];

        const productsWithRecipe = loadedRecs.map(r => r.product_id);

        if (isEditMode) {
          const foundRec = loadedRecs.find(r => String(r.id) === String(id));
          if (foundRec) {
            setProductId(String(foundRec.product_id));
            setRecipeItems(foundRec.items.map(item => ({
              ingredient_id: String(item.ingredient_id),
              quantity: String(item.quantity)
            })));
            setProducts(loadedProds.filter(p => p.status === 'ACTIVE'));
          } else {
            setSubmitError('Không tìm thấy công thức pha chế cần sửa trong bộ nhớ giả lập.');
          }
        } else {
          setProducts(loadedProds.filter(p => p.status === 'ACTIVE' && !productsWithRecipe.includes(p.id)));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkApiAndLoad();
  }, [id, isEditMode]);

  const handleAddRow = () => {
    setRecipeItems(prev => [...prev, { ingredient_id: '', quantity: '' }]);
  };

  const handleRemoveRow = (index) => {
    setRecipeItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index, field, value) => {
    setRecipeItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    ));
    setSubmitError('');
  };

  const handleValidation = () => {
    if (!productId) {
      setSubmitError('Vui lòng chọn sản phẩm áp dụng.');
      return false;
    }

    if (recipeItems.length === 0) {
      setSubmitError('Công thức phải có ít nhất 1 nguyên liệu thành phần.');
      return false;
    }

    const selectedIngs = [];
    for (let i = 0; i < recipeItems.length; i++) {
      const item = recipeItems[i];
      if (!item.ingredient_id) {
        setSubmitError(`Dòng thứ ${i + 1}: Vui lòng chọn nguyên liệu.`);
        return false;
      }
      
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        setSubmitError(`Dòng thứ ${i + 1}: Số lượng nguyên liệu phải lớn hơn 0.`);
        return false;
      }

      if (selectedIngs.includes(item.ingredient_id)) {
        const duplicateIngName = ingredients.find(ing => String(ing.id) === String(item.ingredient_id))?.name || 'này';
        setSubmitError(`Nguyên liệu "${duplicateIngName}" bị lặp lại trong công thức. Vui lòng gộp dòng hoặc thay đổi.`);
        return false;
      }
      selectedIngs.push(item.ingredient_id);
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!handleValidation()) return;

    setIsSubmitting(true);
    
    const formattedItems = recipeItems.map(item => {
      const selectedIng = ingredients.find(ing => String(ing.id) === String(item.ingredient_id));
      return {
        ingredient_id: Number(item.ingredient_id),
        name: selectedIng.name,
        unit: selectedIng.unit,
        quantity: Number(item.quantity)
      };
    });

    const selectedProd = products.find(p => String(p.id) === String(productId));

    const recipeData = {
      product_id: Number(productId),
      product_name: selectedProd ? selectedProd.name : 'Sản phẩm',
      price: selectedProd ? selectedProd.price : 0,
      items: formattedItems
    };

    try {
      if (isUsingMock) {
        const storedRec = localStorage.getItem(MOCK_RECIPES_KEY);
        let listRec = storedRec ? JSON.parse(storedRec) : [];

        if (isEditMode) {
          listRec = listRec.map(r => String(r.id) === String(id) ? { ...r, ...recipeData } : r);
          setToastMsg('Cập nhật công thức thành công (Giả lập)');
        } else {
          const newId = listRec.length > 0 ? Math.max(...listRec.map(r => r.id)) + 1 : 1;
          listRec.push({ id: newId, ...recipeData });
          setToastMsg('Thiết lập công thức thành công (Giả lập)');
        }
        localStorage.setItem(MOCK_RECIPES_KEY, JSON.stringify(listRec));

        const storedProducts = localStorage.getItem(MOCK_PRODUCTS_KEY);
        if (storedProducts) {
          const productsList = JSON.parse(storedProducts);
          const updatedProductsList = productsList.map(p => 
            String(p.id) === String(productId) ? { ...p, has_recipe: true } : p
          );
          localStorage.setItem(MOCK_PRODUCTS_KEY, JSON.stringify(updatedProductsList));
        }

        setTimeout(() => navigate(ROUTES.ADMIN_RECIPES), 1000);
      } else {
        const payload = {
          productId: Number(productId),
          items: formattedItems.map(i => ({
            ingredientId: i.ingredient_id,
            quantity: i.quantity
          }))
        };

        if (isEditMode) {
          await recipeApi.updateRecipe(id, payload);
          setToastMsg('Cập nhật công thức thành công');
        } else {
          await recipeApi.createRecipe(payload);
          setToastMsg('Thiết lập công thức thành công');
        }
        setTimeout(() => navigate(ROUTES.ADMIN_RECIPES), 1000);
      }
    } catch (err) {
      setSubmitError(err.message || 'Lưu thông tin công thức pha chế thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title={isEditMode ? 'Chỉnh sửa công thức' : 'Thiết lập công thức pha chế'}
        description="Định lượng khối lượng, thể tích các thành phần để tạo nên 1 đơn vị ly nước."
        actions={
          <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_RECIPES)} icon={<ArrowLeft size={16} />}>
            Quay lại danh sách
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API công thức chưa hoàn tất kết nối CSDL."
        />
      )}

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải danh sách dữ liệu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <SelectInput
              label="Chọn sản phẩm áp dụng công thức"
              name="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              options={products.map(p => ({ value: p.id, label: `${p.name} (Đơn giá: ${p.price} ₫)` }))}
              placeholder="-- Chọn sản phẩm active chưa thiết lập công thức --"
              required
              disabled={isEditMode || isSubmitting}
            />

            <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
                  Thành phần nguyên liệu
                </h4>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddRow} disabled={isSubmitting} icon={<Plus size={14} />}>
                  Thêm dòng nguyên liệu
                </Button>
              </div>

              {recipeItems.map((row, index) => {
                const selectedIng = ingredients.find(ing => String(ing.id) === String(row.ingredient_id));
                const unitStr = selectedIng ? selectedIng.unit : '';

                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--color-surface-container-low)',
                    borderRadius: 'var(--radius-default)',
                    border: '1px solid var(--color-outline-variant)'
                  }}>
                    <div style={{ flex: 2 }}>
                      <SelectInput
                        value={row.ingredient_id}
                        onChange={(e) => handleRowChange(index, 'ingredient_id', e.target.value)}
                        options={ingredients.map(ing => ({ value: ing.id, label: ing.name }))}
                        placeholder="-- Chọn nguyên liệu --"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <NumberInput
                        placeholder="Số lượng"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div style={{ width: '80px', display: 'flex', alignItems: 'center', height: '40px', fontSize: '13px', color: 'var(--color-secondary)', fontWeight: '500' }}>
                      {unitStr}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        disabled={isSubmitting || recipeItems.length === 1}
                        style={{ color: 'var(--color-error)' }}
                        title="Xóa dòng"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_RECIPES)} disabled={isSubmitting}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Lưu công thức
              </Button>
            </div>
          </form>
        )}
      </div>

      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
    </div>
  );
}
export default RecipeFormPage;
