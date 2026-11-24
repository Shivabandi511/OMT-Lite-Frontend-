import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OmtLogoLoader } from '../components/common/OmtLogoLoader';
import { validatePassword, validatePasswordConfirmation } from '../utils/passwordValidator';
import { PasswordRequirements } from '../components/auth/PasswordRequirements';
import {
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

export const Profile: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  // Profile info state
  const [fullName, setFullName] = useState(user?.name || 'Shiva Test');
  const [email] = useState(user?.email || 'bandishivakumar880@gmail.com');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password submission state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user?.name]);

  // Compute initials (e.g. Shiva Test -> ST)
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/mfa/login', { replace: true });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError('Full Name cannot be empty.');
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);
      setProfileSuccess(null);
      await updateProfile(fullName.trim());
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.error || 'Password does not meet complexity requirements.');
      return;
    }

    const confirmCheck = validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmCheck.isValid) {
      setPasswordError(confirmCheck.error || 'Confirm Password must match Password.');
      return;
    }

    try {
      setPasswordLoading(true);
      const msg = await changePassword(currentPassword, newPassword);
      setPasswordSuccess(msg || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleTitle = user?.role === 'ADMIN' ? 'Assistant Manager - IMO' : 'Operations Specialist - IMO';

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Header Section matching screenshot */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          {/* Gray small breadcrumb */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#8e8d9c',
              marginBottom: 4,
            }}
          >
            Profile
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: 26,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0',
            }}
          >
            Profile
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 13,
              color: '#6b7280',
              margin: 0,
            }}
          >
            Manage your account settings and password
          </p>
        </div>

        {/* Sign Out Button matching screenshot */}
        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #f87171',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(239, 68, 68, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#f87171';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <FiLogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>

      {/* Two Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        {/* Left Card: Profile Details */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            border: '1px solid #ebe8f3',
            boxShadow: '0 2px 10px rgba(134, 51, 243, 0.04)',
            padding: '28px 30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {profileLoading && (
            <OmtLogoLoader overlay text="Saving Profile..." size="sm" />
          )}

          {/* User Header with Avatar & Details */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 28,
            }}
          >
            {/* Round Purple Avatar with ST */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                flexShrink: 0,
              }}
            >
              {getInitials(fullName)}
            </div>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: 2,
                }}
              >
                {fullName || 'Shiva Test'}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                {roleTitle}
              </div>
            </div>
          </div>

          {/* Success / Error Banners */}
          {profileSuccess && (
            <div
              style={{
                marginBottom: 20,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiCheckCircle size={16} color="#059669" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div
              style={{
                marginBottom: 20,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiAlertCircle size={16} color="#dc2626" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              flex: 1,
            }}
          >
            {/* Full Name Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#8633f3';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(134, 51, 243, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email Field (Disabled) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                readOnly
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'not-allowed',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Save Button pinned to bottom right */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  padding: '10px 22px',
                  backgroundColor: '#8633f3',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.1s ease',
                  boxShadow: '0 2px 8px rgba(134, 51, 243, 0.28)',
                }}
                onMouseEnter={(e) => {
                  if (!profileLoading) e.currentTarget.style.backgroundColor = '#7115d6';
                }}
                onMouseLeave={(e) => {
                  if (!profileLoading) e.currentTarget.style.backgroundColor = '#8633f3';
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Change Password */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 14,
            border: '1px solid #ebe8f3',
            boxShadow: '0 2px 10px rgba(134, 51, 243, 0.04)',
            padding: '28px 30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {passwordLoading && (
            <OmtLogoLoader overlay text="Updating Password..." size="sm" />
          )}

          {/* Card Header */}
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#111827',
                margin: '0 0 6px 0',
              }}
            >
              Change Password
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Use a strong password you don't use elsewhere. Minimum 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          {/* Success / Error Banners */}
          {passwordSuccess && (
            <div
              style={{
                marginBottom: 18,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiCheckCircle size={16} color="#059669" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div
              style={{
                marginBottom: 18,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiAlertCircle size={16} color="#dc2626" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Password Form */}
          <form
            onSubmit={handleChangePassword}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              flex: 1,
            }}
          >
            {/* Current Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#8633f3';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(134, 51, 243, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Uppercase, lowercase, number & symbol"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#8633f3';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(134, 51, 243, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <PasswordRequirements password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#8633f3';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(134, 51, 243, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Change Password Button pinned to bottom right */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  padding: '10px 22px',
                  backgroundColor: '#8633f3',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.1s ease',
                  boxShadow: '0 2px 8px rgba(134, 51, 243, 0.28)',
                }}
                onMouseEnter={(e) => {
                  if (!passwordLoading) e.currentTarget.style.backgroundColor = '#7115d6';
                }}
                onMouseLeave={(e) => {
                  if (!passwordLoading) e.currentTarget.style.backgroundColor = '#8633f3';
                }}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
