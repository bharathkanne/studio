import type { User } from './types';

const MOCK_USER_KEY = 'safetystream_mock_user';

export const mockSignIn = async (email: string, _password?: string): Promise<User | null> => {
  // In a real app, you'd validate credentials against a backend.
  // For mock, we'll just create a user object.
  if (typeof window !== 'undefined') {
    const mockUser: User = { id: 'mock-user-1', email, name: 'Demo User' };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  }
  return null;
};

export const mockSignUp = async (email: string, name: string, _password?: string): Promise<User | null> => {
  if (typeof window !== 'undefined') {
    const mockUser: User = { id: `mock-user-${Date.now()}`, email, name };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  }
  return null;
};

export const mockSignOut = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MOCK_USER_KEY);
  }
};

export const getMockUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem(MOCK_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
};
