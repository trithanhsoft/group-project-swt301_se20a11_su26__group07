import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Coffee, Milk, Package, ChefHat, BarChart3, ShoppingCart, History } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';

export function Sidebar({ role }) {
  const adminMenu = [
    { label: 'Bảng điều khiển', path: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { label: 'Quản lý sản phẩm', path: ROUTES.ADMIN_PRODUCTS, icon: <Coffee size={18} /> },
    { label: 'Quản lý nguyên liệu', path: ROUTES.ADMIN_INGREDIENTS, icon: <Milk size={18} /> },
    { label: 'Quản lý kho hàng', path: ROUTES.ADMIN_STOCK, icon: <Package size={18} /> },
    { label: 'Quản lý công thức', path: ROUTES.ADMIN_RECIPES, icon: <ChefHat size={18} /> },
    { label: 'Báo cáo thống kê', path: ROUTES.ADMIN_REPORTS, icon: <BarChart3 size={18} /> },
  ];

  const staffMenu = [
    { label: 'Bán hàng (POS)', path: ROUTES.STAFF_POS, icon: <ShoppingCart size={18} /> },
    { label: 'Lịch sử đơn hàng', path: ROUTES.STAFF_ORDERS, icon: <History size={18} /> },
  ];

  const menu = role === ROLES.ADMIN ? adminMenu : staffMenu;

  return (
    <aside className="app-sidebar">
      <div className="brand-block" style={{ padding: '20px var(--spacing-md)', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="brand-mark" style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-default)',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>MC</div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>Mini Coffee</h1>
          <p style={{ fontSize: '11px', color: 'var(--color-secondary)', margin: 0 }}>POS & Inventory</p>
        </div>
      </div>
      
      <nav style={{ padding: '20px var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-default)',
              backgroundColor: isActive ? 'var(--color-primary-container)' : 'transparent',
              color: isActive ? 'var(--color-on-primary)' : 'var(--color-on-background)',
              fontWeight: isActive ? '600' : '500',
              gap: '12px',
              transition: 'all 0.15s ease'
            })}
          >
            {item.icon}
            <span style={{ fontSize: '14px' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
export default Sidebar;
