import { PicsumImage } from '../types';

// ─── Stack param lists ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ImageDetails: { image: PicsumImage; fromFavorites?: boolean };
};

export type FavoritesStackParamList = {
  FavoritesHome: undefined;
  ImageDetails: { image: PicsumImage; fromFavorites?: boolean };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
};

// ─── Global navigation type augmentation ─────────────────────────────────────

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
