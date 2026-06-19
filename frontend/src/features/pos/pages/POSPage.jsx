import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash, Search, CheckCircle } from 'lucide-react';
import { posApi } from '../api/posApi.js';
import { productApi } from '../../products/api/productApi.js';
import { ingredientApi } from '../../ingredients/api/ingredientApi.js';
import { recipeApi } from '../../recipes/api/recipeApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Card } from '../../../components/common/Card.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { formatVND } from '../../../utils/currency.js';

const MOCK_PRODUCTS_KEY = 'mini_pos_products';
const MOCK_RECIPES_KEY = 'mini_pos_recipes';
const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';
const MOCK_TRANSACTIONS_KEY = 'mini_pos_transactions';
const MOCK_ORDERS_KEY = 'mini_pos_orders';

export function POSPage() {
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [successOrderCode, setSuccessOrderCode] = useState('');

  const loadPOSData = async () => {
    setIsLoading(true);
    setCheckoutError('');
    try {
      // Attempt API load
      const [prodRes, recRes, ingRes] = await Promise.all([
        posApi.getAvailableProducts(),
        recipeApi.getRecipes(),
        ingredientApi.getIngredients()
      ]);
      setProducts(prodRes.data || []);
      setRecipes(recRes.data || []);
      setIngredients(ingRes.data || []);
      setIsUsingMock(false);
    } catch (err) {
      setIsUsingMock(true);
      // Mock Fallbacks
      const storedProds = localStorage.getItem(MOCK_PRODUCTS_KEY);
      const storedRecs = localStorage.getItem(MOCK_RECIPES_KEY);
      const storedIngs = localStorage.getItem(MOCK_INGREDIENTS_KEY);

      const parsedProds = storedProds ? JSON.parse(storedProds) : [];
      // POS available products must be ACTIVE and have has_recipe === true
      const availableProds = parsedProds.filter(p => p.status === 'ACTIVE' && p.has_recipe);
      setProducts(availableProds);

      setRecipes(storedRecs ? JSON.parse(storedRecs) : []);
      setIngredients(storedIngs ? JSON.parse(storedIngs) : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPOSData();
  }, []);

  const handleAddToCart = (product) => {
    setCheckoutError('');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setCheckoutError('');
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError('Giỏ hàng trống. Vui lòng thêm sản phẩm.');
      return;
    }

    setCheckoutError('');
    setIsSubmitting(true);

    try {
      if (isUsingMock) {
        // Validate ingredient stocks based on recipes
        const reqs = {};
        cart.forEach(item => {
          const recipe = recipes.find(r => r.product_id === item.id);
          if (!recipe) {
            throw new Error(`Sản phẩm ${item.name} chưa được cấu hình công thức pha chế.`);
          }
          recipe.items.forEach(rItem => {
            const ingId = rItem.ingredient_id;
            const qtyNeeded = Number(rItem.quantity) * item.quantity;
            reqs[ingId] = (reqs[ingId] || 0) + qtyNeeded;
          });
        });

        // Verify stock levels
        for (const ingId in reqs) {
          const ing = ingredients.find(i => String(i.id) === String(ingId));
          if (!ing) {
            throw new Error(`Không tìm thấy nguyên liệu có mã #${ingId} trong hệ thống.`);
          }
          if (Number(ing.current_stock) < reqs[ingId]) {
            throw new Error(`Không đủ tồn kho cho nguyên liệu: "${ing.name}" (Cần: ${reqs[ingId]} ${ing.unit}, Hiện có: ${ing.current_stock} ${ing.unit}).`);
          }
        }

        // Deduct stocks in mock local storage
        const storedIngs = localStorage.getItem(MOCK_INGREDIENTS_KEY);
        let listIngs = storedIngs ? JSON.parse(storedIngs) : [];
        const stockTxs = [];

        listIngs = listIngs.map(ing => {
          const needed = reqs[ing.id];
          if (needed !== undefined) {
            const beforeStock = ing.current_stock;
            const afterStock = beforeStock - needed;
            stockTxs.push({
              ingredient_name: ing.name,
              type: 'ORDER_DEDUCT',
              quantity: -needed,
              before_stock: beforeStock,
              after_stock: afterStock
            });
            return { ...ing, current_stock: afterStock };
          }
          return ing;
        });

        // Save updated stocks
        localStorage.setItem(MOCK_INGREDIENTS_KEY, JSON.stringify(listIngs));

        // Create stock transactions logs
        const storedTxs = localStorage.getItem(MOCK_TRANSACTIONS_KEY);
        let listTxs = storedTxs ? JSON.parse(storedTxs) : [];
        let txId = listTxs.length > 0 ? Math.max(...listTxs.map(t => t.id)) : 0;

        stockTxs.forEach(tx => {
          txId += 1;
          listTxs.push({
            id: txId,
            ingredient_name: tx.ingredient_name,
            type: tx.type,
            quantity: tx.quantity,
            before_stock: tx.before_stock,
            after_stock: tx.after_stock,
            created_by: 'staff',
            date: new Date().toISOString()
          });
        });
        localStorage.setItem(MOCK_TRANSACTIONS_KEY, JSON.stringify(listTxs));

        // Generate Order Code and save Order
        const orderCode = 'OD' + String(Date.now()).slice(-6);
        const storedOrders = localStorage.getItem(MOCK_ORDERS_KEY);
        const listOrders = storedOrders ? JSON.parse(storedOrders) : [];
        const newOrderId = listOrders.length > 0 ? Math.max(...listOrders.map(o => o.id)) + 1 : 1;

        listOrders.push({
          id: newOrderId,
          order_code: orderCode,
          total_amount: cartTotal,
          status: 'SUCCESS',
          created_by: 'staff',
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            product_name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        });
        localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(listOrders));

        setSuccessOrderCode(orderCode);
        setCart([]);
        setToastMsg('Thanh toán thành công! (Giả lập)');
      } else {
        const payload = {
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        };
        const res = await posApi.createOrder(payload);
        setSuccessOrderCode(res.data.order_code || 'OK');
        setCart([]);
        setToastMsg('Thanh toán đơn hàng thành công');
      }
      loadPOSData();
    } catch (err) {
      setCheckoutError(err.message || 'Thanh toán thất bại.');
      setToastMsg(err.message || 'Giao dịch thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quầy bán hàng (POS)"
        description="Chọn món nước pha chế và tiến hành in hóa đơn thanh toán cho khách hàng."
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API POS chưa hoàn tất kết nối CSDL."
        />
      )}

      {successOrderCode && (
        <Alert
          type="success"
          message={`Thanh toán thành công! Mã hóa đơn của khách hàng là: #${successOrderCode}`}
          onClose={() => setSuccessOrderCode('')}
        />
      )}

      {checkoutError && <Alert type="error" message={checkoutError} onClose={() => setCheckoutError('')} />}

      {/* POS Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        
        {/* Left Side: Product Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <TextInput
            placeholder="Tìm món nước theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Đang tải danh mục nước uống...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <p style={{ color: 'var(--color-secondary)', margin: 0 }}>Không tìm thấy sản phẩm nào hoạt động có công thức pha chế.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {filteredProducts.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
                      {p.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '4px', margin: 0 }}>
                      {p.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-tertiary-container)', fontSize: '14px' }}>
                      {formatVND(p.price)}
                    </span>
                    <Button variant="primary" size="sm" onClick={() => handleAddToCart(p)}>
                      Chọn mua
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Cart Summary */}
        <div className="card" style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '12px' }}>
            <ShoppingCart size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
              Đơn hàng thanh toán
            </h3>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-secondary)' }}>
              Giỏ hàng đang trống
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--color-outline-variant)', paddingBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '2px' }}>
                        {formatVND(item.price)} x {item.quantity}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button type="button" onClick={() => handleUpdateQuantity(item.id, -1)} style={{ color: 'var(--color-primary)', padding: '2px' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '13px', fontWeight: '700', width: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button type="button" onClick={() => handleUpdateQuantity(item.id, 1)} style={{ color: 'var(--color-primary)', padding: '2px' }}>
                        <Plus size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemoveFromCart(item.id)} style={{ color: 'var(--color-error)', marginLeft: '6px', padding: '2px' }} title="Xóa">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500', color: 'var(--color-secondary)' }}>
                  <span>Tạm tính</span>
                  <span>{formatVND(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)' }}>
                  <span>Tổng thanh toán</span>
                  <span style={{ color: 'var(--color-tertiary-container)' }}>{formatVND(cartTotal)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleCheckout}
                loading={isSubmitting}
                style={{ width: '100%', padding: '12px' }}
              >
                In hóa đơn & Thanh toán
              </Button>
            </>
          )}
        </div>

      </div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}
export default POSPage;
