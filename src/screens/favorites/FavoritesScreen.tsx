import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useColors, useIsDark } from '../../store/themeStore';
import { useGalleryStore } from '../../store/galleryStore';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import { applySearch } from '../../utils/helpers';
import { PicsumImage } from '../../types';
import { FavoritesStackParamList } from '../../navigation/types';

import ImageCard, { CARD_WIDTH } from '../../components/common/ImageCard';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { spacing, fontSize, fontWeight } from '../../constants/colors';

type Props = NativeStackScreenProps<FavoritesStackParamList, 'FavoritesHome'>;

const FavoritesScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const isDark = useIsDark();
  const { user } = useAuthStore();
  const { allImages, favorites, toggleFavorite } = useGalleryStore();

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 350);

  // Derive favorite images from allImages (includes only loaded ones)
  const favoriteImages = allImages.filter((img) => favorites.includes(img.id));
  const displayImages = applySearch(favoriteImages, debouncedSearch);

  const handleImagePress = useCallback(
    (image: PicsumImage) => {
      navigation.navigate('ImageDetails', { image, fromFavorites: true });
    },
    [navigation],
  );

  const handleFavorite = useCallback(
    (imageId: string) => {
      if (!user) return;
      Alert.alert(
        'Remove from Favorites',
        'Remove this image from your favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => toggleFavorite(imageId, user.email),
          },
        ],
      );
    },
    [user, toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }) => (
      <ImageCard
        image={item}
        isFavorite={true}
        onPress={handleImagePress}
        onFavoritePress={handleFavorite}
      />
    ),
    [handleImagePress, handleFavorite],
  );

  const keyExtractor = useCallback((item: PicsumImage) => item.id, []);

  const ListEmpty = useCallback(
    () =>
      debouncedSearch ? (
        <EmptyState
          preset="noResults"
          actionLabel="Clear search"
          onAction={() => setSearchText('')}
        />
      ) : (
        <EmptyState preset="noFavorites" />
      ),
    [debouncedSearch],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
        <View style={styles.headerRight}>
          {favorites.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{favorites.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      {favoriteImages.length > 0 || searchText ? (
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onClear={() => setSearchText('')}
            placeholder="Search favorites by author..."
          />
          {debouncedSearch && (
            <Text style={[styles.resultHint, { color: colors.textSecondary }]}>
              {displayImages.length} of {favoriteImages.length} favorites
            </Text>
          )}
        </View>
      ) : null}

      <FlatList
        data={displayImages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={8}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  searchWrapper: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  resultHint: {
    fontSize: fontSize.xs,
    paddingLeft: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});

export default FavoritesScreen;
