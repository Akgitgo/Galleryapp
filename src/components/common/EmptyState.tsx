import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { spacing, fontSize, fontWeight } from '../../constants/colors';
import Button from './Button';

type EmptyStatePreset = 'noResults' | 'noFavorites' | 'error' | 'noImages' | 'custom';

interface EmptyStateProps {
  preset?: EmptyStatePreset;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

const PRESETS: Record<
  Exclude<EmptyStatePreset, 'custom'>,
  { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }
> = {
  noResults: {
    icon: 'search-outline',
    title: 'No results found',
    subtitle: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  noFavorites: {
    icon: 'heart-outline',
    title: 'No favorites yet',
    subtitle: 'Tap the heart icon on any image to add it to your favorites.',
  },
  error: {
    icon: 'cloud-offline-outline',
    title: 'Something went wrong',
    subtitle: 'Unable to load content. Please check your internet connection and try again.',
  },
  noImages: {
    icon: 'images-outline',
    title: 'No images available',
    subtitle: 'Images will appear here once they are loaded.',
  },
};

const EmptyState = memo<EmptyStateProps>(
  ({ preset = 'custom', title, subtitle, icon, actionLabel, onAction }) => {
    const colors = useColors();

    const config = preset !== 'custom' ? PRESETS[preset] : null;
    const displayIcon = icon ?? config?.icon ?? 'alert-circle-outline';
    const displayTitle = title ?? config?.title ?? 'Nothing here';
    const displaySubtitle = subtitle ?? config?.subtitle ?? '';

    return (
      <View style={styles.container}>
        <View style={[styles.iconBg, { backgroundColor: colors.borderLight }]}>
          <Ionicons name={displayIcon} size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
        {displaySubtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {displaySubtitle}
          </Text>
        ) : null}
        {actionLabel && onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            fullWidth={false}
            style={styles.button}
          />
        )}
      </View>
    );
  },
);

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});

export default EmptyState;
