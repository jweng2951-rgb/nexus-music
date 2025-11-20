
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  revenueShare: number; // Percentage (0-100) - HIDDEN from User UI
  createdAt: string;
  status: 'active' | 'suspended';
  channelId?: string;
  channelName?: string;
}

export interface Channel {
  id?: string;
  userId: string;
  channelId: string; // The unique UC... ID
  channelName?: string;
  createdAt?: string;
}

export interface DailyStat {
  date: string;
  views: number;
  premiumViews: number;
  estimatedRevenue: number; // NET revenue (User's share)
  grossRevenue?: number; // RAW revenue (Only available to Admin logic)
}

export interface CountryStat {
  code: string;
  views: number;
  revenue: number; // NET revenue
}

export interface ChannelStats {
  totalViews: number;
  totalPremiumViews: number;
  totalRevenue: number; // NET revenue
  dailyStats: DailyStat[];
  topCountries: CountryStat[];
  lastUpdated: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: string;
  assignedToIds: string[];
  isrc?: string;
}

export interface CsvRow {
  date: string;
  channelId: string;
  videoTitle: string;
  country: string;
  views: string | number;
  premiumViews: string | number; 
  grossRevenue: string | number; 
}