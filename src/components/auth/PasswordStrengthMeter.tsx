import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements: StrengthRequirement[] = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  const calculateStrength = (): { score: number; label: string; color: string } => {
    let score = 0;
    requirements.forEach(req => {
      if (req.test(password)) score++;
    });

    if (score === 0) return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-orange-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = calculateStrength();
  const percentage = (strength.score / 4) * 100;

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Password Strength</span>
          <span className={`text-xs font-semibold ${
            strength.label === 'Strong' ? 'text-green-600' :
            strength.label === 'Good' ? 'text-blue-600' :
            strength.label === 'Fair' ? 'text-yellow-600' :
            strength.label === 'Weak' ? 'text-orange-600' :
            'text-red-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-700">Password requirements:</p>
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {isMet ? (
                <CheckCircle size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-gray-400" />
              )}
              <span className={isMet ? 'text-green-700' : 'text-gray-500'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Security Tips */}
      {strength.score <= 2 && password.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-yellow-800">Security Tip</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Use a mix of uppercase, lowercase, numbers, and special characters for a stronger password.
              </p>
            </div>
          </div>
        </div>
      )}

      {strength.label === 'Strong' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-green-800">Strong Password!</p>
              <p className="text-xs text-green-700 mt-0.5">
                Your password meets all security requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};