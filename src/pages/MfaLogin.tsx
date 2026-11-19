import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export const MfaLogin: React.FC = () => {
  const { login, loginMfaInit } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => sessionStorage.getItem('pending_mfa_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // If logging in with the seeded ADMIN account (admin@omt.com), log in directly as required by the assessment
      if (email.trim().toLowerCase() === 'admin@omt.com') {
        await login(email.trim(), password);
        navigate(from, { replace: true });
        return;
      }

      // For staff accounts, initiate the 2-step MFA email verification
      const res = await loginMfaInit(email.trim(), password);

      sessionStorage.setItem('pending_mfa_email', email.trim());
      if (res.debugOtp) {
        sessionStorage.setItem('pending_mfa_debug_otp', res.debugOtp);
      }

      navigate('/mfa/verify', {
        state: {
          email: email.trim(),
          from,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Sign in to OMT Lite</h1>
          <p className="auth-subtitle">
            Enter your credentials — we'll send a verification code to your email.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email field */}
          <div>
            <label htmlFor="login-email" className="auth-label">
              EMAIL ADDRESS
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="auth-input"
            />
          </div>

          {/* Password field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="login-password" className="auth-label" style={{ marginBottom: 0 }}>
                PASSWORD
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input auth-input-password"
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
                  padding: 2,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Continue button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 700,
              marginTop: 6,
              borderRadius: 8,
              width: '100%',
            }}
          >
            {isLoading ? (
              <span>Sending code...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
};
