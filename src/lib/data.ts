import type { Application, User } from '@/types';

export const applications: Application[] = [
  {
    id: '1',
    name: 'App principale',
    status: 'active',
    url: 'app-principale.com',
    type: 'web',
  },
  {
    id: '2',
    name: 'API de facturation',
    status: 'active',
    url: 'api.facturation.com',
    type: 'api',
  },
  {
    id: '3',
    name: 'Portail Client',
    status: 'maintenance',
    url: 'portail.client.com',
    type: 'web',
  },
  {
    id: '4',
    name: 'App Mobile (iOS)',
    status: 'active',
    url: 'App Store',
    type: 'mobile',
  },
  {
    id: '5',
    name: 'Service d\'authentification',
    status: 'active',
    url: 'auth.service.com',
    type: 'api',
  },
];

export const users: User[] = [
    {
        id: '1',
        name: 'Alice Dubois',
        email: 'alice.dubois@example.com',
        role: 'Admin',
        avatarUrl: 'https://picsum.photos/seed/1/40/40',
    },
    {
        id: '2',
        name: 'Bob Leclerc',
        email: 'bob.leclerc@example.com',
        role: 'Viewer',
        avatarUrl: 'https://picsum.photos/seed/2/40/40',
    },
    {
        id: '3',
        name: 'Chloé Martin',
        email: 'chloe.martin@example.com',
        role: 'Viewer',
        avatarUrl: 'https://picsum.photos/seed/3/40/40',
    }
]

export const mainUser: User = {
    id: '1',
    name: 'Alice Dubois',
    email: 'alice.dubois@example.com',
    role: 'Admin',
    avatarUrl: 'https://picsum.photos/seed/1/40/40',
}
