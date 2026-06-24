import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { PicsumImage } from '../../types';
import { getThumbnailUrl, truncate } from '../../utils/helpers';
import { spacing, radius, fontSize, fontWeight, shadows } from '../../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.base * 2 - spacing.sm) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.75;

interface ImageCardProps {
  image: PicsumImage;
  isFavorite: boolean;
  onPress: (image: PicsumImage) => void;
  onFavoritePress: (imageId: string) => void;
}

const ImageCard = memo<ImageCardProps>(({ image, isFavorite, onPress, onFavoritePress }) => {
  const colors = useColors();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const heartScale = React.useRef(new Animated.Value(1)).current;

  const thumbnailUri = getThumbnailUrl(image.id);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress(image));
  }, [image, onPress, scaleAnim]);

  const handleFavorite = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation?.();
      // Bounce animation
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
        Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
      ]).start();
      onFavoritePress(image.id);
    },
    [image.id, onFavoritePress, heartScale],
  );

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePress}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, shadows.md]}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {!imageLoaded && !imageError && (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.shimmer }]} />
          )}
          {imageError ? (
            <View style={[styles.imageError, { backgroundColor: colors.borderLight }]}>
              <Ionicons name="image-outline" size={32} color={colors.textDisabled} />
            </View>
          ) : (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.image}
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(true); }}
              resizeMode="cover"
            />
          )}

          {/* Favorite button overlay */}
          <TouchableOpacity
            onPress={handleFavorite}
            style={[styles.favoriteBtn, { backgroundColor: colors.overlay + '99' }]}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? colors.heartActive : colors.white}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.info, { backgroundColor: colors.overlay, opacity: 0.2 }]}>
          <Text style={[styles.author, { color: colors.text }]} numberOfLines={1}>
            {truncate(image.author, 22)}
          </Text>
          <Text style={[styles.imageId, { color: colors.textSecondary }]}>
            #{image.id}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ImageCard.displayName = 'ImageCard';

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  imageError: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: spacing.sm,
    gap: 2,
  },
  author: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  imageId: {
    fontSize: fontSize.xs,
  },
});

export { CARD_WIDTH };
export default ImageCard;
