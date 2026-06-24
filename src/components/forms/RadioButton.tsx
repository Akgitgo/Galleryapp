import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useColors } from '../../store/themeStore';
import { spacing, radius, fontSize, fontWeight } from '../../constants/colors';

interface RadioOption<T extends string> {
  label: string;
  value: T;
}

interface RadioButtonGroupProps<T extends string> {
  label: string;
  options: RadioOption<T>[];
  value: T | '';
  onChange: (value: T) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

function RadioButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  containerStyle,
}: RadioButtonGroupProps<T>) {
  const colors = useColors();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        <Text style={{ color: colors.error }}> *</Text>
      </Text>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primaryLight + '22' : colors.inputBackground,
                },
              ]}
            >
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                {isSelected && (
                  <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? fontWeight.semibold : fontWeight.regular,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flex: 1,
    minWidth: 90,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    fontSize: fontSize.base,
  },
  error: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default RadioButtonGroup;
