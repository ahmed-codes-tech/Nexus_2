import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserRole, AuthContextType } from '../types';
import { users } from '../data/users';
import toast from 'react-hot-toast';

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';
const TRUSTED_DEVICES_KEY = 'business_nexus_trusted_devices';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Update online status
      const userIndex = users.findIndex(u => u.id === parsedUser.id);
      if (userIndex !== -1) {
        users[userIndex].isOnline = true;
      }
    }
    setIsLoading(false);
  }, []);

  // Set user offline on logout
  const setUserOffline = (userId: string) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isOnline = false;
    }
  };

  // Check if device is trusted
  const isDeviceTrusted = (): boolean => {
    const trustedDevices = localStorage.getItem(TRUSTED_DEVICES_KEY);
    if (!trustedDevices) return false;
    
    const devices = JSON.parse(trustedDevices);
    const deviceId = getDeviceId();
    return devices.includes(deviceId);
  };

  // Get device ID (mock - in real app would be more sophisticated)
  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  // Trust current device
  const trustDevice = () => {
    const trustedDevices = localStorage.getItem(TRUSTED_DEVICES_KEY);
    const devices = trustedDevices ? JSON.parse(trustedDevices) : [];
    const deviceId = getDeviceId();
    
    if (!devices.includes(deviceId)) {
      devices.push(deviceId);
      localStorage.setItem(TRUSTED_DEVICES_KEY, JSON.stringify(devices));
    }
  };

  // Login function with 2FA support
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching email and role
      const foundUser = users.find(u => u.email === email && u.role === role);
      
      if (foundUser) {
        // Check if 2FA is required (for demo, always require 2FA for new devices)
        const deviceTrusted = isDeviceTrusted();
        
        if (!deviceTrusted) {
          // Store pending user and require 2FA
          setPendingUser(foundUser);
          setRequires2FA(true);
          toast('2FA verification required', { icon: '🔐' });
          setIsLoading(false);
          return;
        }
        
        // Complete login
        setUser(foundUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
        
        // Update online status
        const userIndex = users.findIndex(u => u.id === foundUser.id);
        if (userIndex !== -1) {
          users[userIndex].isOnline = true;
        }
        
        toast.success('Successfully logged in!');
      } else {
        throw new Error('Invalid credentials or user not found');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA code
  const verify2FA = async (code: string, trustDeviceFlag: boolean = false): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, accept 123456 as valid code
      if (code === '123456' && pendingUser) {
        if (trustDeviceFlag) {
          trustDevice();
        }
        
        setUser(pendingUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(pendingUser));
        
        // Update online status
        const userIndex = users.findIndex(u => u.id === pendingUser.id);
        if (userIndex !== -1) {
          users[userIndex].isOnline = true;
        }
        
        setPendingUser(null);
        setRequires2FA(false);
        toast.success('2FA verified successfully!');
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user based on role
      let newUser: any;
      
      if (role === 'entrepreneur') {
        newUser = {
          id: `ent${users.length + 1}`,
          name,
          email,
          role: 'entrepreneur' as const,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString(),
          startupName: '',
          pitchSummary: '',
          fundingGoal: 0,
          industry: '',
          teamSize: 1
        };
      } else {
        newUser = {
          id: `inv${users.length + 1}`,
          name,
          email,
          role: 'investor' as const,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          bio: '',
          isOnline: true,
          createdAt: new Date().toISOString(),
          investmentInterests: [],
          investmentStage: [],
          portfolioCompanies: [],
          totalInvestments: 0,
          averageCheckSize: 0
        };
      }
      
      // Add user to mock data
      users.push(newUser);
      
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists
      const foundUser = users.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('No account found with this email');
      }
      
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(RESET_TOKEN_KEY, resetToken);
      
      // In a real app, this would send an email
      toast.success('Password reset instructions sent to your email');
      
      // For demo, show token in console
      console.log('Reset token:', resetToken);
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify token
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (token !== storedToken) {
        throw new Error('Invalid or expired reset token');
      }
      
      // In a real app, this would update the user's password in the database
      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    if (user) {
      setUserOffline(user.id);
    }
    setUser(null);
    setPendingUser(null);
    setRequires2FA(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (userId: string, updates: Partial<any>): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in mock data
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      
      // Update current user if it's the same user
      if (user?.id === userId) {
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would verify current password and update
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    verify2FA,
    requires2FA,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};