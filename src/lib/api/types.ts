/**
 * API Response Types - Matches Backend Schema
 * Updated to match Agrio India Backend API v2.1
 */

// ==================== Pagination ====================
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Auth ====================
export interface SendOtpResponse {
  message?: string;
  request_id?: string;
  verification_sid?: string;
  expires_in?: number; // OTP expiry time in seconds (e.g., 600 = 10 minutes)
  status?: 'pending' | 'approved' | 'canceled' | 'max_attempts_reached' | 'deleted' | 'failed' | 'expired';
  to?: string;
}

export interface VerifyOtpResponse {
  token: string;
  refresh_token: string;
  is_new_user: boolean;
  user: User;
}

export interface DevLoginResponse {
  token: string;
  refresh_token: string;
  is_new_user: boolean;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

// ==================== User ====================
export interface User {
  id: string;
  phone_number: string;
  full_name?: string;
  email?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  pin_code?: string;
  full_address?: string;
  state?: string;
  district?: string;
  profile_image_url?: string;
  language: 'en' | 'hi';
  crop_preferences?: Crop[];
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserStats {
  total_scans: number;
  coupons_won: number;
  rewards_claimed: number;
  total_savings: number;
  last_scan_date: string | null;
}

export interface CreateProfileRequest {
  full_name: string;
  pin_code: string;
  email?: string;
  full_address?: string;
  state?: string;
  district?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  pin_code?: string;
  full_address?: string;
  state?: string;
  district?: string;
}

// ==================== Crops ====================
export interface Crop {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  image_url?: string;
  season?: string;
  is_active: boolean;
  display_order?: number;
}

export interface UserCrops {
  crop_ids: string[];
  crops: Crop[];
}

// ==================== Categories ====================
export interface Category {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  image_url?: string;
  product_count: number;
  is_active: boolean;
}

/** Product summary returned when listing products under a category */
export interface CategoryProduct {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  is_active: boolean;
}

// ==================== Products ====================
export interface PackSize {
  size: string;
  sku: string;
  mrp: number;
  selling_price: number;
}

export interface Product {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  category: Category;
  description: string;
  description_hi: string;
  composition: string;
  dosage: string;
  application_method: string;
  target_pests: string[];
  suitable_crops: string[];
  pack_sizes: PackSize[];
  safety_precautions: string[];
  images: string[];
  image_url: string | null;
  technical_details?: Record<string, unknown>;
  is_best_seller: boolean;
  best_seller_rank?: number | null;
  is_active: boolean;
  sales_count: number;
  related_products?: Product[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductsQuery {
  q?: string;
  category?: string;
  crop?: string;
  best_seller?: boolean;
  page?: number;
  limit?: number;
  sort?: 'name' | 'name_desc' | 'popular' | 'newest';
}

// ==================== Distributors ====================
export interface Distributor {
  id: string;
  name: string;
  owner_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  is_active: boolean;
}

export interface DistributorCoverage {
  distributor_id: string;
  coverage_areas: {
    pincode: string;
    city: string;
    state: string;
  }[];
  total_products: number;
}

export interface DistributorsResponse {
  distributors?: Distributor[];
  data?: Distributor[];
  pagination?: Pagination;
}

export interface DistributorsQuery {
  pincode?: string;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

// ==================== Coupons & Rewards ====================
export interface Prize {
  name: string;
  name_hi: string;
  description?: string;
  type: 'CASHBACK' | 'DISCOUNT' | 'GIFT' | 'POINTS';
  value: number;
  image_url?: string;
}

export interface CampaignTier {
  id: string;
  reward_name: string;
  reward_name_hi: string;
  reward_type: 'CASHBACK' | 'DISCOUNT' | 'GIFT' | 'POINTS';
  reward_value: number;
}

export interface VerifyCouponResponse {
  is_valid: boolean;
  coupon: {
    id: string;
    code: string;
    product: { id: string; name: string };
    batch_number: string;
  };
  campaign: {
    id: string;
    name: string;
    tier: CampaignTier;
  };
}

export interface Redemption {
  id: string;
  coupon_code: string;
  prize: Prize;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLAIMED';
  assigned_rank?: number;
  rank_display?: string;
  redeemed_at: string;
}

export interface RedeemCouponResponse {
  redemption: Redemption;
}

export interface ScanRedeemResponse {
  redemption: {
    id: string;
    coupon_code: string;
    prize_type: string;
    prize_value: number;
    status: string;
    scanned_at: string;
  };
  reward: {
    name: string;
    name_hi: string;
    type: string;
    value: number;
    image_url?: string;
  };
  message: string;
}

export interface Reward {
  id: string;
  type: string;
  amount: number;
  status: 'PENDING' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLAIMED';
  won_at: string;
  product_name: string;
}

export interface RewardsResponse {
  rewards?: Reward[];
  data?: Reward[];
  pagination?: Pagination;
}

export interface CouponHistory {
  id: string;
  code: string;
  scanned_at: string;
  reward: {
    type: string;
    amount: number;
  };
}

export interface CouponHistoryResponse {
  coupons?: CouponHistory[];
  data?: CouponHistory[];
  pagination?: Pagination;
}

export interface CertificateResponse {
  certificate_url?: string;
  download_url?: string;
  certificate_data?: {
    winner_name: string;
    phone_number: string;
    coupon_code: string;
    prize_name: string;
    prize_value: number;
    prize_type: string;
    rank: number;
    won_date: string;
    status: string;
  };
}

// ==================== Notifications ====================
export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  title_hi?: string;
  message: string;
  message_hi?: string;
  type: 'REWARD' | 'PROMO' | 'ORDER' | 'SYSTEM';
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications?: Notification[];
  unread_count?: number;
  pagination?: Pagination;
}

// ==================== Admin Notifications (requires backend support) ====================
export type NotificationTarget = 'ALL' | 'USER_IDS';

export interface AdminCreateNotificationRequest {
  type: 'REWARD' | 'PROMO' | 'ORDER' | 'SYSTEM';
  title: string;
  title_hi?: string;
  message: string;
  message_hi?: string;
  target: NotificationTarget;
  user_ids?: string[]; // required when target = USER_IDS
  data?: Record<string, unknown>;
}

export interface AdminNotification extends Notification {
  title_hi?: string;
  message_hi?: string;
  target?: NotificationTarget;
  created_by?: { id: string; name?: string; email?: string };
  data?: Record<string, unknown>;
}

export interface AdminNotificationsResponse {
  notifications: AdminNotification[];
  pagination?: Pagination;
}

// ==================== Admin FCM Send (backend: POST /fcm/send) ====================
export interface AdminFcmSendRequest {
  title: string;
  body: string;
  titleHi?: string;
  messageHi?: string;
  imageUrl?: string;
  topic?: string; // default: all_users
  type: 'REWARD' | 'PROMO' | 'ORDER' | 'SYSTEM' | 'URL';
  slug?: string;
  productId?: string;
  url?: string; // For URL type notifications
}

// ==================== Support ====================
export interface ContactFormRequest {
  name: string;
  mobile: string;
  email?: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  ticket_id: string;
  message: string;
}

export interface FAQ {
  id: string;
  question: string;
  question_hi: string;
  answer: string;
  answer_hi: string;
  category: string;
  order?: number;
}

export interface CmsPage {
  slug: string;
  title: string;
  title_hi: string;
  content: string;
  content_hi: string;
  updated_at: string;
}

// ==================== Config ====================
export interface AppConfig {
  app_version?: {
    android_min: string;
    android_latest: string;
    ios_min: string;
    ios_latest: string;
    force_update: boolean;
  };
  contact?: {
    support_email: string;
    support_phone: string;
    whatsapp: string;
  };
  social?: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  feature_flags?: {
    scan_enabled: boolean;
    shop_enabled: boolean;
    referral_enabled: boolean;
  };
  content?: {
    home_features: any[];
    why_choose_us: any[];
    home_hero: {
      hero_image: string;
      app_bg_farmer: string;
    };
  };
}

export interface Banner {
  id: string;
  title: string;
  title_hi: string;
  image_url: string;
  link?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SearchResponse {
  products: { id: string; name: string; slug: string; images?: string[] }[];
  categories: { id: string; name: string; slug: string }[];
  crops: { id: string; name: string; slug: string }[];
}

// ==================== Admin ====================
export interface AdminLoginResponse {
  token: string;
  refresh_token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  };
}

export interface AdminMeResponse {
  admin: {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  };
}

export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders?: number;
  total_revenue?: number;
  total_coupons_scanned?: number;
  user_growth?: number;
  active_users?: number;
  active_user_growth?: number;
  total_scans?: number;
  scan_growth?: number;
  coupons_redeemed?: number;
  redemption_growth?: number;
  total_distributors?: number;
  new_registrations_today?: number;
  scans_per_day?: { date: string; value: number }[];
  crop_preferences?: { name: string; value: number }[];
  top_states?: { state: string; users: number }[];
  recent_activity?: unknown[];
}

export interface AdminUser {
  id: string;
  phone_number: string;
  name?: string;
  full_name?: string;
  email?: string;
  pincode?: string;
  pin_code?: string;
  full_address?: string;
  state?: string;
  district?: string;
  is_active?: boolean;
  role: string;
  total_scans: number;
  total_rewards?: number;
  created_at: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

export interface AdminCoupon {
  id: string;
  code: string;
  product_name?: string;
  product?: { id: string; name: string; name_hi?: string };
  batch_number?: string;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  is_used?: boolean;
  reward_type?: 'CASHBACK' | 'DISCOUNT' | 'GIFT';
  reward_value?: number;
  scanned_by?: string;
  redeemed_by?: { id: string; name?: string; phone_number?: string };
  scanned_at?: string;
  created_at: string;
  expires_at?: string;
  expiry_date?: string;
}

export interface AdminCouponsResponse {
  coupons: AdminCoupon[];
  pagination: Pagination;
}

export interface GenerateCouponsRequest {
  campaign_id: string;        // REQUIRED - Must exist
  count: number;              // Number of coupons to generate
  product_id?: string;        // Optional - link to specific product
  prefix?: string;            // Optional - coupon code prefix
  expiry_date?: string;       // Optional - ISO date format
}

export interface GenerateCouponsResponse {
  generated_count: number;
  codes_preview?: string[];
  batch_id?: string;
}

// Campaign types for coupon generation
export interface CampaignTierConfig {
  tier_name: string;
  reward_name: string;
  reward_name_hi?: string;
  reward_type: 'CASHBACK' | 'DISCOUNT' | 'GIFT' | 'POINTS';
  reward_value: number;
  probability: number;
  priority: number;
  max_winners?: number;
  image_url?: string; // Required for GIFT type - shows after scratch
}

export interface Campaign {
  id: string;
  name: string;
  name_hi?: string;
  description?: string;
  distribution_type?: 'RANDOM' | 'SEQUENTIAL' | 'FIRST_COME';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  tiers?: CampaignTierConfig[];
}

export interface CampaignsResponse {
  campaigns?: Campaign[];
  data?: Campaign[];
  pagination?: Pagination;
}

export interface CreateDistributorRequest {
  name: string;
  owner_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateProductRequest {
  name: string;
  name_hi: string;
  category_id: string;
  description: string;
  description_hi: string;
  composition: string;
  dosage: string;
  application_method: string;
  target_pests?: string[];
  suitable_crops?: string[];
  safety_precautions?: string[];
  images?: string[];
  is_best_seller?: boolean;
  best_seller_rank?: number | null;
  is_active?: boolean;
  pack_sizes: PackSize[];
}
