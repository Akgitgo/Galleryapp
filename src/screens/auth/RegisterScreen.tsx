import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { Gender, RegisterData } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import RadioButtonGroup from '../../components/forms/RadioButton';
import CityDropdown from '../../components/forms/CityDropdown';
import { spacing, fontSize, fontWeight, radius } from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' as Gender },
  { label: 'Female', value: 'female' as Gender },
  { label: 'Other', value: 'other' as Gender },
];

const INITIAL_FORM: RegisterData = {
  fullName: '',
  email: '',
  gender: '' as Gender,
  mobileNumber: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
};

const RegisterScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState<RegisterData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof RegisterData) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    },
    [],
  );

  const handleRegister = useCallback(async () => {
    setErrors({});
    const result = await register(form);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    }
  }, [form, register]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.text === '#F9FAFB' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Personal Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Personal Information
            </Text>

            <Input
              label="Full Name"
              value={form.fullName}
              onChangeText={updateField('fullName')}
              error={errors.fullName}
              leftIcon="person-outline"
              autoCapitalize="words"
              placeholder="e.g. Ravi Sharma"
              returnKeyType="next"
            />

            <Input
              label="Email Address"
              value={form.email}
              onChangeText={updateField('email')}
              error={errors.email}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              returnKeyType="next"
            />

            <RadioButtonGroup
              label="Gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={updateField('gender') as (v: Gender) => void}
              error={errors.gender}
            />

            <Input
              label="Mobile Number"
              value={form.mobileNumber}
              onChangeText={updateField('mobileNumber')}
              error={errors.mobileNumber}
              leftIcon="call-outline"
              keyboardType="number-pad"
              maxLength={10}
              placeholder="10-digit mobile number"
              returnKeyType="next"
              hint="Indian mobile numbers only (10 digits)"
            />
          </View>

          {/* Section: Address */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Address Details
            </Text>

            <Input
              label="Address"
              value={form.address}
              onChangeText={updateField('address')}
              error={errors.address}
              leftIcon="location-outline"
              multiline
              numberOfLines={3}
              placeholder="House/Flat No., Street, Area..."
              returnKeyType="next"
              style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
            />

            <CityDropdown
              label="City"
              value={form.city}
              onChange={(city) => {
                setForm((f) => ({ ...f, city }));
                setErrors((e) => ({ ...e, city: '' }));
              }}
              error={errors.city}
            />
          </View>

          {/* Section: Security */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Security
            </Text>

            <Input
              label="Password"
              value={form.password}
              onChangeText={updateField('password')}
              error={errors.password}
              leftIcon="lock-closed-outline"
              isPassword
              placeholder="Minimum 6 characters"
              hint="At least 6 characters"
              returnKeyType="next"
            />

            <Input
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={updateField('confirmPassword')}
              error={errors.confirmPassword}
              leftIcon="lock-closed-outline"
              isPassword
              placeholder="Re-enter your password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          {errors.general ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.error + '18', borderColor: colors.error + '44' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorBannerText, { color: colors.error }]}>
                {errors.general}
              </Text>
            </View>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerBtn}
          />

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  registerBtn: {
    marginBottom: spacing.base,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: { fontSize: fontSize.base },
  loginLink: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});

export default RegisterScreen;
