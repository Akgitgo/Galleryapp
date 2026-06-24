import { RegisterData, LoginCredentials, EditProfileData, ValidationResult } from '../types';

// ─── Individual field validators ─────────────────────────────────────────────

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateFullName = (name: string): string | null => {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Full name can only contain letters, spaces, hyphens and apostrophes';
  return null;
};

export const validateMobile = (mobile: string): string | null => {
  if (!mobile.trim()) return 'Mobile number is required';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Mobile number must be exactly 10 digits';
  if (!/^[6-9]\d{9}$/.test(cleaned)) return 'Please enter a valid Indian mobile number';
  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address.trim()) return 'Address is required';
  if (address.trim().length < 10) return 'Please enter a complete address (min 10 characters)';
  return null;
};

export const validateCity = (city: string): string | null => {
  if (!city.trim()) return 'Please select a city';
  return null;
};

export const validateGender = (gender: string): string | null => {
  if (!gender) return 'Please select your gender';
  if (!['male', 'female', 'other'].includes(gender)) return 'Invalid gender selection';
  return null;
};

// ─── Form-level validators ────────────────────────────────────────────────────

export const validateLogin = (data: LoginCredentials): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegister = (data: RegisterData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nameError = validateFullName(data.fullName);
  if (nameError) errors.fullName = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const genderError = validateGender(data.gender);
  if (genderError) errors.gender = genderError;

  const mobileError = validateMobile(data.mobileNumber);
  if (mobileError) errors.mobileNumber = mobileError;

  const addressError = validateAddress(data.address);
  if (addressError) errors.address = addressError;

  const cityError = validateCity(data.city);
  if (cityError) errors.city = cityError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateEditProfile = (data: EditProfileData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nameError = validateFullName(data.fullName);
  if (nameError) errors.fullName = nameError;

  const mobileError = validateMobile(data.mobileNumber);
  if (mobileError) errors.mobileNumber = mobileError;

  const genderError = validateGender(data.gender);
  if (genderError) errors.gender = genderError;

  const addressError = validateAddress(data.address);
  if (addressError) errors.address = addressError;

  const cityError = validateCity(data.city);
  if (cityError) errors.city = cityError;

  return { isValid: Object.keys(errors).length === 0, errors };
};
