import React from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { useAuth } from '../../app/providers/AuthProvider.jsx';

export function AppLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar role={user?.role} />
      <div className="app-main">
        <Header />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
export default AppLayout;
