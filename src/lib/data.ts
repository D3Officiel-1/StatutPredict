import type { Application, User } from '@/types';

export const applications: Application[] = [
  {
    id: '1',
    name: 'App principale',
    status: true,
    url: 'app-principale.com',
    type: 'web',
  },
  {
    id: '2',
    name: 'API de facturation',
    status: true,
    url: 'api.facturation.com',
    type: 'api',
  },
  {
    id: '3',
    name: 'Portail Client',
    status: false,
    url: 'portail.client.com',
    type: 'web',
  },
  {
    id: '4',
    name: 'App Mobile (iOS)',
    status: true,
    url: 'App Store',
    type: 'mobile',
  },
  {
    id: '5',
    name: 'Service d\'authentification',
    status: true,
    url: 'auth.service.com',
    type: 'api',
  },
];
