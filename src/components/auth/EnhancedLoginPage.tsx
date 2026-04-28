import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { TwoFactorAuth } from '../../components/auth/TwoFactorAuth';
import { useAuth } from '../../context/AuthContext';

type LoginStep = 'credentials' | '2fa';

export const EnhancedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        // Mock successful login - move to 2FA step
        setStep('2fa');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  };

  const handle2FAVerify = (success: boolean) => {
    if (success) {
      // Mock login with role-based redirect
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: email,
        role: email.includes('investor') ? 'investor' : 'entrepreneur',
        avatarUrl: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
        isOnline: true
      };
      login(mockUser);
      
      // Redirect based on role
      if (mockUser.role === 'investor') {
        navigate('/dashboard/investor');
      } else {
        navigate('/dashboard/entrepreneur');
      }
    } else {
      setError('2FA verification failed');
      setStep('credentials');
    }
  };

  if (step === '2fa') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <TwoFactorAuth
          onVerify={handle2FAVerify}
          onCancel={() => {
            setStep('credentials');
            setError('');
          }}
          method="app"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield size={32} className="text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to your account securely
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>

            {/* Demo Credentials */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center mb-2">
                Demo Credentials:
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Entrepreneur: entrepreneur@example.com / any password (use 123456 for 2FA)</p>
                <p>Investor: investor@example.com / any password (use 123456 for 2FA)</p>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};