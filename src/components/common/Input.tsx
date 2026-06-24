import React, { memo, useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { spacing, radius, fontSize, fontWeight } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

const Input = memo(
  forwardRef<TextInput, InputProps>(
    (
      {
        label,
        error,
        hint,
        leftIcon,
        rightIcon,
        onRightIconPress,
        containerStyle,
        isPassword = false,
        ...props
      },
      ref,
    ) => {
      const colors = useColors();
      const [isFocused, setIsFocused] = useState(false);
      const [isPasswordVisible, setIsPasswordVisible] = useState(false);

      const showPasswordIcon = isPassword;
      const secureTextEntry = isPassword && !isPasswordVisible;

      const inputContainerStyle = {
        ...styles.inputContainer,
        borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
        backgroundColor: colors.inputBackground,
        borderWidth: isFocused || error ? 1.5 : 1,
      };

      return (
        <View style={[styles.wrapper, containerStyle]}>
          {label && (
            <Text style={[styles.label, { color: colors.text }]}>
              {label}
              <Text style={{ color: colors.error }}> *</Text>
            </Text>
          )}

          <View style={inputContainerStyle}>
            {leftIcon && (
              <Ionicons
                name={leftIcon}
                size={18}
                color={isFocused ? colors.primary : colors.textSecondary}
                style={styles.leftIcon}
              />
            )}

            <TextInput
              ref={ref}
              style={[styles.input, { color: colors.text }]}
              placeholderTextColor={colors.placeholder}
              secureTextEntry={secureTextEntry}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              {...props}
            />

            {showPasswordIcon && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((v) => !v)}
                style={styles.rightIcon}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            {rightIcon && !showPasswordIcon && (
              <TouchableOpacity
                onPress={onRightIconPress}
                style={styles.rightIcon}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : hint ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
          ) : null}
        </View>
      );
    },
  ),
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default Input;
