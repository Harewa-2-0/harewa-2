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
  type: 'wrong_password' | 'account_not_found' | 'not_verified' | 'google_error' | 'generic';
  message: string;
}

interface AuthState {
  isLoading: boolean;
  isGoogleLoading: boolean;
  showSuccess: boolean;
  isRedirecting: boolean;
  loginError: LoginError | null;
  showWrongPassword: boolean;
}

const SigninScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
    fullName: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const router = useRouter();
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    isGoogleLoading: false,
    showSuccess: false,
    isRedirecting: false,
    loginError: null,
    showWrongPassword: false,
  });
  
  const { setEmailForVerification, setUser } = useAuthStore();

  // Reset auth state helper
  const resetAuthState = () => {
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      isGoogleLoading: false,
      loginError: null,
      showWrongPassword: false,
    }));
  };

  // Handle successful authentication
  const handleAuthSuccess = (userData: any, rememberMe: boolean = false) => {
    const user = {
      id: userData?.id || 'local',
      email: userData?.email || formData.email,
      fullName: userData?.fullName || userData?.name || formData.fullName || undefined,
      name: userData?.name || userData?.fullName || formData.fullName || undefined,
      role: userData?.role || 'user',
      avatar: userData?.avatar || userData?.picture || undefined,
    };

    setUser(user, rememberMe ? "localStorage" : "sessionStorage");
    
    setAuthState(prev => ({
      ...prev,
      showSuccess: true,
      isLoading: false,
      isGoogleLoading: false,
    }));
    
    // Redirect after showing success message
    setTimeout(() => {
      setAuthState(prev => ({ ...prev, isRedirecting: true }));
      router.push('/home');
    }, 2000);
  };

  // Handle authentication errors
  const handleAuthError = (error: any, isGoogleAuth: boolean = false) => {
    const errorMessage = error.message || error.error || 'Something went wrong. Please try again.';
    
    let errorType: LoginError['type'] = 'generic';
    let displayMessage = errorMessage;

    if (isGoogleAuth) {
      errorType = 'google_error';
      displayMessage = 'Google authentication failed. Please try again.';
    } else if (errorMessage.toLowerCase().includes('not verified')) {
      errorType = 'not_verified';
      displayMessage = 'Eyes on your mail! We sent an OTP.';
      setEmailForVerification(formData.email);
      router.push('/verify-email');
      return;
    } else if (errorMessage.toLowerCase().includes('wrong password')) {
      errorType = 'wrong_password';
      displayMessage = 'Incorrect password. Please try again.';
      setAuthState(prev => ({ ...prev, showWrongPassword: true }));
    } else if (errorMessage.toLowerCase().includes('account does not exist') || 
               errorMessage.toLowerCase().includes('user not found')) {
      errorType = 'account_not_found';
      displayMessage = 'No account found with this email address.';
    }

    setAuthState(prev => ({
      ...prev,
      loginError: { type: errorType, message: displayMessage },
      isLoading: false,
      isGoogleLoading: false,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (authState.loginError) {
      setAuthState(prev => ({
        ...prev,
        loginError: null,
        showWrongPassword: name === 'password' ? false : prev.showWrongPassword,
      }));
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setAuthState(prev => ({
        ...prev,
        loginError: { type: 'generic', message: 'Please fill in all required fields.' }
      }));
      return;
    }

    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      loginError: null,
      showWrongPassword: false,
    }));
    
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
        handleAuthError(data);
        return;
      }

      handleAuthSuccess(data.user, formData.rememberMe);
      
    } catch (err) {
      console.error('Login error:', err);
      handleAuthError({ message: 'Network error. Please check your connection and try again.' });
    }
  };

  const handleGoogleLogin = async () => {
    setAuthState(prev => ({
      ...prev,
      isGoogleLoading: true,
      loginError: null,
    }));

    try {
      // Open popup with Google OAuth
      const popup = window.open(
        '/api/auth/google',
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Check popup status every second
      const checkPopup = setInterval(() => {
        try {
          // If popup is closed, stop checking
          if (popup.closed) {
            clearInterval(checkPopup);
            setAuthState(prev => ({
              ...prev,
              isGoogleLoading: false,
            }));
            return;
          }

          // Check if popup has been redirected to home page (successful auth)
          if (popup.location.href === window.location.origin + '/' || 
              popup.location.href === window.location.origin + '/?' ||
              popup.location.href === window.location.origin + '/#') {
            clearInterval(checkPopup);
            
            // Success! User is authenticated with cookies set
            // Try to fetch user data from backend
            (async () => {
              try {
                const userResponse = await fetch('/api/auth/me', {
                  credentials: 'include', // Include cookies
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  
                  // Create user object from the profile data
                  const user = {
                    id: userData.user?._id || 'google',
                    email: userData.user?.email || 'google@example.com',
                    fullName: userData.user?.fullName || userData.user?.name || 'Google User',
                    name: userData.user?.name || userData.user?.fullName || 'Google User',
                    role: (userData.user?.role || 'client') as 'user' | 'admin',
                    avatar: userData.user?.avatar,
                  };

                  setUser(user, 'localStorage');
                } else {
                  // Fallback to basic user object if we can't fetch user data
                  const user = {
                    id: 'google',
                    email: 'google@example.com',
                    fullName: 'Google User',
                    name: 'Google User',
                    role: 'user' as const,
                    avatar: undefined,
                  };

                  setUser(user, 'localStorage');
                }
              } catch (fetchError) {
                console.error('Failed to fetch user data:', fetchError);
                // Fallback to basic user object
                const user = {
                  id: 'google',
                  email: 'google@example.com',
                  fullName: 'Google User',
                  name: 'Google User',
                  role: 'user' as const,
                  avatar: undefined,
                };

                setUser(user, 'localStorage');
              }
            })();
            
            setAuthState(prev => ({
              ...prev,
              showSuccess: true,
              isGoogleLoading: false,
            }));
            
            // Redirect after showing success message
            setTimeout(() => {
              setAuthState(prev => ({ ...prev, isRedirecting: true }));
              router.push('/home');
            }, 2000);

            // Close the popup
            popup.close();
          }
          
          // Check if popup has been redirected to error page
          if (popup.location.href.includes('/login?error=')) {
            clearInterval(checkPopup);
            
            // Extract error from URL
            const urlParams = new URLSearchParams(popup.location.search);
            const error = urlParams.get('error') || 'Authentication failed';
            
            let errorMessage = 'Google authentication failed.';
            switch (error) {
              case 'NoCode':
                errorMessage = 'No authorization code received from Google.';
                break;
              case 'TokenExchangeFailed':
                errorMessage = 'Failed to exchange authorization code for token.';
                break;
              case 'NoProfile':
                errorMessage = 'Failed to fetch user profile from Google.';
                break;
              default:
                errorMessage = `Google authentication failed: ${error}`;
            }
            
            handleAuthError({ message: errorMessage }, true);
            popup.close();
          }
          
          // Check if popup is stuck on callback URL (might be a backend error)
          if (popup.location.href.includes('/api/auth/google/callback') && 
              !popup.location.href.includes('error=')) {
            // Wait a bit longer, but if it's stuck for more than 10 seconds, show error
            setTimeout(() => {
              if (popup.location.href.includes('/api/auth/google/callback')) {
                clearInterval(checkPopup);
                handleAuthError({ message: 'Google authentication is taking too long. Please try again.' }, true);
                popup.close();
              }
            }, 10000);
          }
        } catch (error) {
          // Cross-origin error - popup is still on Google's domain
          // This is expected, continue checking
        }
      }, 1000);

      // Set a timeout to prevent hanging (5 minutes)
      setTimeout(() => {
        clearInterval(checkPopup);
        if (!popup.closed) {
          popup.close();
        }
        setAuthState(prev => ({
          ...prev,
          isGoogleLoading: false,
        }));
        handleAuthError({ message: 'Google authentication timed out. Please try again.' }, true);
      }, 300000); // 5 minutes

    } catch (err) {
      console.error('Google login error:', err);
      handleAuthError({ message: err instanceof Error ? err.message : 'Failed to initialize Google login.' }, true);
    }
  };

  const isFormDisabled = authState.isLoading || authState.showSuccess || authState.isRedirecting;
  const isGoogleDisabled = authState.isGoogleLoading || authState.showSuccess || authState.isRedirecting;

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
      <div className="flex-1 flex items-center justify-center px-6 bg-white lg:px-8 py-8 md:-mt-12 md:py-0 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo */}
          <div className="flex justify-center ">
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
          <div className="text-center -mt-10 md:-mt-15">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Messages */}
          {authState.loginError && (
            <div className="w-full text-center text-red-600 font-medium mb-2 animate-fade-in bg-red-50 border border-red-200 rounded-lg py-3 px-4">
              {authState.loginError.message}
            </div>
          )}
          
          {authState.showSuccess && (
            <div className="w-full text-center font-medium mb-4 animate-fade-in text-[#11E215] bg-green-50 border border-green-200 rounded-lg py-3 px-4">
              ✅ {authState.isRedirecting ? 'Login successful! Redirecting to home page...' : 'Login successful! Preparing to redirect...'}
            </div>
          )}

        

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="Email*"
                required
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 bg-[#F2F2F2] border rounded-lg transition-all duration-300 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                  focusedField === 'email' ? 'outline-none ring-2 ring-yellow-400 border-transparent' : 'outline-none border-transparent'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                placeholder="Password*"
                required
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 pr-12 bg-[#F2F2F2] border rounded-lg transition-all duration-300 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                  focusedField === 'password' ? 'outline-none ring-2 ring-yellow-400 border-transparent' : 'outline-none border-transparent'
                } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500 text-lg pointer-events-none">*</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isFormDisabled}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 ${
                  isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className={`flex items-center group cursor-pointer ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">Remember me</span>
              </label> 
              <a 
                href="/reset-password" 
                className={`text-sm text-gray-700 hover:text-yellow-600 transition-colors duration-200 hover:underline ${
                  isFormDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className={`w-full bg-[#D4AF37] text-white py-3 px-4 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                isFormDisabled
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-yellow-500 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {authState.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : authState.showSuccess || authState.isRedirecting ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {authState.isRedirecting ? 'Redirecting to Home...' : 'Login Successful!'}
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-yellow-600 font-medium hover:text-yellow-700 transition-colors duration-200 hover:underline">
              Sign Up
            </a>
          </div>

          {/* Terms */}
          <div className="text-center text-xs text-gray-500 mt-6 md:mt-0">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
              Terms of Service
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
              Privacy Policy
            </a>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleDisabled}
            className={`w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center gap-3 ${
              isGoogleDisabled
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-gray-50 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {authState.isGoogleLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in with Google...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

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