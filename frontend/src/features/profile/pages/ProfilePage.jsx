import { useEffect, useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { authApi } from '../../auth/api/authApi.js';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { PasswordInput } from '../../../components/forms/PasswordInput.jsx';
import { formatDateTime } from '../../../utils/date.js';
import { validateDisplayName, validateEmail, validatePassword } from '../../../utils/validators.js';

export function ProfilePage() {
  const { user, setCurrentUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setProfileError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setPasswordError('');
  };

  const validateProfileForm = () => {
    const nextErrors = {
      fullName: validateDisplayName(profileForm.fullName, 'Họ và tên'),
      email: validateEmail(profileForm.email),
    };

    setProfileErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const validatePasswordForm = () => {
    const nextErrors = {
      currentPassword: passwordForm.currentPassword ? '' : 'Mật khẩu hiện tại không được để trống.',
      newPassword: validatePassword(passwordForm.newPassword),
      confirmPassword: '',
    };

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setPasswordErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');

    try {
      const response = await authApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      });
      setCurrentUser(response.data.user);
      setToastType('success');
      setToastMsg('Cập nhật hồ sơ thành công.');
    } catch (saveError) {
      setProfileError(saveError.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setToastType('success');
      setToastMsg('Đổi mật khẩu thành công.');
    } catch (changeError) {
      setPasswordError(changeError.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin cá nhân và cập nhật mật khẩu đăng nhập của bạn."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 'var(--spacing-lg)' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Thông tin cá nhân</h3>
          {profileError && <Alert type="error" message={profileError} onClose={() => setProfileError('')} />}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextInput label="Tên đăng nhập" name="username" value={user?.username || ''} onChange={() => {}} disabled />

            <TextInput
              label="Họ và tên"
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              error={profileErrors.fullName}
              required
              maxLength={120}
              disabled={isSavingProfile}
            />

            <TextInput
              label="Email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              error={profileErrors.email}
              required
              maxLength={120}
              disabled={isSavingProfile}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button type="submit" variant="primary" loading={isSavingProfile} icon={<Save size={16} />}>
                Lưu hồ sơ
              </Button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Tài khoản</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div>
                <strong>Vai trò:</strong> {user?.role === 'ADMIN' ? ' Quản trị viên' : ' Nhân viên'}
              </div>
              <div>
                <strong>Trạng thái:</strong> {user?.status === 'ACTIVE' ? ' Hoạt động' : ' Ngưng hoạt động'}
              </div>
              <div>
                <strong>Lần đăng nhập cuối:</strong> {formatDateTime(user?.lastLoginAt) || 'Chưa có dữ liệu'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Đổi mật khẩu</h3>
            {passwordError && <Alert type="error" message={passwordError} onClose={() => setPasswordError('')} />}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PasswordInput
                label="Mật khẩu hiện tại"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                required
                disabled={isChangingPassword}
              />

              <PasswordInput
                label="Mật khẩu mới"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                required
                disabled={isChangingPassword}
              />

              <PasswordInput
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                required
                disabled={isChangingPassword}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button type="submit" variant="secondary" loading={isChangingPassword} icon={<KeyRound size={16} />}>
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default ProfilePage;
