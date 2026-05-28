import { useEffect, useState } from 'react';
import type {
  AuthUserDto,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput
} from '@parksplash/shared';
import { appConfig } from '../../config/appConfig';

const request = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${appConfig.cmsUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed.' }));
    throw new Error(payload.error ?? 'Request failed.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const profile = await request<AuthUserDto>('/api/profile');
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const signUp = async (input: SignUpInput) => {
    setAuthError('');

    try {
      await request('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          displayName: input.displayName
        })
      });

      await signIn({
        email: input.email,
        password: input.password
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account.');
    }
  };

  const signIn = async (input: SignInInput) => {
    setAuthError('');

    try {
      await request('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(input)
      });
      await loadProfile();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  };

  const signOut = async () => {
    await request('/api/users/logout', {
      method: 'POST'
    });
    setUser(null);
  };

  const forgotPassword = async (input: ForgotPasswordInput) => {
    await request('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  };

  const resetPassword = async (input: ResetPasswordInput) => {
    await request('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  };

  const updateProfile = async (input: Partial<Pick<AuthUserDto, 'displayName' | 'locationConsent'>>) => {
    const profile = await request<AuthUserDto>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
    setUser(profile);
  };

  return {
    user,
    authError,
    isLoading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshProfile: loadProfile
  };
};
