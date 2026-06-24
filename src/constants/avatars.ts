/**
 * Predefined avatar options using DiceBear API (free, no auth needed).
 * Users can pick one of these as their profile avatar.
 */
export interface AvatarOption {
  id: string;
  label: string;
  uri: string;
}

const AVATAR_SEEDS = [
  { id: 'av1', label: 'Cosmic', seed: 'galaxy001' },
  { id: 'av2', label: 'Nature', seed: 'forest002' },
  { id: 'av3', label: 'Ocean', seed: 'ocean003' },
  { id: 'av4', label: 'Sunset', seed: 'sunset004' },
  { id: 'av5', label: 'Arctic', seed: 'arctic005' },
  { id: 'av6', label: 'Desert', seed: 'desert006' },
  { id: 'av7', label: 'Valley', seed: 'valley007' },
  { id: 'av8', label: 'Aurora', seed: 'aurora008' },
  { id: 'av9', label: 'Zen', seed: 'zen009' },
  { id: 'av10', label: 'Storm', seed: 'storm010' },
  { id: 'av11', label: 'Bloom', seed: 'bloom011' },
  { id: 'av12', label: 'Ember', seed: 'ember012' },
];

export const AVATAR_OPTIONS: AvatarOption[] = AVATAR_SEEDS.map(({ id, label, seed }) => ({
  id,
  label,
  uri: `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${seed}&size=100&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
}));

export const DEFAULT_AVATAR_URI =
  'https://api.dicebear.com/7.x/bottts-neutral/png?seed=default&size=100';

export const CUSTOM_AVATAR_KEY = 'custom'; // Key used when user picks from gallery
