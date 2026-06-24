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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useColors, useIsDark } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { ProfileStackParamList } from '../../navigation/types';
import { Gender, EditProfileData } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import RadioButtonGroup from '../../components/forms/RadioButton';
import CityDropdown from '../../components/forms/CityDropdown';
import { spacing, fontSize, fontWeight, radius } from '../../constants/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' as Gender },
  { label: 'Female', value: 'female' as Gender },
  { label: 'Other', value: 'other' as Gender },
];

const EditProfileScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const isDark = useIsDark();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [form, setForm] = useState<EditProfileData>({
    fullName: user?.fullName ?? '',
    mobileNumber: user?.mobileNumber ?? '',
    gender: user?.gender ?? 'male',
    address: user?.address ?? '',
    city: user?.city ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback(
    <K extends keyof EditProfileData>(field: K) =>
      (value: EditProfileData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setIsDirty(true);
      },
    [],
  );

  const handleSave = useCallback(async () => {
    setErrors({});
    const result = await updateProfile(form);
    if (result.success) {
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } else if (result.errors) {
      setErrors(result.errors);
    }
  }, [form, updateProfile, navigation]);

  const handleDiscard = useCallback(() => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Discard Changes',
      'Your unsaved changes will be lost. Continue?',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ],
    );
  }, [isDirty, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleDiscard} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !isDirty}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text
            style={[
              styles.saveText,
              { color: isDirty ? colors.primary : colors.textDisabled },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
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
          {/* Non-editable email notice */}
          <View style={[styles.emailNotice, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.emailNoticeText, { color: colors.textSecondary }]}>
              Email cannot be changed: <Text style={{ fontWeight: fontWeight.semibold }}>{user?.email}</Text>
            </Text>
          </View>

          {/* Personal Info */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Personal Information</Text>

          <Input
            label="Full Name"
            value={form.fullName}
            onChangeText={(v) => { updateField('fullName')(v); }}
            error={errors.fullName}
            leftIcon="person-outline"
            autoCapitalize="words"
            placeholder="Your full name"
          />

          <RadioButtonGroup
            label="Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(v) => { updateField('gender')(v); }}
            error={errors.gender}
          />

          <Input
            label="Mobile Number"
            value={form.mobileNumber}
            onChangeText={(v) => { updateField('mobileNumber')(v); }}
            error={errors.mobileNumber}
            leftIcon="call-outline"
            keyboardType="number-pad"
            maxLength={10}
            placeholder="10-digit mobile number"
          />

          {/* Address */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Address</Text>

          <Input
            label="Address"
            value={form.address}
            onChangeText={(v) => { updateField('address')(v); }}
            error={errors.address}
            leftIcon="location-outline"
            multiline
            numberOfLines={3}
            placeholder="House/Flat No., Street, Area..."
            style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />

          <CityDropdown
            label="City"
            value={form.city}
            onChange={(v) => { updateField('city')(v); }}
            error={errors.city}
          />

          {errors.general ? (
            <View style={[styles.errorBox, { backgroundColor: colors.error + '18', borderColor: colors.error + '44' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.general}</Text>
            </View>
          ) : null}

          <Button
            title="Save Changes"
            onPress={handleSave}
            isLoading={isLoading}
            disabled={!isDirty}
            style={styles.saveBtn}
          />
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
  saveText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  emailNoticeText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});

export default EditProfileScreen;
