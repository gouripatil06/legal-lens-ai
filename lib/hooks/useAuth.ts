'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

interface AuthState {
  isSignedIn: boolean;
  isLoading: boolean;
  user: any;
  token: string | null;
  error: string | null;
}

interface AuthActions {
  getAccessToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export function useAuth(): AuthState & AuthActions {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get access token with error handling
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!isSignedIn) {
        setError('User not signed in');
        return null;
      }

      const token = await getToken();
      if (token) {
        setToken(token);
        setError(null);
        return token;
      } else {
        setError('Failed to get access token');
        return null;
      }
    } catch (err: any) {
      console.error('Error getting access token:', err);
      setError(err.message || 'Failed to get access token');
      return null;
    }
  }, [isSignedIn, getToken]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const newToken = await getAccessToken();
      return newToken;
    } catch (err: any) {
      console.error('Error refreshing token:', err);
      setError(err.message || 'Failed to refresh token');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  // Sign out with cleanup
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setToken(null);
      setError(null);
      await clerkSignOut();
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, [clerkSignOut]);

  // Initialize token on mount and when auth state changes
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);

      if (!userLoaded) {
        return; // Wait for user to load
      }

      if (isSignedIn && user) {
        try {
          const accessToken = await getAccessToken();
          if (accessToken) {
            setToken(accessToken);
          }
        } catch (err: any) {
          console.error('Error initializing auth:', err);
          setError(err.message || 'Failed to initialize authentication');
        }
      } else {
        setToken(null);
        setError(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [userLoaded, isSignedIn, user, getAccessToken]);

  return {
    // State
    isSignedIn: Boolean(isSignedIn && user),
    isLoading: isLoading || !userLoaded,
    user,
    token,
    error,
    
    // Actions
    getAccessToken,
    signOut,
    refreshToken,
  };
}
