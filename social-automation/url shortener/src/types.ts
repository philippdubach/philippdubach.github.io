// Type definitions for the URL Shortener

export interface Env {
  URLS: KVNamespace;
  DB: D1Database;
  ADMIN_PASSWORD: string;
  API_KEY: string;
  DASHBOARD_ORIGIN: string;
}

export interface LinkData {
  url: string;
  title?: string | null;
  createdAt: string;
  clicks?: number;
}

export interface ClickEvent {
  shortCode: string;
  clickedAt: string;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipHash: string | null;
}

export interface LinkStats {
  shortCode: string;
  longUrl: string;
  title: string | null;
  totalClicks: number;
  uniqueVisitors: number;
  clicksByCountry: Record<string, number>;
  clicksByDevice: Record<string, number>;
  clicksByBrowser: Record<string, number>;
  clicksOverTime: { date: string; count: number }[];
  recentClicks: ClickEvent[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateLinkRequest {
  url: string;
  customCode?: string;
  title?: string;
}

export interface UpdateLinkRequest {
  url?: string;
  title?: string;
  isActive?: boolean;
}

export interface LinkListItem {
  shortCode: string;
  longUrl: string;
  title: string | null;
  createdAt: string;
  totalClicks: number;
  isActive: boolean;
}

// Database row types for proper typing
export interface DbLinkRow {
  id: number;
  short_code: string;
  long_url: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  is_active: number;
  total_clicks?: number;
}

export interface DbClickRow {
  id: number;
  short_code: string;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_hash: string | null;
}

export interface DbCountResult {
  count: number;
}

export interface DbAggregateRow {
  [key: string]: string | number | null;
}

// Application constants
export const APP_CONSTANTS = {
  MAIN_SITE: 'https://philippdubach.com',
  DEFAULT_SHORT_CODE_LENGTH: 6,
  MAX_SHORT_CODE_LENGTH: 50,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 50,
  DEFAULT_STATS_DAYS: 30,
} as const;
