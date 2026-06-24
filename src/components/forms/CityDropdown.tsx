import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { CITIES } from '../../constants/cities';
import { spacing, radius, fontSize, fontWeight } from '../../constants/colors';

interface CityDropdownProps {
  label?: string;
  value: string;
  onChange: (city: string) => void;
  error?: string;
  placeholder?: string;
}

const CityDropdown = memo<CityDropdownProps>(
  ({ label = 'City', value, onChange, error, placeholder = 'Select your city' }) => {
    const colors = useColors();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredCities = searchText
      ? CITIES.filter((c) => c.toLowerCase().includes(searchText.toLowerCase()))
      : CITIES;

    const handleSelect = useCallback(
      (city: string) => {
        onChange(city);
        setModalVisible(false);
        setSearchText('');
      },
      [onChange],
    );

    const handleClose = useCallback(() => {
      setModalVisible(false);
      setSearchText('');
    }, []);

    return (
      <View style={styles.wrapper}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>
            {label}
            <Text style={{ color: colors.error }}> *</Text>
          </Text>
        )}

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          style={[
            styles.trigger,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.triggerText,
              { color: value ? colors.text : colors.placeholder },
            ]}
          >
            {value || placeholder}
          </Text>
          <Ionicons
            name={modalVisible ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}

        {/* City picker modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={handleClose}
        >
          <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
            <SafeAreaView
              style={[styles.sheet, { backgroundColor: colors.surface }]}
            >
              <StatusBar barStyle="default" />

              {/* Handle bar */}
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Select City
                </Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: colors.inputBackground, borderColor: colors.border },
                ]}
              >
                <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search cities..."
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="words"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* City list */}
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = value === item;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                      style={[
                        styles.cityItem,
                        { borderBottomColor: colors.borderLight },
                        isSelected && { backgroundColor: colors.primaryLight + '22' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cityText,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? fontWeight.semibold : fontWeight.regular,
                          },
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={[styles.noResults, { color: colors.textSecondary }]}>
                    No cities found
                  </Text>
                }
              />
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    );
  },
);

CityDropdown.displayName = 'CityDropdown';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    fontSize: fontSize.base,
    flex: 1,
  },
  error: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '75%',
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: 0,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityText: {
    fontSize: fontSize.base,
  },
  noResults: {
    textAlign: 'center',
    paddingVertical: spacing.xxl,
    fontSize: fontSize.base,
  },
});

export default CityDropdown;
