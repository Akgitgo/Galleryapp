import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePickerLib from 'expo-image-picker';

import { useColors, useIsDark } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useGalleryStore } from '../../store/galleryStore';
import { ProfileStackParamList } from '../../navigation/types';
import { AVATAR_OPTIONS, DEFAULT_AVATAR_URI } from '../../constants/avatars';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen = ({ navigation }: Props) => {
  const colors = useColors();
  const isDark = useIsDark();
  const { user, logout, updateAvatar } = useAuthStore();
  const { favorites, resetGallery } = useGalleryStore();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            resetGallery();
          },
        },
      ],
    );
  }, [logout, resetGallery]);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Allow photo library access to pick an avatar.');
      return;
    }
    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const base64 = result.assets[0].base64
        ? `data:image/jpeg;base64,${result.assets[0].base64}`
        : result.assets[0].uri;
      await updateAvatar(base64);
      setAvatarModalVisible(false);
    }
  }, [updateAvatar]);

  const handleSelectPresetAvatar = useCallback(
    async (uri: string) => {
      await updateAvatar(uri);
      setAvatarModalVisible(false);
    },
    [updateAvatar],
  );

  if (!user) return null;

  const infoRows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [
    { icon: 'person-outline', label: 'Full Name', value: user.fullName },
    { icon: 'mail-outline', label: 'Email', value: user.email },
    { icon: 'call-outline', label: 'Mobile', value: user.mobileNumber },
    {
      icon: 'people-outline',
      label: 'Gender',
      value: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
    },
    { icon: 'location-outline', label: 'Address', value: user.address },
    { icon: 'business-outline', label: 'City', value: user.city },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={[styles.editBtn, { backgroundColor: colors.primaryLight + '22', borderColor: colors.primaryLight }]}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar Hero */}
        <View style={[styles.heroBg, { backgroundColor: colors.primary + '15' }]}>
          <TouchableOpacity
            onPress={() => setAvatarModalVisible(true)}
            activeOpacity={0.8}
          >
            <Avatar
              name={user.fullName}
              uri={user.avatar}
              size="xl"
              style={styles.avatar}
            />
            <View style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.heroName, { color: colors.text }]}>{user.fullName}</Text>
          <Text style={[styles.heroEmail, { color: colors.textSecondary }]}>{user.email}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBox label="Favorites" value={String(favorites.length)} colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatBox
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              colors={colors}
            />
          </View>
        </View>

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>Personal Information</Text>
          {infoRows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.borderLight }]}>
                  <Ionicons name={row.icon} size={16} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
                </View>
              </View>
              {i < infoRows.length - 1 && (
                <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          ))}
        </View>

        {/* Logout */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          leftIcon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
          style={styles.logoutBtn}
          fullWidth={false}
        />
      </ScrollView>

      {/* Avatar selection modal */}
      <Modal
        visible={avatarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.avatarSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose Avatar</Text>

            <TouchableOpacity
              onPress={handlePickAvatar}
              style={[styles.galleryBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            >
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={[styles.galleryBtnText, { color: colors.text }]}>Choose from Photo Library</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>
              Or pick a preset
            </Text>

            <FlatList
              data={AVATAR_OPTIONS}
              keyExtractor={(item) => item.id}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectPresetAvatar(item.uri)}
                  style={styles.presetItem}
                >
                  <Image source={{ uri: item.uri }} style={styles.presetImg} />
                  <Text style={[styles.presetLabel2, { color: colors.textSecondary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              columnWrapperStyle={styles.presetRow}
            />

            <TouchableOpacity
              onPress={() => setAvatarModalVisible(false)}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const StatBox = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
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
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  scroll: {
    paddingBottom: spacing.xxxl + 32,
  },
  heroBg: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  avatar: {
    marginBottom: spacing.xs,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: spacing.xs + 2,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  heroEmail: {
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  statBox: { alignItems: 'center' },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  infoCard: {
    margin: spacing.base,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: 22,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 34 + spacing.md,
  },
  logoutBtn: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.base,
    alignSelf: 'stretch',
  },
  // Avatar Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatarSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.base,
  },
  galleryBtnText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  presetLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  presetRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  presetItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  presetImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  presetLabel2: {
    fontSize: fontSize.xs,
  },
  cancelBtn: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});

export default ProfileScreen;
