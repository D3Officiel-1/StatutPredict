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

export type UserRole = 'Admin' | 'Viewer';

export interface User {
  id: string;
  name:string;
  email: string;
  role: UserRole;
}

export interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: any;
}
