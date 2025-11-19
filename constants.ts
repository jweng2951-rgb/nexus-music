import { User, UserRole, MusicTrack } from './types';

export const MOCK_ADMIN: User = {
  id: 'admin-001',
  username: 'Admin',
  password: 'Wswj123456',
  role: UserRole.ADMIN,
  revenueShare: 100,
  createdAt: new Date().toISOString(),
  status: 'active'
};

export const INITIAL_USERS: User[] = [
  MOCK_ADMIN,
  {
    id: 'user-001',
    username: 'creator_one',
    password: 'password',
    role: UserRole.USER,
    revenueShare: 70, // User gets 70% of the revenue uploaded in CSV
    channelId: 'UC_12345abcde',
    channelName: 'Funny Shorts 101',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'active'
  },
  {
    id: 'user-002',
    username: 'creator_two',
    password: 'password',
    role: UserRole.USER,
    revenueShare: 80, // User gets 80%
    channelId: 'UC_67890fghij',
    channelName: 'Daily Vines',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'active'
  }
];

export const INITIAL_MUSIC: MusicTrack[] = [
  {
    id: 'm-1',
    title: 'Example Track (Playable)',
    artist: 'StockAudio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Real generic MP3 for testing playback
    category: 'Pop',
    assignedToIds: ['all']
  },
  {
    id: 'm-2',
    title: 'Epic Build Up',
    artist: 'CinematicSounds',
    url: '#',
    category: 'Cinematic',
    assignedToIds: ['user-001']
  }
];

// Mock stats storage key
export const STORAGE_KEYS = {
  USERS: 'shorts_cms_users_v2', // Versioned up to force refresh if needed
  MUSIC: 'shorts_cms_music',
  STATS: 'shorts_cms_stats_v2',
  CURRENT_USER: 'shorts_cms_current_user'
};