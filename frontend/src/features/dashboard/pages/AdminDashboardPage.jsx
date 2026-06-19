import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, AlertTriangle, Coffee, RotateCcw, PlusCircle, PackagePlus, FileText } from 'lucide-react';
import { getDashboardSummary } from '../api/dashboardApi.js';
import { Card } from '../../../components/common/Card.jsx';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { formatVND } from '../../../utils/currency.js';
import { formatDateTime } from '../../../utils/date.js';
import { ROUTES } from '../../../constants/routes.js';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin tổng quan từ hệ thống.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Bảng điều khiển"
        description="Tổng quan hoạt động kinh doanh và tồn kho của quán cà phê hôm nay."
        actions={
          <Button variant="secondary" onClick={fetchSummary} disabled={isLoading} icon={<RotateCcw size={16} />}>
            Tải lại
          </Button>
        }
      />

      {error && (
        <Alert
          type="warning"
          message={
            <span>
              {error} (Lưu ý: Nếu chưa kết nối cơ sở dữ liệu Supabase, vui lòng thiết lập lại URL kết nối trong backend .env).
            </span>
          }
        />
      )}

      {/* Summary Grid */}
      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
        <Card
          title="Doanh thu hôm nay"
          value={formatVND(summary?.today?.revenue || 0)}
          subtext={`${summary?.today?.orders || 0} đơn hàng thành công`}
          icon={<DollarSign size={24} />}
          loading={isLoading}
        />
        <Card
          title="Đơn hàng hệ thống"
          value={summary?.counts?.orders || 0}
          subtext="Tổng đơn hàng thành công"
          icon={<ShoppingBag size={24} />}
          loading={isLoading}
        />
        <Card
          title="Nguyên liệu sắp hết"
          value={summary?.counts?.lowStockIngredients || 0}
          subtext="Nguyên liệu dưới hạn định mức"
          icon={<AlertTriangle size={24} />}
          loading={isLoading}
          style={{ borderLeft: summary?.counts?.lowStockIngredients > 0 ? '4px solid var(--color-error)' : '1px solid var(--color-outline-variant)' }}
        />
        <Card
          title="Tổng sản phẩm"
          value={summary?.counts?.products || 0}
          subtext="Sản phẩm đang kinh doanh"
          icon={<Coffee size={24} />}
          loading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', marginTop: '8px' }}>
        
        {/* Left Side: Recent Order & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          {/* Quick Actions Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-primary)', margin: 0, marginBottom: '16px' }}>
              Thao tác nhanh
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleQuickAction(ROUTES.ADMIN_PRODUCTS_NEW)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-default)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <PlusCircle size={22} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-on-surface)', fontSize: '14px' }}>Thêm sản phẩm</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '2px' }}>Mở nhanh form tạo sản phẩm mới</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction(ROUTES.ADMIN_STOCK)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-default)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <PackagePlus size={22} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-on-surface)', fontSize: '14px' }}>Nhập / Điều chỉnh kho</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '2px' }}>Cập nhật số lượng nguyên liệu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction(ROUTES.ADMIN_RECIPES)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-default)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Coffee size={22} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-on-surface)', fontSize: '14px' }}>Thiết lập công thức</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '2px' }}>Định lượng thành phần ly pha chế</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickAction(ROUTES.ADMIN_REPORTS)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-default)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <FileText size={22} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-on-surface)', fontSize: '14px' }}>Xem báo cáo</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '2px' }}>Phân tích kết quả kinh doanh</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Last Order Panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ height: '100%', minHeight: '280px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-primary)', margin: 0, marginBottom: '16px' }}>
              Giao dịch gần nhất
            </h3>
            {isLoading ? (
              <p style={{ color: 'var(--color-secondary)', fontSize: '14px', margin: 0 }}>Đang tải giao dịch...</p>
            ) : summary?.lastOrder ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-default)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: '1px solid var(--color-outline-variant)'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: '600' }}>MÃ ĐƠN HÀNG</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '4px' }}>
                    #{summary.lastOrder.order_code}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '12px', fontWeight: '600' }}>TỔNG TIỀN</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-tertiary-container)', marginTop: '4px' }}>
                    {formatVND(summary.lastOrder.total_amount)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '12px', fontWeight: '600' }}>THỜI GIAN</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-on-surface)', marginTop: '4px' }}>
                    {formatDateTime(summary.lastOrder.created_at)}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-secondary)', fontSize: '14px', margin: 0 }}>Chưa có đơn hàng nào được ghi nhận hôm nay.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
export default AdminDashboardPage;
