"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '@/contexts/toast-context';

// Toast notifications are now handled globally by ToastContainer

interface VerifyEmailPageProps {
  email?: string;
}

export default function VerifyEmailPage({ email: emailProp }: VerifyEmailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  // Try multiple sources for email: auth store, URL param, or prop
  const emailFromStore = useAuthStore((state) => state.emailForVerification);
  const emailFromUrl = searchParams.get('email');
  const email = emailFromStore || emailFromUrl || emailProp || '';
  
  // Check if user signed up as admin
  const [signupRole, setSignupRole] = useState<string | null>(null);
  
  useEffect(() => {
    const role = localStorage.getItem('signupRole');
    setSignupRole(role);
  }, []);
  
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const setUser = useAuthStore((state) => state.setUser);
  const setEmailForVerification = useAuthStore((state) => state.setEmailForVerification);

  // Debug: Log email sources
  useEffect(() => {
    console.log('🔍 Email sources:', {
      fromStore: emailFromStore,
      fromUrl: emailFromUrl,
      fromProp: emailProp,
      final: email
    });
  }, [emailFromStore, emailFromUrl, emailProp, email]);

  // Timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus next input on change
  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Handle backspace to move focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Submit OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          otp: otp.join(''),
          email: email
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired OTP');
      }

      // Show success message first
      setVerificationSuccess(true);
      addToast('Verification successful! Logging you in...', 'success');

      // Wait a moment for user to see success message
      setTimeout(() => {
        setIsRedirecting(true);
        
        // Fetch user info after verification
        fetch('/api/auth/me')
          .then(meRes => meRes.json())
          .then(meData => {
            if (meData.user) {
              // Set user data in auth store
              const userData = {
                id: meData.user.id || 'local',
                email: email,
                fullName: meData.user.fullName || undefined,
                name: meData.user.name || meData.user.fullName || undefined,
                role: meData.user.role || 'user',
                avatar: meData.user.avatar || undefined,
              };
              setUser(userData, "localStorage");
              
              // Clear verification email and signup role
              setEmailForVerification('');
              localStorage.removeItem('signupRole');
              
              // Redirect based on user role after user data is set
              setTimeout(() => {
                if (userData.role === "admin") {
                  router.push('/admin');
                } else {
                  router.push('/');
                }
              }, 1000);
            } else {
              // Fallback: redirect to home
              router.push('/');
            }
          })
          .catch(err => {
            console.error('Failed to fetch user data:', err);
            // Fallback: redirect to home
            router.push('/');
          });
      }, 1500);
      
    } catch (err) {
      const error = err as Error;
      addToast(error.message || 'Failed to verify OTP', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      addToast('No email found. Please go back and try again.', 'error');
      return;
    }

    setResending(true);
    try {
      console.log('🔄 Resending OTP to:', email);
      
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📧 Resend response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      addToast('Verification code resent! Check your email.', 'success');
      setResendTimer(30);
    } catch (err) {
      console.error('❌ Resend error:', err);
      const error = err as Error;
      addToast(error.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16">
      {/* Logo in upper left */}
      <div className="absolute top-6 left-6">
        <img 
          src="/logo.webp" 
          alt="Logo" 
          className="h-8 w-auto cursor-pointer"
          onClick={() => router.push('/')}
        />
      </div>

      {/* Toast notifications are now handled globally by ToastContainer */}
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-lg flex items-center justify-center mb-8" style={{ backgroundColor: '#D4AF37' }}>
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verify your email
          </h2>
          <div className="text-gray-600 mb-8 space-y-1">
            {signupRole === "admin" ? (
              <>
                <p>
                  <span className="text-black font-semibold">
                    We have sent a message to your admin.
                  </span> Contact them for the OTP.
                </p>
                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <strong>Admin Account:</strong> The verification code was sent to the admin email. 
                  Please contact the admin to get your verification code.
                </p>
              </>
            ) : (
              <p>
                <span className="text-black font-semibold">
                  We sent a code to {email}.
                </span> Check your inbox or spam to verify your account.
              </p>
            )}
          </div>

          {/* Success Message */}
          {verificationSuccess && (
            <div className="w-full text-center font-medium mb-4 animate-fade-in text-[#11E215] bg-green-50 border border-green-200 rounded-lg py-3 px-4">
              ✅ {isRedirecting ? 'Verification successful! Redirecting to home page...' : 'Verification successful! Preparing to redirect...'}
            </div>
          )}

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="flex justify-center gap-2 mb-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  className="w-12 h-14 text-2xl text-center border border-gray-300 rounded-lg transition-all shadow-sm text-black"
                  style={{ 
                    backgroundColor: '#F2F2F2',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D4AF37';
                    e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  disabled={verifying || verificationSuccess}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || otp.some(d => d === '') || verificationSuccess}
              className="w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
              style={{ 
                backgroundColor: '#D4AF37',
                cursor: verifying || otp.some(d => d === '') || verificationSuccess ? 'not-allowed' : 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              {verifying ? 'Verifying...' : verificationSuccess ? (isRedirecting ? 'Redirecting...' : 'Verification Successful!') : 'Verify & Continue'}
            </button>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resending || verificationSuccess}
              className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              style={{
                cursor: resendTimer > 0 || resending || verificationSuccess ? 'not-allowed' : 'pointer'
              }}
            >
              {resendTimer > 0 ? `Didn't get it? Resend code (${resendTimer}s)` : "Didn't get it? Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}