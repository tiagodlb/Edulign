export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://api.example.com',
    ENDPOINTS: {
      LOGIN: '/auth/login',
    },
  } as const;