import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';

interface TwoFactorAuthProps {
  onVerify: (success: boolean) => void;
  onCancel?: () => void;
  method?: 'sms' | 'email' | 'app';
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ 
  onVerify, 
  onCancel, 
  method = 'app' 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const correctOtp = '123456'; // Mock OTP for testing

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, resendDisabled]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setVerifying(true);
    // Simulate API call
    setTimeout(() => {
      if (otpValue === correctOtp) {
        onVerify(true);
      } else {
        setError('Invalid verification code. Please try again.');
        setVerifying(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    setResendDisabled(true);
    setTimeLeft(60);
    setError('');
    // Mock resend logic
    alert('A new verification code has been sent to your device.');
  };

  const getMethodIcon = () => {
    switch (method) {
      case 'sms':
        return <Smartphone size={48} className="text-blue-500" />;
      case 'email':
        return <Key size={48} className="text-purple-500" />;
      default:
        return <Shield size={48} className="text-green-500" />;
    }
  };

  const getMethodText = () => {
    switch (method) {
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      default:
        return 'Authenticator App';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getMethodIcon()}
        </div>
        <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the verification code from your {getMethodText()}
        </p>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 text-center">
            Verification Code
          </label>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className={`text-sm ${
              resendDisabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {resendDisabled ? `Resend code in ${timeLeft}s` : 'Resend Code'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleVerify} disabled={verifying} fullWidth>
            {verifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} fullWidth>
              Cancel
            </Button>
          )}
        </div>

        {/* Trust Device Checkbox */}
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-gray-300" />
          <span className="text-sm text-gray-600">Trust this device for 30 days</span>
        </label>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            For demo purposes, use code: <strong className="font-mono">123456</strong>
          </p>
        </div>
      </CardBody>
    </Card>
  );
};