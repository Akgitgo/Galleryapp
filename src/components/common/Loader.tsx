import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useColors } from '../../store/themeStore';
import { spacing, radius } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.base * 2 - spacing.sm) / 2;

// ─── Full-screen spinner ──────────────────────────────────────────────────────

export const FullScreenLoader = memo(() => {
  const colors = useColors();
  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
});
FullScreenLoader.displayName = 'FullScreenLoader';

// ─── Inline spinner ───────────────────────────────────────────────────────────

export const InlineLoader = memo(({ color }: { color?: string }) => {
  const colors = useColors();
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={color ?? colors.primary} />
    </View>
  );
});
InlineLoader.displayName = 'InlineLoader';

// ─── Skeleton shimmer card ────────────────────────────────────────────────────

const SkeletonCard = memo(() => {
  const colors = useColors();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: colors.card,
          width: CARD_WIDTH,
          opacity,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.skeletonImage, { backgroundColor: colors.shimmer }]} />
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.shimmer, width: '70%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.shimmer, width: '40%', marginTop: 6 }]} />
      </View>
    </Animated.View>
  );
});
SkeletonCard.displayName = 'SkeletonCard';

// ─── Skeleton grid (6 cards) ──────────────────────────────────────────────────

export const SkeletonGrid = memo(() => {
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
});
SkeletonGrid.displayName = 'SkeletonGrid';

// ─── Footer loader (load more) ────────────────────────────────────────────────

export const FooterLoader = memo(() => {
  const colors = useColors();
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
});
FooterLoader.displayName = 'FooterLoader';

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: spacing.md,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  skeletonImage: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  skeletonBody: {
    padding: spacing.sm,
  },
  skeletonLine: {
    height: 10,
    borderRadius: radius.xs,
  },
});
