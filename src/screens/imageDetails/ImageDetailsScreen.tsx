import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  Share,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { useColors, useIsDark } from '../../store/themeStore';
import { useGalleryStore, selectIsFavorite } from '../../store/galleryStore';
import { useAuthStore } from '../../store/authStore';
import { HomeStackParamList } from '../../navigation/types';
import { getThumbnailUrl } from '../../utils/helpers';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'ImageDetails'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImageDetailsScreen = ({ route, navigation }: Props) => {
  const { image } = route.params;
  const colors = useColors();
  const isDark = useIsDark();
  const { user } = useAuthStore();

  const isFavorite = useGalleryStore(selectIsFavorite(image.id));
  const toggleFavorite = useGalleryStore((s) => s.toggleFavorite);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  const downloadProgress = useRef(new Animated.Value(0)).current;

  // We use the image download_url for full resolution
  const fullSizeUri = `https://picsum.photos/id/${image.id}/1200/800`;
  const downloadUri = image.download_url;

  const handleFavorite = useCallback(() => {
    if (user) toggleFavorite(image.id, user.email);
  }, [user, image.id, toggleFavorite]);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to save images.',
        [{ text: 'OK' }],
      );
      return;
    }

    setIsDownloading(true);
    downloadProgress.setValue(0);

    try {
      const fileName = `picsum_${image.id}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUri,
        fileUri,
        {},
        (progress) => {
          const pct =
            progress.totalBytesExpectedToWrite > 0
              ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
              : 0;
          downloadProgress.setValue(pct);
        },
      );

      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');

      await MediaLibrary.saveToLibraryAsync(result.uri);

      // Clean up temp file
      await FileSystem.deleteAsync(result.uri, { idempotent: true });

      Alert.alert('Saved!', 'Image saved to your gallery.', [{ text: 'Great!' }]);
    } catch (err) {
      Alert.alert('Download Failed', 'Unable to save image. Please try again.');
    } finally {
      setIsDownloading(false);
      downloadProgress.setValue(0);
    }
  }, [isDownloading, downloadUri, image.id, downloadProgress]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        // Download to temp file then share
        const tempUri = `${FileSystem.cacheDirectory}share_${image.id}.jpg`;
        await FileSystem.downloadAsync(fullSizeUri, tempUri);
        await Sharing.shareAsync(tempUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Photo by ${image.author}`,
        });
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } else {
        await Share.share({
          message: `Check out this photo by ${image.author}!\n${image.url}`,
          url: image.url,
          title: `Photo by ${image.author}`,
        });
      }
    } catch {
      // User cancelled — not an error
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, image, fullSizeUri]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Navigation Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Image #{image.id}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleFavorite}
            style={[styles.iconBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.heartActive : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.iconBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="share-outline" size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Main Image */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setFullScreenVisible(true)}
          style={styles.imageWrapper}
        >
          {!imageLoaded && !imageError && (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.shimmer }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          {imageError ? (
            <View style={[styles.imageError, { backgroundColor: colors.borderLight }]}>
              <Ionicons name="image-outline" size={48} color={colors.textDisabled} />
              <Text style={[styles.imageErrorText, { color: colors.textSecondary }]}>
                Unable to load image
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: fullSizeUri }}
              style={styles.mainImage}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(true); }}
            />
          )}
          {imageLoaded && !imageError && (
            <View style={[styles.expandHint, { backgroundColor: colors.overlay + 'BB' }]}>
              <Ionicons name="expand-outline" size={16} color="#fff" />
              <Text style={styles.expandText}>Tap to view full screen</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Image Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.md]}>
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: colors.primaryLight + '44' }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorLabel, { color: colors.textSecondary }]}>Photographer</Text>
              <Text style={[styles.authorName, { color: colors.text }]}>{image.author}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.metaGrid}>
            <MetaItem label="Image ID" value={`#${image.id}`} colors={colors} />
            <MetaItem label="Resolution" value={`${image.width} × ${image.height}`} colors={colors} />
          </View>
        </View>

        {/* Download Button */}
        <View style={styles.downloadSection}>
          <TouchableOpacity
            onPress={handleDownload}
            activeOpacity={0.85}
            disabled={isDownloading}
            style={[
              styles.downloadBtn,
              { backgroundColor: colors.primary },
              isDownloading && { opacity: 0.7 },
            ]}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.downloadText}>Saving to Gallery…</Text>
              </>
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.downloadText}>Download Image</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            disabled={isSharing}
            style={[styles.shareBtn, { borderColor: colors.primary }]}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            <Text style={[styles.shareText, { color: colors.primary }]}>Share Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full-screen Modal */}
      <Modal
        visible={fullScreenVisible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View style={styles.fullScreen}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <Image
            source={{ uri: fullSizeUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <SafeAreaView style={styles.fullScreenOverlay} edges={['top', 'bottom']}>
            <TouchableOpacity
              onPress={() => setFullScreenVisible(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Full-screen download button */}
            <TouchableOpacity
              onPress={() => { setFullScreenVisible(false); handleDownload(); }}
              style={styles.fullScreenDownload}
              disabled={isDownloading}
            >
              <Ionicons name="download-outline" size={22} color="#fff" />
              <Text style={styles.fullScreenDownloadText}>Save</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const MetaItem = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) => (
  <View style={styles.metaItem}>
    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.7,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageError: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  imageErrorText: {
    fontSize: fontSize.sm,
  },
  expandHint: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  expandText: {
    color: '#fff',
    fontSize: fontSize.xs,
  },
  infoCard: {
    margin: spacing.base,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: { flex: 1 },
  authorLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  downloadSection: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  downloadText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  shareText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  // Full screen
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: spacing.base,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenDownload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    height: 44,
  },
  fullScreenDownloadText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});

export default ImageDetailsScreen;
