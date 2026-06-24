import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateMobile,
  validateAddress,
  validateCity,
  validateLogin,
  validateRegister,
  validateEditProfile,
} from '../utils/validation';

// ─── validateEmail ─────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  it('returns error for empty string', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it('returns error for whitespace-only input', () => {
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('returns error for invalid format (no @)', () => {
    expect(validateEmail('invalidemail.com')).toBe('Please enter a valid email address');
  });

  it('returns error for invalid format (no domain)', () => {
    expect(validateEmail('user@')).toBe('Please enter a valid email address');
  });

  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('ravi.sharma@gmail.com')).toBeNull();
  });

  it('accepts email with subdomains', () => {
    expect(validateEmail('user@mail.company.in')).toBeNull();
  });
});

// ─── validatePassword ──────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for password shorter than 6 chars', () => {
    expect(validatePassword('abc')).toBe('Password must be at least 6 characters');
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters');
  });

  it('returns null for valid password', () => {
    expect(validatePassword('password')).toBeNull();
    expect(validatePassword('123456')).toBeNull();
    expect(validatePassword('P@ssw0rd!')).toBeNull();
  });
});

// ─── validateFullName ─────────────────────────────────────────────────────────

describe('validateFullName', () => {
  it('returns error for empty name', () => {
    expect(validateFullName('')).toBe('Full name is required');
  });

  it('returns error for single character', () => {
    expect(validateFullName('A')).toBe('Full name must be at least 2 characters');
  });

  it('returns error for name with numbers', () => {
    expect(validateFullName('John123')).toBeTruthy();
  });

  it('returns null for valid names', () => {
    expect(validateFullName('Ravi Sharma')).toBeNull();
    expect(validateFullName("O'Brien")).toBeNull();
    expect(validateFullName('Mary-Jane')).toBeNull();
  });
});

// ─── validateMobile ───────────────────────────────────────────────────────────

describe('validateMobile', () => {
  it('returns error for empty input', () => {
    expect(validateMobile('')).toBe('Mobile number is required');
  });

  it('returns error for less than 10 digits', () => {
    expect(validateMobile('987654321')).toBe('Mobile number must be exactly 10 digits');
  });

  it('returns error for more than 10 digits', () => {
    expect(validateMobile('98765432100')).toBe('Mobile number must be exactly 10 digits');
  });

  it('returns error for non-Indian number (starts with 1-5)', () => {
    expect(validateMobile('1234567890')).toBe('Please enter a valid Indian mobile number');
  });

  it('returns null for valid 10-digit Indian mobile numbers', () => {
    expect(validateMobile('9876543210')).toBeNull();
    expect(validateMobile('8765432109')).toBeNull();
    expect(validateMobile('7654321098')).toBeNull();
    expect(validateMobile('6543210987')).toBeNull();
  });

  it('strips non-digit characters before validating', () => {
    expect(validateMobile('+91 9876543210')).toBeTruthy(); // length after cleaning > 10
    expect(validateMobile('98765 43210')).toBeNull(); // 10 digits after cleaning
  });
});

// ─── validateAddress ──────────────────────────────────────────────────────────

describe('validateAddress', () => {
  it('returns error for empty address', () => {
    expect(validateAddress('')).toBe('Address is required');
  });

  it('returns error for short address (< 10 chars)', () => {
    expect(validateAddress('123 St')).toBe(
      'Please enter a complete address (min 10 characters)',
    );
  });

  it('returns null for valid address', () => {
    expect(validateAddress('42, MG Road, Koregaon Park')).toBeNull();
  });
});

// ─── validateCity ─────────────────────────────────────────────────────────────

describe('validateCity', () => {
  it('returns error for empty city', () => {
    expect(validateCity('')).toBe('Please select a city');
  });

  it('returns null for non-empty city', () => {
    expect(validateCity('Pune')).toBeNull();
  });
});

// ─── validateLogin (form-level) ───────────────────────────────────────────────

describe('validateLogin', () => {
  it('returns invalid with both errors for empty form', () => {
    const result = validateLogin({ email: '', password: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.password).toBeTruthy();
  });

  it('returns valid for correct credentials', () => {
    const result = validateLogin({ email: 'user@test.com', password: 'pass123' });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

// ─── validateRegister (form-level) ───────────────────────────────────────────

describe('validateRegister', () => {
  const validData = {
    fullName: 'Ravi Sharma',
    email: 'ravi@example.com',
    gender: 'male' as const,
    mobileNumber: '9876543210',
    address: '42, MG Road, Koregaon Park',
    city: 'Pune',
    password: 'secure123',
    confirmPassword: 'secure123',
  };

  it('returns valid for a fully correct form', () => {
    const result = validateRegister(validData);
    expect(result.isValid).toBe(true);
  });

  it('returns error when passwords do not match', () => {
    const result = validateRegister({ ...validData, confirmPassword: 'different' });
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBe('Passwords do not match');
  });

  it('returns error when confirmPassword is empty', () => {
    const result = validateRegister({ ...validData, confirmPassword: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.confirmPassword).toBe('Please confirm your password');
  });

  it('returns multiple errors for multiple invalid fields', () => {
    const result = validateRegister({
      ...validData,
      email: 'bademail',
      mobileNumber: '123',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.mobileNumber).toBeTruthy();
  });
});

// ─── validateEditProfile (form-level) ────────────────────────────────────────

describe('validateEditProfile', () => {
  const validEdit = {
    fullName: 'Priya Singh',
    mobileNumber: '9123456780',
    gender: 'female' as const,
    address: 'Flat 5B, Green Valley Apartments',
    city: 'Mumbai',
  };

  it('returns valid for correct edit data', () => {
    expect(validateEditProfile(validEdit).isValid).toBe(true);
  });

  it('returns invalid when required field is empty', () => {
    const result = validateEditProfile({ ...validEdit, fullName: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.fullName).toBeTruthy();
  });
});
