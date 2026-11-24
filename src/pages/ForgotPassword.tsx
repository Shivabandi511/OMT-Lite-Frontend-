import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { validatePassword, validatePasswordConfirmation } from '../utils/passwordValidator';
import { PasswordRequirements } from '../components/auth/PasswordRequirements';

export const ForgotPassword: React.FC = () => {
  const { sendForgotPasswordOtp, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await sendForgotPasswordOtp(email.trim());
      setStep('reset');
      setSuccessMsg('A 6-digit verification code has been dispatched to your email.');
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.error || 'Password does not meet complexity requirements.');
      return;
    }

    const confirmCheck = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmCheck.isValid) {
      setError(confirmCheck.error || 'New password and confirm password do not match.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await resetPasswordWithOtp(email, fullOtp, newPassword);
      setSuccessMsg('Password has been successfully changed! Redirecting to sign in...');
      setTimeout(() => navigate('/mfa/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#ffffff',
          borderRadius: 20,
          border: '1px solid #ebe8f5',
          boxShadow: '0 12px 36px -8px rgba(134, 51, 243, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)',
          padding: '40px 36px',
        }}
      >
        {step === 'request' ? (
          /* ================= STEP 1: REQUEST OTP (Matching Image 4) ================= */
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 24,
                  fontWeight: 800,
                  color: 'var(--omt-color-text-main)',
                  letterSpacing: '-0.02em',
                  marginBottom: 6,
                }}
              >
                Forgot password
              </h1>
              <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', lineHeight: 1.5 }}>
                We'll send a verification code to your email
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 18,
                  border: '1px solid #fecaca',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label
                  htmlFor="forgot-email"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#656375',
                    marginBottom: 6,
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #dcd9e8',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8633f3')}
                  onBlur={(e) => (e.target.style.borderColor = '#dcd9e8')}
                />
              </div>

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
                {isLoading ? (
                  <span>Sending code...</span>
                ) : (
                  <>
                    <span>Send verification code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Link
                  to="/mfa/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#5f5f6c',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* ================= STEP 2: VERIFY OTP & ENTER NEW PASSWORD ================= */
          <div>
            <div style={{ marginBottom: 20 }}>
              <h1
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--omt-color-text-main)',
                  letterSpacing: '-0.02em',
                  marginBottom: 6,
                }}
              >
                Set new password
              </h1>
              <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)' }}>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                  border: '1px solid #fecaca',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                  border: '1px solid #a7f3d0',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 6 Digit OTP input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#656375',
                    marginBottom: 8,
                  }}
                >
                  6-DIGIT VERIFICATION CODE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, width: '100%', boxSizing: 'border-box' }}>
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
                      style={{
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        height: 48,
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 800,
                        borderRadius: 8,
                        border: digit ? '2px solid #8633f3' : '1px solid #dcd9e8',
                        outline: 'none',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="reset-new-password"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#656375',
                    marginBottom: 6,
                  }}
                >
                  NEW PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: 8,
                      border: '1px solid #dcd9e8',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8e8d9c',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordRequirements password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reset-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#656375',
                    marginBottom: 6,
                  }}
                >
                  CONFIRM PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: 8,
                      border: '1px solid #dcd9e8',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8e8d9c',
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

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
                  marginTop: 6,
                }}
              >
                {isLoading ? 'Resetting Password...' : 'Change Password & Sign In'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5f5f6c',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Request a different code
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
};
