import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { User, UserCreatePayload } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Power,
  Sliders,
  Mail,
  X,
  RefreshCw,
} from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserCreatePayload>({
    name: '',
    email: '',
    role: 'STAFF',
    canMakeOperations: true,
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const finalPassword = formData.password?.trim() || 'Staff@2026';
      await api.post('/users', {
        ...formData,
        password: finalPassword,
      });

      setSuccessMsg(`User account created and welcome email dispatched to ${formData.email}.`);
      setCreatedCredentials({ email: formData.email, pass: finalPassword });
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'STAFF',
        canMakeOperations: true,
        password: '',
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleOperations = async (targetUser: User) => {
    const updatedValue = !targetUser.canMakeOperations;
    const confirmMsg = updatedValue
      ? `Grant full operational access to ${targetUser.name}? They will be able to register and update vehicles.`
      : `Restrict ${targetUser.name} to Read-Only access? They will no longer be able to create or edit vehicles.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setError(null);
      await api.put(`/users/${targetUser.id}/permissions`, {
        canMakeOperations: updatedValue,
      });
      setSuccessMsg(
        `Permissions updated: ${targetUser.name} is now ${
          updatedValue ? 'granted Full Operations' : 'restricted to Read-Only'
        }.`
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user permissions.');
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot deactivate your own Tenant Administrator account.');
      return;
    }

    const updatedValue = !targetUser.active;
    if (!window.confirm(`${updatedValue ? 'Activate' : 'Deactivate'} ${targetUser.name}'s account?`)) return;

    try {
      setError(null);
      await api.put(`/users/${targetUser.id}/permissions`, {
        active: updatedValue,
      });
      setSuccessMsg(`Account status updated for ${targetUser.name}.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle account status.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--omt-color-text-main)',
            }}
          >
            Workforce &amp; Staff Access
          </h1>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
            Manage staff accounts, dispatch onboarding credentials, and control operational permissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchUsers} className="btn-secondary" title="Refresh user list">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <UserPlus size={15} />
            <span>Invite Staff Member</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            border: '1px solid #a7f3d0',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Recent Dispatched Credentials Callout */}
      {createdCredentials && (
        <div
          style={{
            backgroundColor: '#f5f0ff',
            border: '1px solid #ddd6fe',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Mail size={20} color="#7c3aed" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#5b21b6' }}>
                Credentials Dispatched to Staff Email
              </div>
              <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 2 }}>
                An invitation email was triggered for <strong>{createdCredentials.email}</strong> with initial password{' '}
                <code style={{ background: '#ede9fe', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  {createdCredentials.pass}
                </code>
                . Staff can sign in and change password via OTP at any time.
              </div>
            </div>
          </div>
          <button
            onClick={() => setCreatedCredentials(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="omt-table-wrapper">
        <table className="omt-table">
          <thead>
            <tr>
              <th>User Name &amp; Email</th>
              <th>Role</th>
              <th>Operational Access</th>
              <th>Account Status</th>
              <th style={{ textAlign: 'right' }}>Permission Controls</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#8e8d9c' }}>
                  Loading workforce directory...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#8e8d9c' }}>
                  <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <div>No user accounts found.</div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #8633f3 0%, #7115d6 100%)' : '#d97706',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--omt-color-text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#8e8d9c' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: u.role === 'ADMIN' ? '#efe7ff' : '#fef3c7',
                        color: u.role === 'ADMIN' ? '#7c3aed' : '#b45309',
                      }}
                    >
                      {u.role === 'ADMIN' ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.role === 'ADMIN' ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        Full Tenant Admin Access
                      </span>
                    ) : u.canMakeOperations ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Full Operations (Create &amp; Edit)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#d97706',
                          backgroundColor: '#fffbeb',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <XCircle size={12} />
                        Read-Only (Browse Only)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-status ${u.active ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="badge-status-dot" />
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      {u.role === 'STAFF' && (
                        <button
                          onClick={() => handleToggleOperations(u)}
                          className="btn-secondary"
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
                            color: u.canMakeOperations ? '#b45309' : '#059669',
                            borderColor: u.canMakeOperations ? '#fde68a' : '#a7f3d0',
                          }}
                          title={
                            u.canMakeOperations
                              ? 'Change to Read-Only access'
                              : 'Grant operational intake & update permissions'
                          }
                        >
                          <Sliders size={13} />
                          <span>{u.canMakeOperations ? 'Set Read-Only' : 'Enable Operations'}</span>
                        </button>
                      )}

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          title={u.active ? 'Deactivate user' : 'Reactivate user'}
                        >
                          <Power size={13} color={u.active ? '#ef4444' : '#10b981'} />
                          <span>{u.active ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Staff User */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 13, 30, 0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '28px 32px',
              position: 'relative',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #ebe8f5', paddingBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
                  Invite Staff Member
                </h2>
                <p style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
                  Credentials will be sent to the entered email address
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8d9c' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--omt-color-border)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="marcus@company.com"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--omt-color-border)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--omt-color-border)',
                      fontSize: 13,
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN (Tenant Admin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Auto-generated if blank"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--omt-color-border)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Operational Permissions Choice */}
              {formData.role === 'STAFF' && (
                <div>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                    Staff Operational Permissions
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: formData.canMakeOperations ? '2px solid #8633f3' : '1px solid var(--omt-color-border)',
                        backgroundColor: formData.canMakeOperations ? '#faf7ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <input
                        type="radio"
                        name="accessChoice"
                        checked={formData.canMakeOperations === true}
                        onChange={() => setFormData({ ...formData, canMakeOperations: true })}
                      />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Full Operations</div>
                        <div style={{ fontSize: 10, color: '#8e8d9c' }}>Can intake and edit vehicles</div>
                      </div>
                    </label>

                    <label
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: !formData.canMakeOperations ? '2px solid #8633f3' : '1px solid var(--omt-color-border)',
                        backgroundColor: !formData.canMakeOperations ? '#faf7ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <input
                        type="radio"
                        name="accessChoice"
                        checked={formData.canMakeOperations === false}
                        onChange={() => setFormData({ ...formData, canMakeOperations: false })}
                      />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>Read-Only</div>
                        <div style={{ fontSize: 10, color: '#8e8d9c' }}>Can browse and search only</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  <Mail size={15} />
                  <span>{isSubmitting ? 'Creating...' : 'Create & Send Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
