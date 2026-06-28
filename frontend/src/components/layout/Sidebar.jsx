import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';

export function Sidebar({ role }) {
  const adminMenu = [
    { label: 'Bang dieu khien', path: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { label: 'Quan ly nguoi dung', path: ROUTES.ADMIN_USERS, icon: <Users size={18} /> },
    { label: 'Quan ly san pham', path: ROUTES.ADMIN_PRODUCTS, icon: <Coffee size={18} /> },
    { label: 'Quan ly nguyen lieu', path: ROUTES.ADMIN_INGREDIENTS, icon: <Milk size={18} /> },
    { label: 'Quan ly kho hang', path: ROUTES.ADMIN_STOCK, icon: <Package size={18} /> },
    { label: 'Quan ly cong thuc', path: ROUTES.ADMIN_RECIPES, icon: <ChefHat size={18} /> },
    { label: 'Bao cao thong ke', path: ROUTES.ADMIN_REPORTS, icon: <BarChart3 size={18} /> },
  ];

  const staffMenu = [
    { label: 'Ban hang (POS)', path: ROUTES.STAFF_POS, icon: <ShoppingCart size={18} /> },
    { label: 'KDS / Bep', path: ROUTES.STAFF_KDS, icon: <ChefHat size={18} /> },
    { label: 'Lich su don hang', path: ROUTES.STAFF_ORDERS, icon: <History size={18} /> },
  ];

  const menu = role === ROLES.ADMIN ? adminMenu : staffMenu;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">MC</div>
        <div>
          <h1 className="sidebar-brand-title">Mini Coffee</h1>
          <p className="sidebar-brand-subtitle">POS & Inventory</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' is-active' : ''}`
            }
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
