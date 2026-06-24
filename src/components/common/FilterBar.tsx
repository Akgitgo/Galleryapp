import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useColors } from '../../store/themeStore';
import { spacing, radius, fontSize, fontWeight } from '../../constants/colors';
import { FilterType } from '../../types';

interface FilterOption {
  key: FilterType;
  label: string;
  shortLabel?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All Images', shortLabel: 'All' },
  { key: 'a-m', label: 'Author A–M', shortLabel: 'A–M' },
  { key: 'n-z', label: 'Author N–Z', shortLabel: 'N–Z' },
];

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  resultCount?: number;
}

const FilterBar = memo<FilterBarProps>(({ activeFilter, onFilterChange, resultCount }) => {
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => onFilterChange(option.key)}
              activeOpacity={0.75}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.primary : colors.inputBackground,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? colors.white : colors.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {resultCount !== undefined && (
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </Text>
      )}
    </View>
  );
});

FilterBar.displayName = 'FilterBar';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  count: {
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
});

export default FilterBar;
