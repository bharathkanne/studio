import type { User } from './types';

const MOCK_USER_KEY = 'safetystream_mock_user';

export const mockSignIn = async (email: string, _password?: string): Promise<User | null> => {
  // In a real app, you'd validate credentials against a backend.
  if (typeof window !== 'undefined') {
    const isAdmin = email === 'admin@example.com';
    const mockUser: User = {
      id: isAdmin ? 'admin-user-001' : `mock-user-${Date.now()}`, // Consistent ID for admin
      email,
      name: isAdmin ? 'Admin User' : 'Demo User', // Specific name for admin, generic for others
      isAdmin: isAdmin,
    };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  }
  return null;
};

export const mockSignUp = async (email: string, name: string, _password?: string): Promise<User | null> => {
  if (typeof window !== 'undefined') {
    // New sign-ups are never admin by default
    const mockUser: User = { id: `mock-user-${Date.now()}`, email, name, isAdmin: false };
    // Check if user already exists to prevent overwriting admin during signup test
    const existingUserJson = localStorage.getItem(MOCK_USER_KEY);
    if (existingUserJson) {
        const existingUser = JSON.parse(existingUserJson);
        if (existingUser.email === email && email === 'admin@example.com') {
            // If trying to sign up as admin, just return the admin user
            return existingUser;
        }
    }
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
    if (userJson) {
      const parsedUser: User = JSON.parse(userJson);
      // Ensure isAdmin flag is correctly set based on email,
      // especially if user was stored before isAdmin was introduced or if modified.
      if (parsedUser.email === 'admin@example.com') {
        parsedUser.isAdmin = true;
        if (!parsedUser.name) parsedUser.name = "Admin User"; // Ensure admin name
      } else {
        // Ensure non-admin users explicitly have isAdmin set to false
        // or handle cases where it might be undefined.
        if (parsedUser.isAdmin === undefined || parsedUser.isAdmin === true) {
           parsedUser.isAdmin = false;
        }
        if (!parsedUser.name) parsedUser.name = "Demo User"; // Ensure default name for other users
      }
      return parsedUser;
    }
    return null;
  }
  return null;
};
