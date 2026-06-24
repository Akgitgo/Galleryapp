import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuthStore } from '../store/authStore';
import { useThemeStore, useColors } from '../store/themeStore';
import { useGalleryStore } from '../store/galleryStore';
import { RootStackParamList } from './types';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isInitialized: authInit, initAuth, user } = useAuthStore();
  const { isInitialized: themeInit, initTheme, isDark, colors } = useThemeStore();
  const { initFavorites, resetGallery } = useGalleryStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (themeInit) initAuth();
  }, [themeInit, initAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      initFavorites(user.email);
    } else if (!isAuthenticated) {
      resetGallery();
    }
  }, [isAuthenticated, user, initFavorites, resetGallery]);

  // Show splash while bootstrapping
  if (!themeInit || !authInit) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          border: colors.border,
          text: colors.text,
          primary: colors.primary,
          notification: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          border: colors.border,
          text: colors.text,
          primary: colors.primary,
          notification: colors.primary,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;
