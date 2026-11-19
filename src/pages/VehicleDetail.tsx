import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle, Yard, VehicleStatus, RoutingDecision } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Car,
  Warehouse,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Edit2,
  Save,
  X,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { canMakeOperations } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeYards, setActiveYards] = useState<Yard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    manufactureYear: 2020,
    yardId: '',
    routingDecision: 'DISMANTLE' as RoutingDecision,
    notes: '',
  });

  const fetchVehicleAndYards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [vRes, yRes] = await Promise.all([
        api.get<Vehicle>(`/vehicles/${id}`),
        api.get<Yard[]>('/yards'),
      ]);
      setVehicle(vRes.data);
      setActiveYards(yRes.data);

      setFormData({
        make: vRes.data.make,
        model: vRes.data.model,
        manufactureYear: vRes.data.manufactureYear,
        yardId: String(vRes.data.yardId),
        routingDecision: vRes.data.routingDecision,
        notes: vRes.data.notes || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vehicle asset details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleAndYards();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    if (vehicle.status === 'COMPLETED') {
      setError('Completed vehicles are read-only and cannot be modified.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        manufactureYear: Number(formData.manufactureYear),
        yardId: Number(formData.yardId),
        routingDecision: formData.routingDecision,
        notes: formData.notes.trim() || undefined,
      };

      const res = await api.put<Vehicle>(`/vehicles/${id}`, payload);
      setVehicle(res.data);
      setIsEditing(false);
      setSuccessMsg('Vehicle asset information successfully updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update vehicle asset');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvanceStatus = async (targetStatus: VehicleStatus) => {
    if (!vehicle) return;

    const confirmMessage =
      targetStatus === 'COMPLETED'
        ? 'Completing this vehicle will permanently mark it as READ-ONLY. Are you sure you want to finish processing?'
        : `Advance vehicle status from ${vehicle.status} to ${targetStatus}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsAdvancingStatus(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.patch<Vehicle>(`/vehicles/${id}/status`, {
        status: targetStatus,
      });
      setVehicle(res.data);
      setSuccessMsg(`Vehicle status progressed to ${targetStatus}.`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to advance status');
    } finally {
      setIsAdvancingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#8e8d9c' }}>
        Loading vehicle asset details...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h2>Vehicle Not Found</h2>
        <Link to="/vehicles" className="btn-primary" style={{ marginTop: 16 }}>
          Back to Vehicles
        </Link>
      </div>
    );
  }

  const isCompleted = vehicle.status === 'COMPLETED';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/vehicles"
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
          <span>Back to Vehicles</span>
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
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Status Pipeline Workflow Stepper Card */}
      <div className="omt-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
              Asset Workflow Progression
            </span>
            <div style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
              Allowed forward path: <strong>RECEIVED → IN_PROGRESS → COMPLETED</strong>
            </div>
          </div>

          {/* Action to advance status forward */}
          <div>
            {!canMakeOperations ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  backgroundColor: '#fffbeb',
                  color: '#92400e',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #fde68a',
                }}
              >
                <Lock size={13} />
                <span>Read-Only Staff (Status Locked)</span>
              </div>
            ) : vehicle.status === 'RECEIVED' ? (
              <button
                onClick={() => handleAdvanceStatus('IN_PROGRESS')}
                disabled={isAdvancingStatus}
                className="btn-primary"
              >
                <span>Advance to In Progress</span>
                <ArrowRight size={14} />
              </button>
            ) : vehicle.status === 'IN_PROGRESS' ? (
              <button
                onClick={() => handleAdvanceStatus('COMPLETED')}
                disabled={isAdvancingStatus}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
              >
                <CheckCircle2 size={15} />
                <span>Complete Processing</span>
              </button>
            ) : null}

            {isCompleted && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid #a7f3d0',
                }}
              >
                <Lock size={14} />
                <span>Completed &amp; Locked (Read-Only)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stepper visual */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Step 1: RECEIVED */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#efe7ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                border: '2px solid #8633f3',
              }}
            >
              <Clock size={18} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: '#7c3aed' }}>RECEIVED</span>
            <span style={{ fontSize: 10, color: '#8e8d9c' }}>Gate Intake</span>
          </div>

          <div
            style={{
              height: 3,
              flex: 1,
              backgroundColor: vehicle.status === 'IN_PROGRESS' || isCompleted ? '#8633f3' : '#e6e4f0',
              margin: '0 8px',
              marginBottom: 24,
            }}
          />

          {/* Step 2: IN_PROGRESS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: vehicle.status === 'IN_PROGRESS' || isCompleted ? '#fef3c7' : '#f4f3f8',
                color: vehicle.status === 'IN_PROGRESS' || isCompleted ? '#d97706' : '#a09db3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                border: vehicle.status === 'IN_PROGRESS' || isCompleted ? '2px solid #f59e0b' : '2px solid #dddde6',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginTop: 6,
                color: vehicle.status === 'IN_PROGRESS' || isCompleted ? '#d97706' : '#8e8d9c',
              }}
            >
              IN PROGRESS
            </span>
            <span style={{ fontSize: 10, color: '#8e8d9c' }}>Dismantling/Holding</span>
          </div>

          <div
            style={{
              height: 3,
              flex: 1,
              backgroundColor: isCompleted ? '#059669' : '#e6e4f0',
              margin: '0 8px',
              marginBottom: 24,
            }}
          />

          {/* Step 3: COMPLETED */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#d1fae5' : '#f4f3f8',
                color: isCompleted ? '#059669' : '#a09db3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                border: isCompleted ? '2px solid #059669' : '2px solid #dddde6',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginTop: 6,
                color: isCompleted ? '#059669' : '#8e8d9c',
              }}
            >
              COMPLETED
            </span>
            <span style={{ fontSize: 10, color: '#8e8d9c' }}>Archived &amp; Read-Only</span>
          </div>
        </div>
      </div>

      {/* Main Asset Detail Card */}
      <div className="omt-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
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
              <Car size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                  {vehicle.assetCode}
                </span>
                <span className={`badge-status badge-${vehicle.status.toLowerCase()}`}>
                  <span className="badge-status-dot" />
                  {vehicle.status}
                </span>
                <span
                  className={`badge-status ${
                    vehicle.routingDecision === 'DISMANTLE' ? 'badge-dismantle' : 'badge-keep_whole'
                  }`}
                >
                  {vehicle.routingDecision}
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
                {vehicle.make} {vehicle.model} ({vehicle.manufactureYear})
              </h1>
            </div>
          </div>

          <div>
            {!canMakeOperations ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: '#92400e',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                <Lock size={14} />
                <span>Read-Only Access</span>
              </div>
            ) : !isCompleted ? (
              !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                  title="Edit vehicle details"
                >
                  <Edit2 size={14} />
                  <span>Edit Details</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  <X size={14} />
                  <span>Cancel Edit</span>
                </button>
              )
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                <Lock size={14} />
                <span>Read-Only</span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Fields Display or Edit */}
        {!isEditing ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  VIN (17 Characters)
                </span>
                <div style={{ fontFamily: 'var(--omt-font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                  {vehicle.vin}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Assigned Yard
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--omt-color-text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Warehouse size={15} color="var(--omt-color-primary)" />
                  <Link
                    to={`/yards/${vehicle.yardId}`}
                    style={{ color: 'var(--omt-color-primary)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    {vehicle.yardName} ({vehicle.yardCode})
                  </Link>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Routing Decision
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                  {vehicle.routingDecision === 'DISMANTLE' ? 'Dismantle for Parts' : 'Keep Whole'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                  Intake Date
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c' }}>
                Inspection Notes
              </span>
              <div
                style={{
                  marginTop: 6,
                  padding: 14,
                  backgroundColor: '#faf9fd',
                  borderRadius: 8,
                  border: '1px solid #f0eff6',
                  fontSize: 13,
                  color: vehicle.notes ? 'var(--omt-color-text-main)' : '#8e8d9c',
                  lineHeight: 1.5,
                }}
              >
                {vehicle.notes || 'No inspection notes entered for this vehicle.'}
              </div>
            </div>

            {isCompleted && (
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#4b5563',
                }}
              >
                <ShieldAlert size={16} color="#6b7280" />
                <span>
                  <strong>Assessment Specification Rule:</strong> Completed vehicles are strictly read-only; no reopening, modifications, or deletion permitted.
                </span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label
                  htmlFor="edit-vehicle-make"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  Make <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="edit-vehicle-make"
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
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
                  htmlFor="edit-vehicle-model"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  Model <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="edit-vehicle-model"
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
              <div>
                <label
                  htmlFor="edit-vehicle-year"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  Year <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="edit-vehicle-year"
                  type="number"
                  min={1950}
                  max={2030}
                  value={formData.manufactureYear}
                  onChange={(e) => setFormData({ ...formData, manufactureYear: Number(e.target.value) })}
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
                  htmlFor="edit-vehicle-yard"
                  style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
                >
                  Yard Location <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="edit-vehicle-yard"
                  value={formData.yardId}
                  onChange={(e) => setFormData({ ...formData, yardId: e.target.value })}
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
                  {activeYards.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.yardCode} - {y.name} ({y.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
              >
                Routing Disposition
              </span>
              <div style={{ display: 'flex', gap: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="editRouting"
                    value="DISMANTLE"
                    checked={formData.routingDecision === 'DISMANTLE'}
                    onChange={() => setFormData({ ...formData, routingDecision: 'DISMANTLE' })}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Dismantle</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="editRouting"
                    value="KEEP_WHOLE"
                    checked={formData.routingDecision === 'KEEP_WHOLE'}
                    onChange={() => setFormData({ ...formData, routingDecision: 'KEEP_WHOLE' })}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Keep Whole</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-vehicle-notes"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}
              >
                Inspection Notes
              </label>
              <textarea
                id="edit-vehicle-notes"
                rows={3}
                maxLength={500}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
    </div>
  );
};
