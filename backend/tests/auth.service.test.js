import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  loginWithUsernamePassword,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from '../src/modules/auth/auth.service.js';
import { query } from '../src/config/db.js';
import { mailSender } from '../src/config/mail.js';

// Mock dependencies
vi.mock('../src/config/db.js', () => ({
  query: vi.fn(),
  pool: {
    connect: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('../src/config/mail.js', () => ({
  mailSender: {
    sendEmail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }),
  },
}));

describe('Auth Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWithUsernamePassword', () => {
    it('should login successfully for active user with correct password', async () => {
      const mockUserRow = {
        id: '123',
        username: 'admin',
        email: 'admin@test.com',
        password_hash: 'hashedpassword',
        full_name: 'System Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        last_login_at: null,
      };

      query
        .mockResolvedValueOnce({ rows: [mockUserRow] })
        .mockResolvedValueOnce({ rows: [{ last_login_at: '2026-07-14T00:00:00Z', updated_at: '2026-07-14T00:00:00Z' }] });

      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await loginWithUsernamePassword({
        username: 'admin',
        password: 'Admin123@',
      });

      expect(query).toHaveBeenCalledTimes(2);
      expect(bcrypt.compare).toHaveBeenCalledWith('Admin123@', 'hashedpassword');
      expect(result.user.id).toBe('123');
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.status).toBe('ACTIVE');
      expect(result.token).toBeDefined();
    });

    it('should throw 400 if username or password is missing', async () => {
      await expect(
        loginWithUsernamePassword({ username: '', password: 'somepassword' })
      ).rejects.toThrow('Username and password are required.');

      await expect(
        loginWithUsernamePassword({ username: 'user', password: '' })
      ).rejects.toThrow('Username and password are required.');
    });

    it('should throw 401 if user is not found in database', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await expect(
        loginWithUsernamePassword({ username: 'nonexistent', password: 'password123' })
      ).rejects.toThrow('Invalid username or password.');
    });

    it('should throw 403 if account status is INACTIVE', async () => {
      const mockUserRow = {
        id: '124',
        username: 'staff',
        status: 'INACTIVE',
      };

      query.mockResolvedValueOnce({ rows: [mockUserRow] });

      await expect(
        loginWithUsernamePassword({ username: 'staff', password: 'password123' })
      ).rejects.toThrow('This account is inactive.');
    });

    it('should throw 401 if password check fails', async () => {
      const mockUserRow = {
        id: '123',
        username: 'admin',
        password_hash: 'hashedpassword',
        status: 'ACTIVE',
      };

      query.mockResolvedValueOnce({ rows: [mockUserRow] });
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        loginWithUsernamePassword({ username: 'admin', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid username or password.');
    });
  });

  describe('updateCurrentUserProfile', () => {
    it('should update profile successfully with valid data', async () => {
      const updatedUserRow = {
        id: '123',
        username: 'admin',
        email: 'newadmin@test.com',
        full_name: 'New Admin Name',
        role: 'ADMIN',
        status: 'ACTIVE',
      };

      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [updatedUserRow] });

      const result = await updateCurrentUserProfile('123', {
        fullName: 'New Admin Name',
        email: 'newadmin@test.com',
      });

      expect(result.fullName).toBe('New Admin Name');
      expect(result.email).toBe('newadmin@test.com');
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should throw 400 if full name or email is empty or invalid', async () => {
      await expect(
        updateCurrentUserProfile('123', { fullName: '', email: 'email@test.com' })
      ).rejects.toThrow('Full name is required.');

      await expect(
        updateCurrentUserProfile('123', { fullName: 'Name', email: '' })
      ).rejects.toThrow('Email is required.');

      await expect(
        updateCurrentUserProfile('123', { fullName: 'Name', email: 'invalidemail' })
      ).rejects.toThrow('Email format is invalid.');
    });

    it('should throw 409 if new email already exists on another account', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: '999' }] });

      await expect(
        updateCurrentUserProfile('123', { fullName: 'Name', email: 'duplicate@test.com' })
      ).rejects.toThrow('Email already exists.');
    });
  });

  describe('changeCurrentUserPassword', () => {
    it('should change password successfully with correct current password and valid new password', async () => {
      const mockUserRow = {
        id: '123',
        username: 'admin',
        password_hash: 'oldhashed',
        status: 'ACTIVE',
      };

      query.mockResolvedValueOnce({ rows: [mockUserRow] });
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('newhashed');

      const result = await changeCurrentUserPassword('123', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });

      expect(result.success).toBe(true);
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('should throw 400 if current password equals new password', async () => {
      await expect(
        changeCurrentUserPassword('123', { currentPassword: 'password123', newPassword: 'password123' })
      ).rejects.toThrow('New password must be different from the current password.');
    });

    it('should throw 400 if new password is too short', async () => {
      await expect(
        changeCurrentUserPassword('123', { currentPassword: 'oldpassword', newPassword: '12345' })
      ).rejects.toThrow('Password must be between 6 and 63 characters.');
    });

    it('should throw 400 if current password check fails', async () => {
      const mockUserRow = {
        id: '123',
        username: 'admin',
        password_hash: 'oldhashed',
        status: 'ACTIVE',
      };

      query.mockResolvedValueOnce({ rows: [mockUserRow] });
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        changeCurrentUserPassword('123', { currentPassword: 'wrongoldpassword', newPassword: 'newpassword123' })
      ).rejects.toThrow('Current password is incorrect.');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate verification token and send email successfully', async () => {
      const mockUserRow = {
        id: '123',
        username: 'admin',
        status: 'ACTIVE',
      };

      query
        .mockResolvedValueOnce({ rows: [mockUserRow] }) // User exists
        .mockResolvedValueOnce({ rows: [] }); // Update token successfully

      const result = await requestPasswordReset({ email: 'admin@test.com', username: 'admin' });

      expect(query).toHaveBeenCalledTimes(2);
      expect(mailSender.sendEmail).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should throw 400 if email or username is missing or format is invalid', async () => {
      await expect(requestPasswordReset({ email: '', username: 'admin' })).rejects.toThrow('Email is required.');
      await expect(requestPasswordReset({ email: 'invalidemail', username: 'admin' })).rejects.toThrow('Email format is invalid.');
      await expect(requestPasswordReset({ email: 'admin@test.com', username: '' })).rejects.toThrow('Username is required.');
    });

    it('should throw 404 if email does not match any user or username mismatches', async () => {
      // No user matches email
      query.mockResolvedValueOnce({ rows: [] });
      await expect(requestPasswordReset({ email: 'notfound@test.com', username: 'admin' })).rejects.toThrow('No account found with this username and email combination.');

      // User email matches, but username is different
      query.mockResolvedValueOnce({ rows: [{ id: '123', username: 'otheruser', status: 'ACTIVE' }] });
      await expect(requestPasswordReset({ email: 'admin@test.com', username: 'admin' })).rejects.toThrow('No account found with this username and email combination.');
    });

    it('should throw 403 if user account is inactive', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: '123', username: 'inactive_user', status: 'INACTIVE' }] });

      await expect(requestPasswordReset({ email: 'inactive@test.com', username: 'inactive_user' })).rejects.toThrow('This account is inactive.');
    });
  });

  describe('resetPasswordWithToken', () => {
    it('should reset password successfully with valid code and correct email', async () => {
      const mockUserRow = {
        id: '123',
        reset_token: '123456',
        reset_token_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Not expired
      };

      query
        .mockResolvedValueOnce({ rows: [mockUserRow] }) // Find user row
        .mockResolvedValueOnce({ rows: [] }); // Update password row

      bcrypt.hash.mockResolvedValueOnce('newhashedpassword');

      const result = await resetPasswordWithToken({
        email: 'admin@test.com',
        token: '123456',
        newPassword: 'newpassword123',
      });

      expect(query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(result.success).toBe(true);
    });

    it('should throw 400 if email or token is missing', async () => {
      await expect(
        resetPasswordWithToken({ email: '', token: '123456', newPassword: 'password123' })
      ).rejects.toThrow('Email and verification code are required.');

      await expect(
        resetPasswordWithToken({ email: 'admin@test.com', token: '', newPassword: 'password123' })
      ).rejects.toThrow('Email and verification code are required.');
    });

    it('should throw 400 if token check does not match', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: '123', reset_token: '123456', reset_token_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() }] });

      await expect(
        resetPasswordWithToken({ email: 'admin@test.com', token: '999999', newPassword: 'password123' })
      ).rejects.toThrow('Invalid verification code.');
    });

    it('should throw 400 if token has expired', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: '123', reset_token: '123456', reset_token_expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() }] }); // Expired 5 mins ago

      await expect(
        resetPasswordWithToken({ email: 'admin@test.com', token: '123456', newPassword: 'password123' })
      ).rejects.toThrow('Verification code has expired.');
    });
  });
});
