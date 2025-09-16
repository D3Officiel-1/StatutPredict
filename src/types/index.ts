export type AppStatus = 'active' | 'maintenance';
export type AppType = 'web' | 'mobile' | 'api';

export interface Application {
  id: string;
  name: string;
  status: AppStatus;
  url: string;
  type: AppType;
}

export type UserRole = 'Admin' | 'Viewer';

export interface User {
  id: string;
  name:string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}
