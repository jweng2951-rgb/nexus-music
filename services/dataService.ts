
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, MusicTrack, ChannelStats, Channel } from '../types';
import { MOCK_ADMIN, INITIAL_MUSIC } from '../constants';

export const dataService = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return [];
    return data.map((u: any) => ({
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role as UserRole,
      revenueShare: u.revenue_share,
      createdAt: u.created_at,
      status: u.status,
      channelId: u.channel_id,
      channelName: u.channel_name
    }));
  },
  
  saveUser: async (user: User) => {
    const payload = {
      id: user.id, username: user.username, password: user.password, role: user.role,
      revenue_share: user.revenueShare, created_at: user.createdAt, status: user.status,
      // We conditionally add channel info if the backend supports it, but standard upsert is fine if columns exist
      channel_id: user.channelId,
      channel_name: user.channelName
    };
    await supabase.from('users').upsert(payload);
  },

  deleteUser: async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
  },

  // --- Channel Management (1:N) ---
  
  // Get all channels for a specific user
  getUserChannels: async (userId: string): Promise<Channel[]> => {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId);
    return data ? data.map((c: any) => ({
        id: c.id, userId: c.user_id, channelId: c.channel_id, channelName: c.channel_name, createdAt: c.created_at
    })) : [];
  },

  // Get ALL channels (for Admin CSV parsing)
  getAllChannels: async (): Promise<Channel[]> => {
    const { data } = await supabase.from('channels').select('*');
    return data ? data.map((c: any) => ({
        id: c.id, userId: c.user_id, channelId: c.channel_id, channelName: c.channel_name, createdAt: c.created_at
    })) : [];
  },

  saveChannel: async (channel: Channel) => {
    const { error } = await supabase.from('channels').insert({
        user_id: channel.userId,
        channel_id: channel.channelId,
        channel_name: channel.channelName
    });
    return !error;
  },
  
  saveBulkChannels: async (channels: Channel[]) => {
    const payload = channels.map(c => ({
        user_id: c.userId, channel_id: c.channelId, channel_name: c.channelName
    }));
    const { error } = await supabase.from('channels').upsert(payload, { onConflict: 'channel_id', ignoreDuplicates: false }); 
    // Note: In a real app, you might handle conflicts differently. Here we verify ownership or update.
    return !error;
  },

  deleteChannel: async (id: string) => {
    await supabase.from('channels').delete().eq('id', id);
  },

  // --- Stats Management ---

  // Get User Aggregate Stats
  getUserStats: async (): Promise<Record<string, ChannelStats>> => {
    const { data } = await supabase.from('stats').select('*');
    const statsMap: Record<string, ChannelStats> = {};
    data?.forEach((s: any) => {
        statsMap[s.user_id] = {
            totalViews: s.total_views,
            totalPremiumViews: s.total_premium_views,
            totalRevenue: s.total_revenue,
            dailyStats: s.daily_stats,
            topCountries: s.top_countries,
            lastUpdated: s.last_updated
        };
    });
    return statsMap;
  },

  // Get Individual Channel Stats
  getChannelStats: async (channelId: string): Promise<ChannelStats | null> => {
    const { data } = await supabase.from('channel_stats_daily').select('*').eq('channel_id', channelId).single();
    if (!data) return null;
    return {
        totalViews: data.total_views,
        totalPremiumViews: data.total_premium_views,
        totalRevenue: data.total_revenue,
        dailyStats: data.daily_stats,
        topCountries: data.top_countries,
        lastUpdated: data.last_updated
    };
  },

  saveUserStats: async (userId: string, stats: ChannelStats) => {
    await supabase.from('stats').upsert({
      user_id: userId,
      total_views: stats.totalViews,
      total_premium_views: stats.totalPremiumViews,
      total_revenue: stats.totalRevenue,
      daily_stats: stats.dailyStats,
      top_countries: stats.topCountries,
      last_updated: stats.lastUpdated
    });
  },

  saveChannelStats: async (channelId: string, stats: ChannelStats) => {
    await supabase.from('channel_stats_daily').upsert({
        channel_id: channelId,
        total_views: stats.totalViews,
        total_premium_views: stats.totalPremiumViews,
        total_revenue: stats.totalRevenue,
        daily_stats: stats.dailyStats,
        top_countries: stats.topCountries,
        last_updated: stats.lastUpdated
    }, { onConflict: 'channel_id' });
  },
  
  // --- Music ---
  getMusic: async (): Promise<MusicTrack[]> => {
    const { data } = await supabase.from('music').select('*');
    return data ? data.map((m: any) => ({ id: m.id, title: m.title, artist: m.artist, url: m.url, category: m.category, assignedToIds: m.assigned_to_ids || [], isrc: m.isrc })) : [];
  },
  saveTrack: async (track: MusicTrack) => {
    await supabase.from('music').upsert({ id: track.id, title: track.title, artist: track.artist, url: track.url, category: track.category, assigned_to_ids: track.assignedToIds, isrc: track.isrc });
  },
  deleteTrack: async (id: string) => { await supabase.from('music').delete().eq('id', id); },

  // --- Init ---
  initialize: async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (count === 0) {
        await supabase.from('users').insert({ id: MOCK_ADMIN.id, username: MOCK_ADMIN.username, password: MOCK_ADMIN.password, role: MOCK_ADMIN.role, revenue_share: MOCK_ADMIN.revenueShare, created_at: MOCK_ADMIN.createdAt, status: MOCK_ADMIN.status });
        for (const track of INITIAL_MUSIC) {
             await supabase.from('music').insert({ id: track.id, title: track.title, artist: track.artist, url: track.url, category: track.category, assigned_to_ids: track.assignedToIds, isrc: track.isrc || '' });
        }
    }
  }
};