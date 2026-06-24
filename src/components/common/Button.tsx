import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useColors } from '../../store/themeStore';
import { spacing, radius, fontSize, fontWeight } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = memo<ButtonProps>(
  ({
    title,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    disabled,
    style,
    textStyle,
    ...props
  }) => {
    const colors = useColors();

    const isDisabled = disabled || isLoading;

    const containerStyle: ViewStyle = {
      ...styles.base,
      ...sizeStyles[size],
      ...getVariantStyle(variant, colors),
      ...(fullWidth && styles.fullWidth),
      ...(isDisabled && styles.disabled),
      ...style,
    };

    const labelStyle: TextStyle = {
      ...styles.label,
      ...labelSizeStyles[size],
      ...getLabelVariantStyle(variant, colors),
      ...(isDisabled && styles.labelDisabled),
      ...textStyle,
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        style={containerStyle}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.white : colors.primary}
          />
        ) : (
          <>
            {leftIcon}
            <Text style={labelStyle}>{title}</Text>
            {rightIcon}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

const getVariantStyle = (variant: ButtonVariant, colors: ReturnType<typeof useColors>): ViewStyle => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.primary };
    case 'secondary':
      return { backgroundColor: colors.primaryLight };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return { backgroundColor: colors.error };
    default:
      return { backgroundColor: colors.primary };
  }
};

const getLabelVariantStyle = (
  variant: ButtonVariant,
  colors: ReturnType<typeof useColors>,
): TextStyle => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return { color: colors.white };
    case 'secondary':
      return { color: colors.primary };
    case 'outline':
    case 'ghost':
      return { color: colors.primary };
    default:
      return { color: colors.white };
  }
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  labelDisabled: {
    opacity: 0.8,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  lg: { paddingVertical: spacing.base, paddingHorizontal: spacing.xxl },
};

const labelSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.base },
  lg: { fontSize: fontSize.md },
};

export default Button;
