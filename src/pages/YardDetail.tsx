import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Yard, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { OmtLogoLoader } from '../components/common/OmtLogoLoader';
import {
  RiArrowLeftLine,
  RiBuilding2Line,
  RiCarLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiAlertLine,
  RiCheckLine,
  RiShutDownLine,
  RiCalendarLine,
  RiMapPinLine,
  RiInformationLine,
  RiShieldLine,
} from 'react-icons/ri';

export const YardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const [yard, setYard] = useState<Yard | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    address: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchYardAndVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [yardRes, vehRes] = await Promise.all([
        api.get<Yard>(`/yards/${id}`),
        api.get<Vehicle[]>('/vehicles', { params: { yardId: id } }),
      ]);
      setYard(yardRes.data);
      setVehicles(vehRes.data);
      setFormData({
        name: yardRes.data.name,
        country: yardRes.data.country,
        city: yardRes.data.city,
        address: yardRes.data.address,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load yard details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYardAndVehicles();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setFormErrors({ name: 'Yard name must be between 3 and 100 characters' });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);
      const res = await api.put<Yard>(`/yards/${id}`, formData);
      setYard(res.data);
      setIsEditing(false);
      setSuccessMsg('Yard details updated successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setFormErrors(err.response.data.fieldErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to update yard');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!yard) return;
    if (!isAdmin) {
      setError('Staff members are not permitted to deactivate or reactivate yards. Please contact an administrator.');
      return;
    }

    const newStatus = yard.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Requirement: A yard cannot be deactivated while active vehicle records are assigned to it.
    if (newStatus === 'INACTIVE' && yard.activeVehicleCount > 0) {
      setError(
        `Cannot deactivate yard '${yard.name}': it currently has ${yard.activeVehicleCount} active vehicle(s) assigned. Move or complete assigned vehicles before deactivating.`
      );
      return;
    }

    const confirmPrompt =
      newStatus === 'INACTIVE'
        ? `Are you sure you want to deactivate ${yard.name}? Inactive yards cannot be selected for new vehicles.`
        : `Reactivate yard ${yard.name}?`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      setError(null);
      setSuccessMsg(null);
      const res = await api.patch<Yard>(`/yards/${id}/status`, { status: newStatus });
      setYard(res.data);
      setSuccessMsg(
        `Yard successfully ${newStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'}.`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change yard status');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <OmtLogoLoader text="Loading yard details..." size="md" />
      </div>
    );
  }

  if (!yard) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h2>Yard Not Found</h2>
        <Link to="/yards" className="btn-primary" style={{ marginTop: 16 }}>
          Back to Yards
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/yards"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: '#6b7280',
            textDecoration: 'none',
          }}
        >
          <RiArrowLeftLine size={16} />
          <span>Back to Yards</span>
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '14px 18px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RiAlertLine size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '14px 18px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RiCheckLine size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Yard Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #ebe8f3',
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          position: 'relative',
        }}
      >
        {isSaving && <OmtLogoLoader overlay text="Saving yard changes..." size="sm" />}

        {/* Card Header & Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
            paddingBottom: 18,
            borderBottom: '1px solid #f0eff6',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#efe7ff',
                color: '#8633f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RiBuilding2Line size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: 13,
                    color: '#8633f3',
                    backgroundColor: '#efe7ff',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {yard.yardCode}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: yard.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                    color: yard.status === 'ACTIVE' ? '#15803d' : '#6b7280',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: yard.status === 'ACTIVE' ? '#22c55e' : '#9ca3af',
                    }}
                  />
                  {yard.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#111827',
                  margin: '4px 0 0 0',
                }}
              >
                {yard.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RiEditLine size={15} />
                  <span>Edit Yard</span>
                </button>

                {/* Deactivate Button: strictly allowed for ADMIN */}
                {isAdmin ? (
                  <button
                    onClick={handleToggleStatus}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: yard.status === 'ACTIVE' ? '1.5px solid #f87171' : '1px solid #a7f3d0',
                      backgroundColor: yard.status === 'ACTIVE' ? '#fff' : '#ecfdf5',
                      color: yard.status === 'ACTIVE' ? '#ef4444' : '#065f46',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RiShutDownLine size={15} />
                    <span>{yard.status === 'ACTIVE' ? 'Deactivate Yard' : 'Activate Yard'}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 6,
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      border: '1px solid #e5e7eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Staff cannot deactivate yards. Only tenant administrators can deactivate yards."
                  >
                    <RiShieldLine size={13} />
                    <span>Deactivation (Admin only)</span>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RiCloseLine size={15} />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Mode / Edit Form */}
        {!isEditing ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Location
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RiMapPinLine size={16} color="#8633f3" />
                  <span>{yard.city}, {yard.country}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{yard.address}</div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Assigned Vehicles
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RiCarLine size={16} color="#8633f3" />
                  <span>{yard.assignedVehicleCount} Total Vehicles</span>
                </div>
                <div style={{ fontSize: 12, color: yard.activeVehicleCount > 0 ? '#d97706' : '#10b981', fontWeight: 600, marginTop: 2 }}>
                  {yard.activeVehicleCount} Active (Receiving / Dismantling)
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Created Date
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RiCalendarLine size={16} color="#8633f3" />
                  <span>{new Date(yard.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {yard.status === 'INACTIVE' && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  color: '#92400e',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <RiInformationLine size={16} />
                <span>
                  This yard is inactive. Existing vehicle history is preserved, but no new vehicle registrations can select this yard.
                </span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Yard Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                  required
                />
                {formErrors.name && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                  required
                />
                {formErrors.name && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                  required
                />
                {formErrors.name && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                  required
                />
                {formErrors.name && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  borderRadius: 8,
                  backgroundColor: '#8633f3',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                <RiSaveLine size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Vehicles in this yard */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1px solid #ebe8f3',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f0eff6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 2px 0', color: '#111827' }}>
              Vehicles Assigned to Yard
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
              Active and processed vehicle assets physically located here
            </p>
          </div>

          <Link
            to={`/vehicles/new?yardId=${yard.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              backgroundColor: '#8633f3',
              color: '#ffffff',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>+ Register Vehicle</span>
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#faf9fc',
                  color: '#6b7280',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #ebe8f3',
                }}
              >
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>Asset Code</th>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>Vehicle Details</th>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>VIN</th>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>Routing</th>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8d9c' }}>
                    No vehicle records assigned to this yard yet.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f3f2f8' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: '#8633f3', fontFamily: 'monospace' }}>
                      {v.assetCode}
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 600, color: '#111827' }}>
                      {v.manufactureYear} {v.make} {v.model}
                    </td>
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', color: '#4b5563' }}>
                      {v.vin}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: 12 }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          backgroundColor: v.routingDecision === 'DISMANTLE' ? '#fef3c7' : '#e0e7ff',
                          color: v.routingDecision === 'DISMANTLE' ? '#92400e' : '#3730a3',
                          fontWeight: 600,
                        }}
                      >
                        {v.routingDecision === 'DISMANTLE' ? 'Dismantle for Parts' : 'Keep Whole'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor:
                            v.status === 'COMPLETED' ? '#dcfce7' : v.status === 'IN_PROGRESS' ? '#fef3c7' : '#e0e7ff',
                          color:
                            v.status === 'COMPLETED' ? '#15803d' : v.status === 'IN_PROGRESS' ? '#b45309' : '#4338ca',
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <Link
                        to={`/vehicles/${v.id}`}
                        style={{
                          color: '#8633f3',
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View Vehicle &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
