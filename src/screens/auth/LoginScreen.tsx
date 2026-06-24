import React, { useState, useRef, useCallback } from 'react';
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
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { spacing, fontSize, fontWeight, radius } from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleLogin = useCallback(async () => {
    setFieldErrors({});
    const result = await login({ email: email.trim(), password });
    if (!result.success && result.errors) {
      setFieldErrors(result.errors);
      shake();
    }
  }, [email, password, login, shake]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.text === '#F9FAFB' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="images" size={40} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>GalleryApp</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Your curated photo experience
            </Text>
          </View>

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue
            </Text>

            <View style={styles.form}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); }}
                error={fieldErrors.email}
                leftIcon="mail-outline"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder="your@email.com"
              />
              <Input
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: '' })); }}
                error={fieldErrors.password}
                leftIcon="lock-closed-outline"
                isPassword
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholder="••••••••"
              />

              {fieldErrors.general ? (
                <View style={[styles.generalError, { backgroundColor: colors.error + '18', borderColor: colors.error + '44' }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={[styles.generalErrorText, { color: colors.error }]}>
                    {fieldErrors.general}
                  </Text>
                </View>
              ) : null}

              <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                style={styles.loginBtn}
              />
            </View>
          </Animated.View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={[styles.link, { color: colors.primary }]}>Create one</Text>
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.base,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.xs },
  loginBtn: { marginTop: spacing.sm },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  generalErrorText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontSize: fontSize.base },
  link: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});

export default LoginScreen;
