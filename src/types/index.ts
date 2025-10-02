
import { Timestamp } from "firebase/firestore";

export type AppType = 'web' | 'mobile' | 'api';

export interface AppStatusHistory {
  appId: string;
  status: boolean;
  timestamp: Timestamp;
}

export type HeartbeatStatus = 'healthy' | 'unstable' | 'flatline';

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
    targetUsers?: string[];
    status?: boolean;
  };
  statusHistory?: AppStatusHistory[];
  plans?: PricingPlan[];
}

export interface ReferralItem {
  id: string;
  amount: number;
  date: any;
  fromUser: string;
  plan: string;
}

export interface PricingItem {
  id: string; // Document ID from 'pricing' subcollection
  appId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Timestamp;
  endDate: Timestamp;
  // Legacy fields, can be removed if fully migrated
  actif_jetpredict?: boolean;
  idplan_jetpredict?: string;
}

export interface User {
  id: string;
  createdAt?: any;
  dob?: string | any;
  email: string;
  favoriteGame?: string;
  firstName?: string;
  gender?: string;
  isOnline?: boolean;
  lastName?: string;
  phone?: string;
  pronosticCode?: string;
  referralCode?: string;
  solde_referral?: number;
  uid?: string;
  username?: string;
  password?: string;
  fcmToken?: string;
  photoURL?: string;
  telegramLinkToken?: string;
  referralData?: ReferralItem[];
  pricingData?: PricingItem[];
  referrals?: User[];
  referralCommissions?: any[]; // For commissions earned
  activeAppId?: string; // To know which app's plans to fetch
}

export interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: any;
}

export interface DiscountCode {
  id: string;
  code: string;
  titre: string;
  debutdate: any;
  findate: any;
  plan: string;
  pourcentage: string;
  tous: boolean;
  max?: number;
  people?: string[];
  imageUrl?: string;
}

export interface PricingPlan {
  id: string;
  appId: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  currency: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  features: string[];
  missingFeatures?: string[];
  popular?: boolean;
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  description: string;
  date: any;
  resolvedAt?: any;
  status: string;
  appId: string;
  appName: string;
}

    