import React, { useEffect, useState } from 'react';
import { RotateCcw, TrendingUp, ShoppingBag, AlertTriangle, Coffee } from 'lucide-react';
import { reportApi } from '../api/reportApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { StatusBadge } from '../../../components/common/StatusBadge.jsx';
import { Card } from '../../../components/common/Card.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatVND } from '../../../utils/currency.js';
import { formatDate } from '../../../utils/date.js';

const MOCK_ORDERS_KEY = 'mini_pos_orders';
const MOCK_INGREDIENTS_KEY = 'mini_pos_ingredients';

export function ReportsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [error, setError] = useState('');

  const loadReportsData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [revRes, bestRes, lowRes] = await Promise.all([
        reportApi.getRevenueReport(),
        reportApi.getBestSellingProducts(),
        reportApi.getLowStockIngredients()
      ]);
      setRevenueData(revRes.data || []);
      setBestSellers(bestRes.data || []);
      setLowStock(lowRes.data || []);
      setIsUsingMock(false);
    } catch (err) {
      setIsUsingMock(true);
      
      // Dynamic local calculation from mock DB!
      const storedOrders = localStorage.getItem(MOCK_ORDERS_KEY);
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      
      const storedIngs = localStorage.getItem(MOCK_INGREDIENTS_KEY);
      const ingredients = storedIngs ? JSON.parse(storedIngs) : [];

      // 1. Calculate Daily Revenue
      const revMap = {};
      orders.forEach(o => {
        const dateKey = o.created_at.slice(0, 10);
        if (!revMap[dateKey]) {
          revMap[dateKey] = { order_date: dateKey, total_revenue: 0, total_orders: 0 };
        }
        revMap[dateKey].total_revenue += o.total_amount;
        revMap[dateKey].total_orders += 1;
      });
      const revList = Object.values(revMap).sort((a, b) => b.order_date.localeCompare(a.order_date));
      setRevenueData(revList);

      // 2. Calculate Best Sellers
      const sellerMap = {};
      orders.forEach(o => {
        o.items.forEach(item => {
          const name = item.product_name;
          if (!sellerMap[name]) {
            sellerMap[name] = { product_name: name, quantity_sold: 0, total_sales: 0 };
          }
          sellerMap[name].quantity_sold += item.quantity;
          sellerMap[name].total_sales += item.price * item.quantity;
        });
      });
      const sellerList = Object.values(sellerMap).sort((a, b) => b.quantity_sold - a.quantity_sold);
      setBestSellers(sellerList);

      // 3. Low Stock Ingredients
      const lowList = ingredients.filter(ing => Number(ing.current_stock) <= Number(ing.low_stock_threshold));
      setLowStock(lowList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const totalRevenueSum = revenueData.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
  const totalOrdersSum = revenueData.reduce((sum, item) => sum + Number(item.total_orders || 0), 0);

  const revenueHeaders = [
    { key: 'order_date', label: 'Ngày giao dịch', render: (row) => formatDate(row.order_date) },
    { key: 'total_orders', label: 'Số lượng đơn' },
    { key: 'total_revenue', label: 'Tổng doanh thu', render: (row) => <strong>{formatVND(row.total_revenue)}</strong> }
  ];

  const sellerHeaders = [
    { key: 'product_name', label: 'Tên sản phẩm', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.product_name}</strong> },
    { key: 'quantity_sold', label: 'Số lượng bán ra', render: (row) => `${row.quantity_sold} ly` },
    { key: 'total_sales', label: 'Doanh thu thu về', render: (row) => formatVND(row.total_sales || 0) }
  ];

  const stockHeaders = [
    { key: 'name', label: 'Tên nguyên liệu', render: (row) => <strong style={{ color: 'var(--color-error)' }}>{row.name}</strong> },
    { key: 'current_stock', label: 'Hiện có', render: (row) => `${row.current_stock} ${row.unit}` },
    { key: 'low_stock_threshold', label: 'Ngưỡng cảnh báo', render: (row) => `${row.low_stock_threshold} ${row.unit}` },
    { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge status="LOW_STOCK" /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Theo dõi doanh thu bán hàng thực tế và cảnh báo tồn kho nguyên vật liệu."
        actions={
          <Button variant="secondary" onClick={loadReportsData} disabled={isLoading} icon={<RotateCcw size={16} />}>
            Tải lại
          </Button>
        }
      />

      {isUsingMock && (
        <Alert
          type="info"
          message="Hệ thống đang hoạt động ở chế độ GIẢ LẬP LOCAL vì backend API báo cáo chưa hoàn tất kết nối CSDL."
        />
      )}

      {/* Summary Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
        <Card
          title="Tổng doanh thu ghi nhận"
          value={formatVND(totalRevenueSum)}
          subtext={`Lũy kế trên ${totalOrdersSum} đơn hàng thành công`}
          icon={<TrendingUp size={24} />}
          loading={isLoading}
        />
        <Card
          title="Món nước bán chạy hàng đầu"
          value={bestSellers[0]?.product_name || 'Chưa có'}
          subtext={bestSellers[0] ? `Đã bán được ${bestSellers[0].quantity_sold} ly` : 'Chưa có dữ liệu'}
          icon={<Coffee size={24} />}
          loading={isLoading}
        />
        <Card
          title="Cảnh báo nguyên liệu"
          value={`${lowStock.length} loại`}
          subtext="Nguyên liệu đang dưới mức tồn an toàn"
          icon={<AlertTriangle size={24} />}
          loading={isLoading}
          style={{ borderLeft: lowStock.length > 0 ? '4px solid var(--color-error)' : '1px solid var(--color-outline-variant)' }}
        />
      </div>

      {/* Report Tables Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: '8px' }}>
        
        {/* Left: Revenue Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
            Doanh thu theo ngày
          </h3>
          <DataTable
            headers={revenueHeaders}
            data={revenueData}
            loading={isLoading}
            emptyMessage="Chưa có dữ liệu doanh thu hàng ngày."
          />
        </div>

        {/* Right: Best Selling Products */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
            Sản phẩm bán chạy nhất
          </h3>
          <DataTable
            headers={sellerHeaders}
            data={bestSellers}
            loading={isLoading}
            emptyMessage="Chưa có dữ liệu sản phẩm bán chạy."
          />
        </div>

      </div>

      {/* Under: Low Stock warning ingredients table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
            Nguyên vật liệu dưới ngưỡng an toàn (Cần nhập kho gấp)
          </h3>
        </div>
        <DataTable
          headers={stockHeaders}
          data={lowStock}
          loading={isLoading}
          emptyMessage="Tuyệt vời! Tất cả nguyên liệu đều ở mức tồn kho an toàn."
        />
      </div>

    </div>
  );
}
export default ReportsPage;
