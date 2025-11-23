import { supabase } from '../lib/supabaseClient';
import { User, UserRole, MusicTrack, ChannelStats, Channel } from '../types';
import { MOCK_ADMIN, INITIAL_MUSIC } from '../constants';

export const dataService = {
  // --- User Management ---
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return [];
    return data.map((u: any) => ({
      id: u.id, username: u.username, password: u.password, role: u.role as UserRole,
      revenueShare: u.revenue_share, createdAt: u.created_at, status: u.status,
      channelId: u.channel_id, channelName: u.channel_name
    }));
  },
  saveUser: async (user: User) => {
    const payload = {
      id: user.id, username: user.username, password: user.password, role: user.role,
      revenue_share: user.revenueShare, created_at: user.createdAt, status: user.status,
      channel_id: user.channelId, channel_name: user.channelName
    };
    await supabase.from('users').upsert(payload);
  },
  deleteUser: async (id: string) => { await supabase.from('users').delete().eq('id', id); },

  // --- Channel Management (FIXED) ---
  getUserChannels: async (userId: string): Promise<Channel[]> => {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId);
    return data ? data.map((c: any) => ({
        id: c.id, userId: c.user_id, channelId: c.channel_id, channelName: c.channel_name, createdAt: c.created_at
    })) : [];
  },
  getAllChannels: async (): Promise<Channel[]> => {
    const { data } = await supabase.from('channels').select('*');
    return data ? data.map((c: any) => ({
        id: c.id, userId: c.user_id, channelId: c.channel_id, channelName: c.channel_name, createdAt: c.created_at
    })) : [];
  },
  // FIX: Use Upsert on channel_id to force ownership. This fixes "cannot bind" issues.
  saveBulkChannels: async (channels: Channel[]) => {
    const payload = channels.map(c => ({
        channel_id: c.channelId, // Unique Key
        user_id: c.userId,       // New Owner
        channel_name: c.channelName
    }));
    
    // Upsert: If channel_id exists, update user_id. If not, insert.
    // This requires 'channel_id' to be a UNIQUE column in Supabase.
    // Fallback: Delete then Insert if constraint is missing (slower but safer for generic SQL).
    
    try {
        // 1. Clean existing bindings for these IDs to prevent constraint errors if unique index exists
        const ids = channels.map(c => c.channelId);
        await supabase.from('channels').delete().in('channel_id', ids);
        
        // 2. Insert fresh bindings
        const { error } = await supabase.from('channels').insert(payload);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Bulk Save Error:", e);
        return false;
    }
  },
  deleteChannel: async (id: string) => { await supabase.from('channels').delete().eq('id', id); },

  // --- Stats Management ---
  getUserStats: async (): Promise<Record<string, ChannelStats>> => {
    const { data } = await supabase.from('stats').select('*');
    const statsMap: Record<string, ChannelStats> = {};
    data?.forEach((s: any) => {
        statsMap[s.user_id] = {
            totalViews: s.total_views || 0,
            totalPremiumViews: s.total_premium_views || 0,
            totalRevenue: s.total_revenue || 0,
            dailyStats: s.daily_stats || [],
            topCountries: s.top_countries || [],
            topVideos: s.top_videos || [],
            channelCatalog: s.channel_catalog || [],
            lastUpdated: s.last_updated || new Date().toISOString()
        };
    });
    return statsMap;
  },
  getChannelStats: async (channelId: string): Promise<ChannelStats | null> => {
    const { data } = await supabase.from('channel_stats_daily').select('*').eq('channel_id', channelId).single();
    if (!data) return null;
    return {
        totalViews: data.total_views || 0,
        totalPremiumViews: data.total_premium_views || 0,
        totalRevenue: data.total_revenue || 0,
        dailyStats: data.daily_stats || [],
        topCountries: data.top_countries || [],
        topVideos: data.top_videos || [],
        channelCatalog: [],
        lastUpdated: data.last_updated || new Date().toISOString()
    };
  },
  saveUserStats: async (userId: string, stats: ChannelStats) => {
    await supabase.from('stats').upsert({
      user_id: userId, total_views: stats.totalViews, total_premium_views: stats.totalPremiumViews, total_revenue: stats.totalRevenue,
      daily_stats: stats.dailyStats, top_countries: stats.topCountries, top_videos: stats.topVideos, channel_catalog: stats.channelCatalog, last_updated: stats.lastUpdated
    });
  },
  saveChannelStats: async (channelId: string, stats: ChannelStats) => {
    await supabase.from('channel_stats_daily').upsert({
        channel_id: channelId, total_views: stats.totalViews, total_premium_views: stats.totalPremiumViews, total_revenue: stats.totalRevenue,
        daily_stats: stats.dailyStats, top_countries: stats.topCountries, top_videos: stats.topVideos, last_updated: stats.lastUpdated
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
    try {
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (count === 0) {
            await supabase.from('users').insert({ id: MOCK_ADMIN.id, username: MOCK_ADMIN.username, password: MOCK_ADMIN.password, role: MOCK_ADMIN.role, revenue_share: MOCK_ADMIN.revenueShare, created_at: MOCK_ADMIN.createdAt, status: MOCK_ADMIN.status });
        }
    } catch (e) { console.error("Init error", e); }
  }
};