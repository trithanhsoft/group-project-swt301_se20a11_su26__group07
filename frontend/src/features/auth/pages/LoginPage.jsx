import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { AuthLayout } from '../../../components/layout/AuthLayout.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { PasswordInput } from '../../../components/forms/PasswordInput.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { validateUsername, validatePassword } from '../../../utils/validators.js';
import { ROUTES } from '../../../constants/routes.js';
import { ROLES } from '../../../constants/roles.js';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  if (user) {
    if (user.role === ROLES.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.STAFF_POS} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validate username and password
    const usernameError = validateUsername(form.username);
    const passwordError = validatePassword(form.password);

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login({
        username: form.username.trim(),
        password: form.password,
      });
      
      // Redirect based on role
      if (loggedInUser.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.STAFF_POS, { replace: true });
      }
    } catch (err) {
      setSubmitError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>
          Đăng nhập hệ thống
        </h2>
        <p style={{ color: 'var(--color-secondary)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
          Vui lòng điền thông tin tài khoản của bạn.
        </p>
      </div>

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <TextInput
          label="Tên đăng nhập"
          name="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="admin hoặc staff"
          disabled={isSubmitting}
          required
        />

        <PasswordInput
          label="Mật khẩu"
          name="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Nhập mật khẩu của bạn"
          disabled={isSubmitting}
          required
        />

        <div style={{ marginTop: '12px' }}>
          <Button type="submit" variant="primary" loading={isSubmitting} style={{ width: '100%' }}>
            Đăng nhập
          </Button>
        </div>
      </form>

      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-md)',
        border: '1px dashed var(--color-outline-variant)',
        borderRadius: 'var(--radius-default)',
        backgroundColor: 'var(--color-surface-container-low)'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-primary)', margin: 0, marginBottom: '8px' }}>
          Tài khoản demo có sẵn (Seed)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
          <div><strong>Quản trị (Admin):</strong> admin / Admin123@</div>
          <div><strong>Nhân viên (Staff):</strong> staff / Staff123@</div>
        </div>
      </div>
    </AuthLayout>
  );
}
export default LoginPage;
