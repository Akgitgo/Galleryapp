/**
 * authStore tests
 * We mock storageService to avoid real AsyncStorage I/O.
 */

import { act } from '@testing-library/react-native';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'test_id_001',
  fullName: 'Ravi Sharma',
  email: 'ravi@test.com',
  gender: 'male' as const,
  mobileNumber: '9876543210',
  address: '42, MG Road, Koregaon Park',
  city: 'Pune',
  password: 'secret123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

jest.mock('../services/storageService', () => ({
  storageService: {
    getUser: jest.fn(),
    saveUser: jest.fn(),
    saveSession: jest.fn(),
    getSession: jest.fn(),
    clearSession: jest.fn(),
    emailExists: jest.fn(),
    updateUser: jest.fn(),
  },
}));

import { storageService } from '../services/storageService';
const mockStorage = storageService as jest.Mocked<typeof storageService>;

// ─── Import store after mocking ───────────────────────────────────────────────

import { useAuthStore } from '../store/authStore';

// Reset Zustand store state between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  });
  jest.clearAllMocks();
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('authStore.login', () => {
  it('validates client-side before hitting storage', async () => {
    const result = await useAuthStore.getState().login({ email: '', password: '' });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeTruthy();
    expect(result.errors?.password).toBeTruthy();
    expect(mockStorage.getUser).not.toHaveBeenCalled();
  });

  it('returns error when user not found', async () => {
    mockStorage.getUser.mockResolvedValue(null);
    const result = await useAuthStore
      .getState()
      .login({ email: 'unknown@test.com', password: 'pass123' });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toContain('No account found');
  });

  it('returns error when password is wrong', async () => {
    mockStorage.getUser.mockResolvedValue(mockUser);
    const result = await useAuthStore
      .getState()
      .login({ email: 'ravi@test.com', password: 'wrongpassword' });
    expect(result.success).toBe(false);
    expect(result.errors?.password).toContain('Incorrect password');
  });

  it('logs in successfully with correct credentials', async () => {
    mockStorage.getUser.mockResolvedValue(mockUser);
    mockStorage.saveSession.mockResolvedValue(undefined);

    const result = await useAuthStore
      .getState()
      .login({ email: 'ravi@test.com', password: 'secret123' });

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('ravi@test.com');
    expect(mockStorage.saveSession).toHaveBeenCalledWith('ravi@test.com');
  });
});

// ─── register ─────────────────────────────────────────────────────────────────

describe('authStore.register', () => {
  const validData = {
    fullName: 'Priya Singh',
    email: 'priya@test.com',
    gender: 'female' as const,
    mobileNumber: '9123456780',
    address: '10, Park Street, Bandra West',
    city: 'Mumbai',
    password: 'priya123',
    confirmPassword: 'priya123',
  };

  it('validates before saving', async () => {
    const result = await useAuthStore.getState().register({
      ...validData,
      email: 'bademail',
    });
    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeTruthy();
    expect(mockStorage.emailExists).not.toHaveBeenCalled();
  });

  it('returns error if email already registered', async () => {
    mockStorage.emailExists.mockResolvedValue(true);
    const result = await useAuthStore.getState().register(validData);
    expect(result.success).toBe(false);
    expect(result.errors?.email).toContain('already exists');
  });

  it('creates user and sets session on success', async () => {
    mockStorage.emailExists.mockResolvedValue(false);
    mockStorage.saveUser.mockResolvedValue(undefined);
    mockStorage.saveSession.mockResolvedValue(undefined);

    const result = await useAuthStore.getState().register(validData);

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('priya@test.com');
    expect(mockStorage.saveUser).toHaveBeenCalledTimes(1);
    expect(mockStorage.saveSession).toHaveBeenCalledWith('priya@test.com');
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('authStore.logout', () => {
  it('clears session and user state', async () => {
    // Set up authenticated state
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    mockStorage.clearSession.mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockStorage.clearSession).toHaveBeenCalledTimes(1);
  });
});

// ─── initAuth ─────────────────────────────────────────────────────────────────

describe('authStore.initAuth', () => {
  it('restores session from storage', async () => {
    mockStorage.getSession.mockResolvedValue('ravi@test.com');
    mockStorage.getUser.mockResolvedValue(mockUser);

    await useAuthStore.getState().initAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('ravi@test.com');
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it('clears stale session when user not found', async () => {
    mockStorage.getSession.mockResolvedValue('ghost@test.com');
    mockStorage.getUser.mockResolvedValue(null);

    await useAuthStore.getState().initAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockStorage.clearSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it('sets isInitialized even with no session', async () => {
    mockStorage.getSession.mockResolvedValue(null);

    await useAuthStore.getState().initAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('authStore.updateProfile', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
  });

  it('validates edit data before saving', async () => {
    const result = await useAuthStore.getState().updateProfile({
      fullName: '',
      mobileNumber: '9876543210',
      gender: 'male',
      address: '42, MG Road, Koregaon Park',
      city: 'Pune',
    });
    expect(result.success).toBe(false);
    expect(result.errors?.fullName).toBeTruthy();
    expect(mockStorage.updateUser).not.toHaveBeenCalled();
  });

  it('saves and updates state on success', async () => {
    mockStorage.updateUser.mockResolvedValue(undefined);

    const result = await useAuthStore.getState().updateProfile({
      fullName: 'Ravi Kumar Sharma',
      mobileNumber: '9876543210',
      gender: 'male',
      address: '42, MG Road, Koregaon Park, Pune',
      city: 'Pune',
    });

    expect(result.success).toBe(true);
    expect(useAuthStore.getState().user?.fullName).toBe('Ravi Kumar Sharma');
    expect(mockStorage.updateUser).toHaveBeenCalledTimes(1);
  });
});
