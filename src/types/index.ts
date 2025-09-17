export type AppStatus = 'active' | 'maintenance';
export type AppType = 'web' | 'mobile' | 'api';

export interface Application {
  id: string;
  name: string;
  status: AppStatus;
  url: string;
  type: AppType;
  maintenanceConfig?: {
    message: string;
    buttonTitle?: string;
    buttonUrl?: string;
    targetUsers?: string[];
    mediaUrl?: string;
  }
}

export type UserRole = 'Admin' | 'Viewer';

export interface User {
  id: string;
  name:string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: any;
}
