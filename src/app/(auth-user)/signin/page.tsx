"use client"
import { useState } from 'react';
import { Mail, Eye, EyeOff, X } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
  fullName?: string;
}

interface LoginError {
  type: 'wrong_password' | 'account_not_found' | 'not_verified' | 'generic';
  message: string;
}

const SigninScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
    fullName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [showWrongPassword, setShowWrongPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { setEmailForVerification, setUser } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear password-specific errors when user starts typing
    if (name === 'password') {
      setShowWrongPassword(false);
      setLoginError(null);
    }
    
    // Clear all errors when user starts typing
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    setShowWrongPassword(false);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types based on backend response
        if (data.message && data.message.toLowerCase().includes('not verified')) {
          setLoginError({
            type: 'not_verified',
            message: 'Eyes on your mail! We sent an OTP.'
          });
          setEmailForVerification(formData.email);
          router.push('/verify-email');
        } else if (data.message && data.message.toLowerCase().includes('wrong password')) {
          setShowWrongPassword(true);
          setLoginError({
            type: 'wrong_password',
            message: 'Incorrect password. Please try again.'
          });
        } else if (data.message && data.message.toLowerCase().includes('account does not exist') || 
                   data.message && data.message.toLowerCase().includes('user not found')) {
          setLoginError({
            type: 'account_not_found',
            message: 'No account found with this email address.'
          });
        } else {
          setLoginError({
            type: 'generic',
            message: data.message || 'Something went wrong. Please try again.'
          });
        }
        setIsLoading(false);
        return;
      }

      // Success - Set user and show success state
      const userData = {
        id: data.user?.id || 'local',
        email: formData.email,
        fullName: data.user?.fullName || formData.fullName || undefined,
        name: data.user?.name || formData.fullName || undefined,
        role: data.user?.role || 'user',
        avatar: data.user?.avatar || undefined,
      };

      setUser(userData, formData.rememberMe ? "localStorage" : "sessionStorage");
      setShowSuccess(true);
      
      // Keep success message visible and redirect smoothly
      setTimeout(() => {
        setIsRedirecting(true);
        router.push('/');
      }, 2000);
      
    } catch (err) {
      console.error('Login error:', err);
      setLoginError({
        type: 'generic',
        message: 'Network error. Please check your connection and try again.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left-side image section */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <img
          src="/auth.webp"
          alt="Authentication"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-sm">HAREWA - All rights reserved</p>
        </div>
      </div>

      {/* Right-side form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white lg:px-8 py-8 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src="/logo.webp"
                alt="HAREWA Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center -mt-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-sm text-gray-600">Fill in your login credentials</p>
          </div>

          {/* Error Messages */}
          {loginError && (
            <div className="w-full text-center text-red-600 font-medium mb-2 animate-fade-in">
              {loginError.message}
            </div>
          )}
          
          {showSuccess && (
            <div className="w-full text-center font-medium mb-4 animate-fade-in text-[#11E215] bg-green-50 border border-green-200 rounded-lg py-3 px-4">
              ✅ {isRedirecting ? 'Login successful! Redirecting to home page...' : 'Login successful! Preparing to redirect...'}
            </div>
          )}

          {/* Form Container */}
          <div className="space-y-5">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="Email* "
                required
                className={`w-full px-4 py-3 bg-[#F2F2F2] border rounded-lg transition-all duration-300 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                  focusedField === 'email' ? 'outline-none ring-2 ring-yellow-400 border-transparent' : 'outline-none border-transparent'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg pointer-events-none">*</span>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="Password* "
                required
                className={`w-full px-4 py-3 pr-12 bg-[#F2F2F2] border rounded-lg transition-all duration-300 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                  focusedField === 'password' ? 'outline-none ring-2 ring-yellow-400 border-transparent' : 'outline-none border-transparent'
                }`}
              />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500 text-lg pointer-events-none">*</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              
              
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">Remember me</span>
              </label> 
              <a href="/reset-password" className="text-sm text-gray-700 hover:text-yellow-600 transition-colors duration-200 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || showSuccess || isRedirecting}
              className={`w-full bg-[#D4AF37] text-white py-3 px-4 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                isLoading || showSuccess || isRedirecting
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-yellow-500 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : showSuccess || isRedirecting ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isRedirecting ? 'Redirecting to Home...' : 'Login Successful!'}
                </div>
              ) : (
                'Login'
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-yellow-600 font-medium hover:text-yellow-700 transition-colors duration-200 hover:underline">
                Sign Up
              </a>
            </div>

            {/* Terms */}
            <div className="text-center text-xs text-gray-500 mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
                Terms of Service
              </a>{' '}
              &{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-pop {
          animation: pop-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pop-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SigninScreen;