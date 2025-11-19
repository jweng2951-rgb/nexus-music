export enum UserRole { ADMIN = 'ADMIN', USER = 'USER' }

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  revenueShare: number;
  channelId?: string;
  channelName?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface DailyStat {
  date: string;
  views: number;
  premiumViews: number;
  estimatedRevenue: number;
  grossRevenue: number;
}

export interface CountryStat { code: string; views: number; revenue: number; }

export interface ChannelStats {
  totalViews: number;
  totalPremiumViews: number;
  totalRevenue: number;
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