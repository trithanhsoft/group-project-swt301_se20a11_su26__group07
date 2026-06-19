import React from 'react';

export function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="brand-mark" style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '24px',
            marginBottom: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-medium)'
          }}>MC</div>
          <h1 className="display-lg" style={{ color: 'var(--color-on-primary)', fontWeight: '700', marginBottom: 'var(--spacing-md)', margin: 0 }}>
            Mini Coffee POS
          </h1>
          <p className="body-lg" style={{ color: 'var(--color-on-primary-container)', lineHeight: '1.6', marginTop: '12px', margin: 0 }}>
            Hệ thống quản lý bán hàng và tồn kho thông minh dành cho cửa hàng cà phê. Kiểm soát chặt chẽ nguyên liệu, sản phẩm, và tối ưu quy trình vận hành.
          </p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
export default AuthLayout;
