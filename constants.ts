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

export const INITIAL_MUSIC: MusicTrack[] = [
  { id: 'm-1', title: 'Upbeat Summer', artist: 'StockAudio', url: '#', category: 'Pop', assignedToIds: ['all'] }
];