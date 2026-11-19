import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Yard, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Warehouse,
  Car,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Power,
  Calendar,
  MapPin,
} from 'lucide-react';

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
    const newStatus = yard.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change yard status');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#8e8d9c' }}>
        Loading yard details...
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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
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
            color: 'var(--omt-color-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Yards</span>
        </Link>
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
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Yard Main Card */}
      <div className="omt-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid var(--omt-color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#efe7ff',
                color: 'var(--omt-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Warehouse size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontFamily: 'var(--omt-font-mono)',
                    fontWeight: 800,
                    fontSize: 13,
                    color: 'var(--omt-color-primary)',
                    backgroundColor: '#efe7ff',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {yard.yardCode}
                </span>
                <span
                  className={`badge-status ${
                    yard.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'
                  }`}
                >
                  <span className="badge-status-dot" />
                  {yard.status}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--omt-color-text-main)',
                  marginTop: 4,
                }}
              >
                {yard.name}
              </h1>
            </div>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: 10 }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                    title="Edit yard properties"
                  >
                    <Edit2 size={14} />
                    <span>Edit Yard</span>
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    className={yard.status === 'ACTIVE' ? 'btn-danger' : 'btn-secondary'}
                    style={
                      yard.status === 'INACTIVE'
                        ? { borderColor: '#a7f3d0', color: '#065f46', backgroundColor: '#ecfdf5' }
                        : {}
                    }
                    title={yard.status === 'ACTIVE' ? 'Deactivate yard' : 'Reactivate yard'}
                  >
                    <Power size={14} />
                    <span>{yard.status === 'ACTIVE' ? 'Deactivate Yard' : 'Activate Yard'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  <X size={14} />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>
          )}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--omt-color-text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={15} color="#8e8d9c" />
                  <span>{yard.city}, {yard.country}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Address
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                  {yard.address}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Assigned Vehicles
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--omt-color-text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Car size={16} color="var(--omt-color-primary)" />
                  <span>{yard.assignedVehicleCount} vehicles total</span>
                  {yard.activeVehicleCount > 0 && (
                    <span style={{ fontSize: 11, backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 4 }}>
                      {yard.activeVehicleCount} active
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Created At
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--omt-color-text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} color="#8e8d9c" />
                  <span>{new Date(yard.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {yard.status === 'INACTIVE' && (
              <div
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#9f1239',
                }}
              >
                <strong>Inactive Yard Notice:</strong> This yard is deactivated. New vehicle registration cannot be placed under this location.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                htmlFor="edit-yard-name"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
              >
                Yard Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="edit-yard-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--omt-color-border)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {formErrors.name && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                  {formErrors.name}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label
                  htmlFor="edit-yard-country"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  Country <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="edit-yard-country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                <label
                  htmlFor="edit-yard-city"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="edit-yard-city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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

            <div>
              <label
                htmlFor="edit-yard-address"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
              >
                Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="edit-yard-address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--omt-color-border)',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary">
                <Save size={15} />
                <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Vehicles In This Yard */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
            Vehicles Assigned to this Yard ({vehicles.length})
          </h2>
          {yard.status === 'ACTIVE' && (
            <Link to="/vehicles/new" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
              <span>+ Register Vehicle Here</span>
            </Link>
          )}
        </div>

        <div className="omt-table-wrapper">
          <table className="omt-table">
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>VIN</th>
                <th>Vehicle Details</th>
                <th>Routing</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#8e8d9c' }}>
                    No vehicles currently stored in this yard.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--omt-font-mono)',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#7c3aed',
                        }}
                      >
                        {v.assetCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--omt-font-mono)', fontSize: 12 }}>
                        {v.vin}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: 11, color: '#8e8d9c' }}>Year {v.manufactureYear}</div>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          v.routingDecision === 'DISMANTLE' ? 'badge-dismantle' : 'badge-keep_whole'
                        }`}
                      >
                        {v.routingDecision}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status badge-${v.status.toLowerCase()}`}>
                        <span className="badge-status-dot" />
                        {v.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/vehicles/${v.id}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>
                        View
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
