import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useColors, useThemeStore } from '../../store/themeStore';
import { useGalleryStore, selectFilteredImages, selectIsFavorite } from '../../store/galleryStore';
import { useAuthStore } from '../../store/authStore';
import { useSearch } from '../../hooks/useSearch';
import { usePagination } from '../../hooks/usePagination';
import { PicsumImage } from '../../types';
import { HomeStackParamList } from '../../navigation/types';

import ImageCard, { CARD_WIDTH } from '../../components/common/ImageCard';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid, FooterLoader } from '../../components/common/Loader';
import { spacing, fontSize, fontWeight } from '../../constants/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const { toggleTheme, isDark } = useThemeStore();
  const { user } = useAuthStore();

  const {
    isLoading,
    filterType,
    setFilterType,
    fetchImages,
    toggleFavorite,
    error,
    clearError,
    allImages,
  } = useGalleryStore();

  const filteredImages = useGalleryStore(selectFilteredImages);
  const { handleRefresh, handleEndReached, endReachedThreshold, isRefreshing, isLoadingMore } =
    usePagination();
  const { searchQuery, handleSearchChange, clearSearch } = useSearch();

  // Initial load
  useEffect(() => {
    if (allImages.length === 0) {
      fetchImages();
    }
  }, [allImages.length, fetchImages]);

  const handleImagePress = useCallback(
    (image: PicsumImage) => {
      navigation.navigate('ImageDetails', { image });
    },
    [navigation],
  );

  const handleFavorite = useCallback(
    (imageId: string) => {
      if (user) {
        toggleFavorite(imageId, user.email);
      }
    },
    [user, toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }) => (
      <ImageCardWrapper
        image={item}
        onPress={handleImagePress}
        onFavoritePress={handleFavorite}
      />
    ),
    [handleImagePress, handleFavorite],
  );

  const keyExtractor = useCallback((item: PicsumImage) => item.id, []);

  const ListFooter = useCallback(() => {
    if (isLoadingMore) return <FooterLoader />;
    return null;
  }, [isLoadingMore]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return <SkeletonGrid />;
    if (error) {
      return (
        <EmptyState
          preset="error"
          subtitle={error}
          actionLabel="Retry"
          onAction={() => { clearError(); fetchImages(true); }}
        />
      );
    }
    return (
      <EmptyState
        preset={searchQuery || filterType !== 'all' ? 'noResults' : 'noImages'}
        actionLabel={searchQuery ? 'Clear search' : undefined}
        onAction={clearSearch}
      />
    );
  }, [isLoading, error, searchQuery, filterType, clearError, fetchImages, clearSearch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Hello, {user?.fullName.split(' ')[0]} 👋
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Gallery</Text>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClear={clearSearch}
        />
      </View>

      {/* Filter */}
      <FilterBar
        activeFilter={filterType}
        onFilterChange={setFilterType}
        resultCount={!isLoading ? filteredImages.length : undefined}
      />

      {/* Gallery FlatList */}
      <FlatList
        data={filteredImages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={endReachedThreshold}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH * 0.75 + 58,
          offset: (CARD_WIDTH * 0.75 + 58) * Math.floor(index / 2),
          index,
        })}
      />
    </SafeAreaView>
  );
};

// Separate wrapper to isolate re-renders per card's isFavorite
const ImageCardWrapper = React.memo(
  ({
    image,
    onPress,
    onFavoritePress,
  }: {
    image: PicsumImage;
    onPress: (img: PicsumImage) => void;
    onFavoritePress: (id: string) => void;
  }) => {
    const isFavorite = useGalleryStore(selectIsFavorite(image.id));
    return (
      <ImageCard
        image={image}
        isFavorite={isFavorite}
        onPress={onPress}
        onFavoritePress={onFavoritePress}
      />
    );
  },
);

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
  greeting: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchWrapper: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});

export default HomeScreen;
