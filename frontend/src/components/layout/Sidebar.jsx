import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Coffee,
  Milk,
  Package,
  ChefHat,
  BarChart3,
  ShoppingCart,
  History,
  Users,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';

export function Sidebar({ role, isCollapsed, onToggle }) {
  const location = useLocation();

  const adminMenu = [
    { label: 'Bang dieu khien', path: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={21} /> },
    { label: 'Sản phẩm & Công thức', path: ROUTES.ADMIN_PRODUCTS, icon: <Coffee size={21} /> },
    { label: 'Quan ly nguyen lieu', path: ROUTES.ADMIN_INGREDIENTS, icon: <Milk size={21} /> },
    { label: 'Kho hàng & Dự báo', path: ROUTES.ADMIN_STOCK, icon: <Package size={21} /> },
    { label: 'Bao cao thong ke', path: ROUTES.ADMIN_REPORTS, icon: <BarChart3 size={21} /> },
    { label: 'Quản lý đơn hàng', path: ROUTES.ADMIN_ORDERS, icon: <History size={21} /> },
    { label: 'Lich lam nhan su', path: '/admin/hr/calendar', icon: <Calendar size={21} /> },
    { label: 'Quan ly nhan su', path: '/admin/hr', icon: <Users size={21} /> },
    { label: 'Cham cong nhan su', path: ROUTES.ADMIN_HR_ATTENDANCE, icon: <UserCheck size={21} /> },
  ];

  const staffMenu = [
    { label: 'Ban hang (POS)', path: ROUTES.STAFF_POS, icon: <ShoppingCart size={21} /> },
    { label: 'Quản lý ca làm', path: ROUTES.STAFF_SESSION, icon: <UserCheck size={21} /> },
    { label: 'KDS / Bep', path: ROUTES.STAFF_KDS, icon: <ChefHat size={21} /> }, 
    { label: 'Lich su don hang', path: ROUTES.STAFF_ORDERS, icon: <History size={21} /> },
    { label: 'Nhập kho & Kiểm kê', path: '/staff/stock', icon: <Package size={21} /> },
    { label: 'Nhan su & Lich lam', path: '/staff/hr', icon: <Calendar size={21} /> },
  ];

  const menu = role === ROLES.ADMIN ? adminMenu : staffMenu;

  const isLinkActive = (itemPath) => {
    const currentPath = location.pathname;
    const itemPathname = itemPath.split('?')[0];

    if (itemPathname === currentPath) return true;
    
    // Check main parent highlights for subroutes
    if (itemPathname === ROUTES.ADMIN_PRODUCTS.split('?')[0]) {
      if (currentPath.startsWith('/admin/products') || currentPath.startsWith('/admin/recipes')) {
        return true;
      }
    }

    if (itemPathname === ROUTES.ADMIN_INGREDIENTS.split('?')[0]) {
      if (currentPath.startsWith('/admin/ingredients')) {
        return true;
      }
    }

    if (itemPathname === ROUTES.ADMIN_STOCK.split('?')[0] || itemPathname === '/staff/stock') {
      if (currentPath.startsWith('/admin/stock') || currentPath.startsWith('/staff/stock')) {
        return true;
      }
    }

    if (itemPathname === '/admin/hr') {
      if (currentPath.startsWith('/admin/users') || currentPath.startsWith('/admin/hr')) {
        return true;
      }
    }

    if (itemPathname === ROUTES.ADMIN_ORDERS) {
      if (currentPath.startsWith('/admin/orders')) {
        return true;
      }
    }

    if (itemPathname === ROUTES.STAFF_ORDERS) {
      if (currentPath.startsWith('/staff/orders')) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">MC</div>
        <div className="sidebar-brand-text">
          <h1 className="sidebar-brand-title">Mini Coffee</h1>
          <p className="sidebar-brand-subtitle">POS & Inventory</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => {
          const isActive = isLinkActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-nav-link${isActive ? ' is-active' : ''}`}
              data-tooltip={item.label}
            >
              {item.icon}
              <span className="sidebar-nav-link-text">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-toggle-container">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          type="button"
          data-tooltip={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          <span className="sidebar-toggle-btn-text">Thu gọn menu</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
