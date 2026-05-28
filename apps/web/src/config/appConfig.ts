export const appConfig = {
  cmsUrl: import.meta.env.VITE_CMS_URL ?? 'http://localhost:3001',
  appName: 'parksplash'
} as const;
