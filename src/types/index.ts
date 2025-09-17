
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

export interface ReferralItem {
  id: string;
  amount: number;
  date: any;
  fromUser: string;
  plan: string;
}

export interface PricingItem {
  actif_jetpredict: boolean;
  findate: any;
  idplan_jetpredict: string;
  startdate: any;
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
  referralData?: ReferralItem[];
  pricingData?: PricingItem[];
  referrals?: User[];
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
}

export interface PricingPlan {
  id: string;
  appId: string;
  name: string;
  price: number;
  promoPrice?: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'annual';
  features: string[];
  missingFeatures?: string[];
  popular?: boolean;
}
