import { LoginFormData } from '@/lib/validations/auth';
import { API_CONFIG } from '../config/api';

interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
  user: {
    id: string;
    email: string;
  };
}

export async function loginUser(credentials: LoginFormData): Promise<LoginResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  return response.json();
}