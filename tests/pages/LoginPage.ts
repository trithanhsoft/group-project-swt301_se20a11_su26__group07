/**
 * Login Page Object
 * Đóng gói tất cả interactions với trang /login
 * KHÔNG chứa assertion nghiệp vụ — chỉ chứa actions và locators
 */
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly successAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly pageTitle: Locator;

  // Forgot password form
  readonly forgotUsernameInput: Locator;
  readonly forgotEmailInput: Locator;
  readonly sendOtpButton: Locator;
  readonly backToLoginLink: Locator;

  // Reset password form
  readonly otpInput: Locator;
  readonly newPasswordInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly cancelResetLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Login form
    this.usernameInput = page.getByLabel('Tên đăng nhập');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.loginButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorAlert = page.getByRole('alert').filter({ hasText: /thất bại|không hợp lệ|lỗi|không tìm thấy/i });
    this.successAlert = page.getByRole('alert').filter({ hasText: /thành công/i });
    this.forgotPasswordLink = page.getByRole('button', { name: 'Quên mật khẩu?' });
    this.pageTitle = page.getByRole('heading', { name: 'Đăng nhập hệ thống' });

    // Forgot password form
    this.forgotUsernameInput = page.getByLabel('Tên đăng nhập');
    this.forgotEmailInput = page.getByLabel('Địa chỉ Email');
    this.sendOtpButton = page.getByRole('button', { name: 'Gửi mã xác nhận' });
    this.backToLoginLink = page.getByRole('button', { name: 'Quay lại đăng nhập' });

    // Reset password form
    this.otpInput = page.getByLabel('Mã xác nhận (6 chữ số)');
    this.newPasswordInput = page.getByLabel('Mật khẩu mới');
    this.resetPasswordButton = page.getByRole('button', { name: 'Đặt lại mật khẩu' });
    this.cancelResetLink = page.getByRole('button', { name: 'Hủy bỏ' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async submitForgotPassword(username: string, email: string) {
    await this.forgotUsernameInput.fill(username);
    await this.forgotEmailInput.fill(email);
    await this.sendOtpButton.click();
  }

  async submitResetPassword(otp: string, newPassword: string) {
    await this.otpInput.fill(otp);
    await this.newPasswordInput.fill(newPassword);
    await this.resetPasswordButton.click();
  }

  /**
   * Trả về message lỗi đang hiển thị (nếu có)
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorAlert.innerText();
    } catch {
      return null;
    }
  }

  /**
   * Trả về message thành công đang hiển thị (nếu có)
   */
  async getSuccessMessage(): Promise<string | null> {
    try {
      await this.successAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.successAlert.innerText();
    } catch {
      return null;
    }
  }
}
