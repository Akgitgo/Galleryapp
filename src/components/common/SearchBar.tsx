import React, { memo, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../store/themeStore';
import { spacing, radius, fontSize } from '../../constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar = memo<SearchBarProps>(
  ({ value, onChangeText, onClear, placeholder = 'Search by author name…', autoFocus = false }) => {
    const colors = useColors();
    const inputRef = useRef<TextInput>(null);
    const clearOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;

    const handleChange = (text: string) => {
      onChangeText(text);
      Animated.timing(clearOpacity, {
        toValue: text.length > 0 ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handleClear = () => {
      onClear();
      inputRef.current?.clear();
      inputRef.current?.blur();
      Animated.timing(clearOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          clearButtonMode="never"
        />
        <Animated.View style={{ opacity: clearOpacity }}>
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.xs,
  },
  searchIcon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: 0,
  },
});

export default SearchBar;
