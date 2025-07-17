'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';

interface PasswordRequirement {
  id: string;
  text: string;
  test: (password: string) => boolean;
  met: boolean;
}

// Toast type
interface ToastType {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const useToast = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const addToast = (message: string, type: ToastType['type'] = 'info') => {
    const id = Date.now();
    const toast: ToastType = { id, message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };
  return { toasts, setToasts, addToast };
};

const Toast: React.FC<{ toast: ToastType; onClose: () => void }> = ({ toast, onClose }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    toast.type === 'success' ? 'bg-green-500' : 
    toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } text-white`}>
    <div className="flex items-center justify-between">
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
    </div>
  </div>
);

const SignupScreen = () => {
  const router = useRouter();
  const { toasts, setToasts, addToast } = useToast();
  const setEmailForVerification = useAuthStore((state) => state.setEmailForVerification);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    rememberMe: false
  });

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'minimum of 8 characters', test: (pwd) => pwd.length >= 8, met: false },
    { id: 'uppercase', text: 'one uppercase letter', test: (pwd) => /[A-Z]/.test(pwd), met: false },
    { id: 'lowercase', text: 'one lowercase letter', test: (pwd) => /[a-z]/.test(pwd), met: false },
    { id: 'number', text: 'one number', test: (pwd) => /\d/.test(pwd), met: false },
    { id: 'symbol', text: 'one symbol', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), met: false }
  ]);

  const [passwordStrength, setPasswordStrength] = useState<'empty' | 'weak' | 'medium' | 'strong'>('empty');
  const [showRequirements, setShowRequirements] = useState(true);
  const [showUserExistsModal, setShowUserExistsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData.password === '') {
      setPasswordStrength('empty');
      setShowRequirements(true);
      setPasswordRequirements(prev => prev.map(req => ({ ...req, met: false })));
      return;
    }

    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      met: req.test(formData.password)
    }));

    setPasswordRequirements(updatedRequirements);

    const metCount = updatedRequirements.filter(req => req.met).length;
    setPasswordStrength(
      metCount <= 2 ? 'weak' : metCount <= 4 ? 'medium' : 'strong'
    );

    if (metCount === 5) {
      setTimeout(() => setShowRequirements(false), 1500);
    }
  }, [formData.password]);

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Too Weak';
      case 'medium': return 'Almost there';
      case 'strong': return 'Great!';
      default: return '';
    }
  };

  const getStrengthBarWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/4';
      case 'medium': return 'w-3/5';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const getStrengthBarColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password' && value !== '' && !showRequirements) {
      setShowRequirements(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const submission = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
    };
    console.log('🔄 Submitting signup form:', submission);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Signup failed');
      setEmailForVerification(formData.email);
      addToast('Signup Successful! Please check your email to verify your account.', 'success');
      router.push('/verify-email');
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      if (error?.message?.toLowerCase().includes('exist')) {
        setShowUserExistsModal(true);
      } else {
        addToast('Signup Failed: ' + (error?.message || 'Something went wrong.'), 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
      {/* Left Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <Image src="/auth.webp" alt="Authentication" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-sm">HAREWA - All rights reserved</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 pt-4 py-12 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image src="/logo.webp" alt="HAREWA Logo" fill className="object-contain" />
            </div>
          </div>

          <div className="text-center -mt-12">
            <h1 className="text-4xl font-bold text-black">Create account</h1>
            <p className="mt-2 text-sm text-black">Fill in your login credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="info@harewa.com"
              required
              className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
            />

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
              />

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#FDC713] border-gray-300 rounded focus:ring-[#FDC713]"
                  />
                  <span className="ml-2 text-sm text-[#1A1A1AB2]">Remember me</span>
                </label>
                <a href="reset-password" className="text-sm text-[#1A1A1A] hover:underline">
                  Forgot password?
                </a>
              </div>

              {formData.password && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-1 bg-gray-200 rounded-full flex-1 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthBarWidth()} ${getStrengthBarColor()}`}
                      />
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      passwordStrength === 'weak' ? 'text-red-500' :
                      passwordStrength === 'medium' ? 'text-yellow-500' :
                      passwordStrength === 'strong' ? 'text-green-500' : ''
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  {showRequirements && (
                    <div className="space-y-2 mt-3">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.id}
                          className={`flex items-center text-xs transition-all duration-300 ${
                            req.met ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold transition-colors duration-300 ${
                            req.met ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {req.met ? '✓' : '×'}
                          </div>
                          <span>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-black">
              Already have an account?{' '}
              <a href="/signin" className="text-[#FDC713] hover:underline">
                Login here
              </a>
            </div>
          </form>
        </div>
      </div>
      {showUserExistsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">User is already registered.</h2>
            <p className="mb-6">You already have an account with this email.</p>
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg mb-2"
              onClick={() => router.push('/signin')}
            >
              Login instead
            </button>
            <button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
              onClick={() => setShowUserExistsModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupScreen;