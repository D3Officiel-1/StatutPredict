export type AppType = 'web' | 'mobile' | 'api';

export interface Application {
  id: string;
  name: string;
  status: boolean;
  url: string;
  type: AppType;
  maintenanceConfig?: {
    message: string;
    buttonTitle?: string;
    buttonUrl?: string;
    mediaUrl?: string;
  }
}

export interface User {
  id: string;
  createdAt?: any;
  dob?: string;
  email: string;
  favoriteGame?: string;
  firstName?: string;
  gender?: string;
  isOnline?: boolean;
  lastName?: string;
  phone?: string;
  pronosticCode?: string;
  referralBalance?: number;
  referralCode?: string;
  solde_referral?: number;
  uid?: string;
  username?: string;
  name?: string; // Keep for backward compatibility if some docs still use it
}

export interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: any;
}
