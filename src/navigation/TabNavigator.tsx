import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useColors } from '../store/themeStore';
import { useGalleryStore } from '../store/galleryStore';

import {
  TabParamList,
  HomeStackParamList,
  FavoritesStackParamList,
  ProfileStackParamList,
} from './types';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ImageDetailsScreen from '../screens/imageDetails/ImageDetailsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// ─── Stack navigators ─────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="ImageDetails"
        component={ImageDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </HomeStack.Navigator>
  );
}

const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="FavoritesHome" component={FavoritesScreen} />
      <FavoritesStack.Screen
        name="ImageDetails"
        component={ImageDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </FavoritesStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </ProfileStack.Navigator>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const colors = useColors();
  const favoritesCount = useGalleryStore((s) => s.favorites.length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'FavoritesTab' && favoritesCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.heartActive }]}
                />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Gallery' }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackNavigator}
        options={{ tabBarLabel: 'Favorites' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TabNavigator;
