import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { PasswordRequirements } from '../components/auth/PasswordRequirements';
import { validatePassword, validatePasswordConfirmation } from '../utils/passwordValidator';
import api from '../services/api';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Empty validation
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    // Password strength validation
    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setError(passValidation.error || 'Password does not meet complexity standards.');
      return;
    }

    // Password confirmation match
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      setError(confirmValidation.error || 'Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMsg('Account registered successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/mfa/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <div className="auth-header" style={{ marginBottom: 14 }}>
          <h1 className="auth-title" style={{ fontSize: 22, margin: '0 0 4px 0' }}>Create an Account</h1>
          <p className="auth-subtitle" style={{ margin: 0, fontSize: 12 }}>
            Sign up to access OMT Platform yard and vehicle asset operations.
          </p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 10, padding: '8px 12px', fontSize: 12 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              color: '#065f46',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="auth-label" style={{ marginBottom: 4, fontSize: 10 }}>
              FULL NAME
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shiva Kumar"
              className="auth-input"
              style={{ padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="reg-email" className="auth-label" style={{ marginBottom: 4, fontSize: 10 }}>
              EMAIL ADDRESS
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="auth-input"
              style={{ padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          {/* Password with Show/Hide visibility */}
          <div>
            <label htmlFor="reg-password" className="auth-label" style={{ marginBottom: 4, fontSize: 10 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                maxLength={64}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 to 64 chars (12–15+ recommended)"
                className="auth-input auth-input-password"
                style={{ padding: '8px 36px 8px 12px', fontSize: 13 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8e8d9c',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordRequirements password={password} />
          </div>

          {/* Confirm Password with Show/Hide visibility */}
          <div>
            <label htmlFor="reg-confirm-password" className="auth-label" style={{ marginBottom: 4, fontSize: 10 }}>
              CONFIRM PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                maxLength={64}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="auth-input auth-input-password"
                style={{ padding: '8px 36px 8px 12px', fontSize: 13 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8e8d9c',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 8,
              width: '100%',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: '#656375' }}>
          Already have an account?{' '}
          <Link to="/mfa/login" style={{ color: '#8633f3', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};
