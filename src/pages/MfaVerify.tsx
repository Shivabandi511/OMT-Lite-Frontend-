import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const MfaVerify: React.FC = () => {
  const { loginMfaVerify, loginMfaInit } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as { email?: string; from?: string } | null;
  const email = locationState?.email || sessionStorage.getItem('pending_mfa_email') || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(39);
  const [expirySeconds, setExpirySeconds] = useState(279); // 04:39

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const from = locationState?.from || '/dashboard';

  useEffect(() => {
    if (!email) {
      navigate('/mfa/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const arr = pasted.split('');
      setOtpDigits(arr);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await loginMfaVerify(email, fullOtp);

      sessionStorage.removeItem('pending_mfa_email');
      sessionStorage.removeItem('pending_mfa_debug_otp');

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0) return;
    try {
      setError(null);
      await loginMfaInit(email, '');
      setResendSeconds(39);
      setExpirySeconds(279);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <AuthSplitLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Verify your identity</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 6 Digit Input Boxes */}
          <div className="auth-otp-grid">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className={`auth-otp-box ${digit ? 'filled' : ''}`}
              />
            ))}
          </div>

          {/* Expiration Timer */}
          <div className="auth-timer">
            Code expires in{' '}
            <strong className={expirySeconds < 60 ? 'auth-timer-warning' : ''}>
              {formatTimer(expirySeconds)}
            </strong>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 8,
              width: '100%',
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          {/* Resend Link */}
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendSeconds > 0}
              className="auth-resend-btn"
            >
              {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code now'}
            </button>
          </div>

          {/* Back to sign in */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/mfa/login" className="auth-back-link">
              <ArrowLeft size={14} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </AuthSplitLayout>
  );
};
