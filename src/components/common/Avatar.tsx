import React, { memo, useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../store/themeStore';
import { getInitials } from '../../utils/helpers';
import { fontWeight } from '../../constants/colors';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 36,
  md: 52,
  lg: 72,
  xl: 100,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  sm: 13,
  md: 18,
  lg: 26,
  xl: 36,
};

interface AvatarProps {
  name: string;
  uri?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const Avatar = memo<AvatarProps>(({ name, uri, size = 'md', style }) => {
  const colors = useColors();
  const [imgError, setImgError] = useState(false);
  const dimension = SIZE_MAP[size];
  const fs = FONT_SIZE_MAP[size];

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const showImage = uri && !imgError;

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: colors.primaryLight },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, containerStyle]}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize: fs, color: colors.white }]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  initials: {
    fontWeight: fontWeight.bold,
  },
});

export default Avatar;
