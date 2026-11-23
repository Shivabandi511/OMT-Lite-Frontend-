import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Yard, RoutingDecision } from '../types';
import { ArrowLeft, Save, Car, AlertCircle, Info, Check, Sparkles } from 'lucide-react';
import { decodeVinLocally, decodeVinAsync } from '../utils/vinDecoder';
import type { DecodedVin } from '../utils/vinDecoder';

export const VehicleCreate: React.FC = () => {
  const navigate = useNavigate();
  const [activeYards, setActiveYards] = useState<Yard[]>([]);
  const [isLoadingYards, setIsLoadingYards] = useState(true);

  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    manufactureYear: new Date().getFullYear(),
    yardId: '',
    routingDecision: 'DISMANTLE' as RoutingDecision,
    notes: '',
  });

  const [decodedInfo, setDecodedInfo] = useState<DecodedVin | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ACTIVE yards only
  useEffect(() => {
    const fetchActiveYards = async () => {
      try {
        setIsLoadingYards(true);
        const res = await api.get<Yard[]>('/yards', { params: { status: 'ACTIVE' } });
        setActiveYards(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, yardId: String(res.data[0].id) }));
        }
      } catch (err: any) {
        setGeneralError('Failed to load active yards list.');
      } finally {
        setIsLoadingYards(false);
      }
    };
    fetchActiveYards();
  }, []);

  const handleVinChange = async (val: string) => {
    // Upper case and trim
    const upper = val.toUpperCase().trim();
    setFormData((prev) => ({ ...prev, vin: upper }));

    // Instant check
    if (/[IOQ]/.test(upper)) {
      setErrors((prev) => ({
        ...prev,
        vin: "VIN cannot contain letters 'I', 'O', or 'Q' (ISO 3779 standard)",
      }));
    } else if (upper.length > 0 && upper.length !== 17) {
      setErrors((prev) => ({
        ...prev,
        vin: `VIN must be exactly 17 characters (currently ${upper.length})`,
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.vin;
        return copy;
      });
    }

    // Auto-decode vehicle name, model, make, and year
    if (upper.length >= 3 && !/[IOQ]/.test(upper)) {
      const local = decodeVinLocally(upper);
      if (local) {
        setDecodedInfo(local);
        setFormData((prev) => ({
          ...prev,
          make: local.make,
          model: local.model,
          manufactureYear: local.year,
        }));
        // Clear errors on make & model if auto-filled
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.make;
          delete copy.model;
          delete copy.manufactureYear;
          return copy;
        });
      }

      // If full 17 characters, perform deeper async decode (e.g. NHTSA)
      if (upper.length === 17) {
        setIsDecoding(true);
        try {
          const asyncDecoded = await decodeVinAsync(upper);
          if (asyncDecoded) {
            setDecodedInfo(asyncDecoded);
            setFormData((prev) => ({
              ...prev,
              make: asyncDecoded.make,
              model: asyncDecoded.model,
              manufactureYear: asyncDecoded.year,
            }));
          }
        } catch {
          // Keep local if async failed
        } finally {
          setIsDecoding(false);
        }
      }
    } else if (upper.length < 3) {
      setDecodedInfo(null);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const vin = formData.vin.trim().toUpperCase();

    if (!vin) {
      newErrors.vin = 'VIN is required';
    } else if (vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 alphanumeric characters';
    } else if (/[IOQ]/.test(vin)) {
      newErrors.vin = "VIN cannot contain letters 'I', 'O', or 'Q'";
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      newErrors.vin = 'VIN can only contain letters and numbers (no special symbols)';
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    const year = Number(formData.manufactureYear);
    const maxYear = new Date().getFullYear() + 2;
    if (!year || year < 1950 || year > maxYear) {
      newErrors.manufactureYear = `Year must be between 1950 and ${maxYear}`;
    }

    if (!formData.yardId) {
      newErrors.yardId = 'An active yard must be selected';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setGeneralError(null);
      const payload = {
        ...formData,
        vin: formData.vin.trim().toUpperCase(),
        yardId: Number(formData.yardId),
        manufactureYear: Number(formData.manufactureYear),
      };

      const res = await api.post('/vehicles', payload);
      navigate(`/vehicles/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to register vehicle asset');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVinValid =
    formData.vin.length === 17 &&
    !/[IOQ]/.test(formData.vin) &&
    /^[A-HJ-NPR-Z0-9]{17}$/.test(formData.vin);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Back Link */}
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

      <div className="omt-card">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            paddingBottom: 18,
            borderBottom: '1px solid var(--omt-color-border)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#efe7ff',
              color: 'var(--omt-color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Car size={22} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--omt-font-display)',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--omt-color-text-main)',
              }}
            >
              Register New Vehicle Asset
            </h1>
            <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)' }}>
              Identify asset, validate VIN format, assign yard location &amp; routing disposition
            </p>
          </div>
        </div>

        {/* Note on Auto Generated Asset Code */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            backgroundColor: '#f8f7fc',
            border: '1px solid #ebe8f5',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 12,
            color: '#5f5f6c',
            lineHeight: 1.5,
          }}
        >
          <Info size={16} color="var(--omt-color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Asset Code Sequence:</strong> The system automatically creates an asset identifier (e.g. <code>AST-0006</code>). Initial status is set to <strong>RECEIVED</strong>.
          </div>
        </div>

        {generalError && (
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
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* VIN Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label
                htmlFor="vehicle-vin"
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--omt-color-text-main)' }}
              >
                VIN (Vehicle Identification Number) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ fontSize: 11, color: isVinValid ? '#059669' : '#8e8d9c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {isVinValid && <Check size={12} />}
                <span>{formData.vin.length} / 17 characters (no I, O, Q)</span>
              </div>
            </div>
            <input
              id="vehicle-vin"
              type="text"
              maxLength={17}
              value={formData.vin}
              onChange={(e) => handleVinChange(e.target.value)}
              placeholder="e.g. 1HGCR2F83HA001924"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${errors.vin ? '#ef4444' : isVinValid ? '#10b981' : 'var(--omt-color-border)'}`,
                fontFamily: 'var(--omt-font-mono)',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                outline: 'none',
              }}
            />
            {errors.vin && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                {errors.vin}
              </span>
            )}

            {/* Quick Sample VIN Selector */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#8e8d9c', fontWeight: 600 }}>Quick Fill Sample VIN:</span>
              {[
                { label: 'Honda Accord', vin: '1HGCR2F83HA001924' },
                { label: 'Audi A3', vin: 'WAUZZZ8V7FA018492' },
                { label: 'BMW X5', vin: '5UXCR6C05L9B83719' },
                { label: 'Toyota Camry', vin: '4T4BF1FK4CR210847' },
                { label: 'VW Golf', vin: '3VW2K7AJ4EM190284' },
              ].map((s) => (
                <button
                  key={s.vin}
                  type="button"
                  onClick={() => handleVinChange(s.vin)}
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #dcd7ee',
                    backgroundColor: '#faf8fe',
                    color: '#6339a8',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Decoded Vehicle Name & Model Display Banner */}
            {decodedInfo && (
              <div
                style={{
                  marginTop: 12,
                  padding: '14px 16px',
                  backgroundColor: '#f5f0ff',
                  border: '1.5px solid #d8b4fe',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(118, 44, 203, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      backgroundColor: 'var(--omt-color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Car size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#7e22ce',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Sparkles size={12} />
                        VIN Decoded Vehicle
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: '#e9d5ff',
                          color: '#6b21a8',
                          fontWeight: 700,
                        }}
                      >
                        {decodedInfo.source.toUpperCase()}
                      </span>
                      {isDecoding && (
                        <span style={{ fontSize: 10, color: '#8e8d9c', fontStyle: 'italic' }}>
                          Refining with NHTSA...
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#3b0764',
                        marginTop: 2,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {decodedInfo.displayName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b21a8', marginTop: 2 }}>
                      Vehicle Name: <strong style={{ color: '#3b0764' }}>{decodedInfo.make} {decodedInfo.model}</strong>
                      {' • '}
                      Model: <strong style={{ color: '#3b0764' }}>{decodedInfo.model}</strong>
                      {' • '}
                      Year: <strong style={{ color: '#3b0764' }}>{decodedInfo.year}</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#059669',
                    fontWeight: 700,
                    backgroundColor: '#ecfdf5',
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Check size={14} />
                  <span>Auto-filled below</span>
                </div>
              </div>
            )}
          </div>

          {/* Make and Model */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label
                htmlFor="vehicle-make"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
              >
                Vehicle Make <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="vehicle-make"
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g. Toyota, Honda, BMW"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${errors.make ? '#ef4444' : 'var(--omt-color-border)'}`,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {errors.make && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                  {errors.make}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="vehicle-model"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
              >
                Vehicle Model <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="vehicle-model"
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Camry, Accord, X5"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${errors.model ? '#ef4444' : 'var(--omt-color-border)'}`,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {errors.model && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                  {errors.model}
                </span>
              )}
            </div>
          </div>

          {/* Manufacture Year and Yard Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div>
              <label
                htmlFor="manufacture-year"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
              >
                Manufacture Year <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="manufacture-year"
                type="number"
                min={1950}
                max={new Date().getFullYear() + 2}
                value={formData.manufactureYear}
                onChange={(e) => setFormData({ ...formData, manufactureYear: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${errors.manufactureYear ? '#ef4444' : 'var(--omt-color-border)'}`,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {errors.manufactureYear && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                  {errors.manufactureYear}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="assigned-yard"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
              >
                Assigned Yard (Active Only) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {isLoadingYards ? (
                <div style={{ padding: '10px 14px', color: '#8e8d9c', fontSize: 13 }}>Loading active yards...</div>
              ) : activeYards.length === 0 ? (
                <div style={{ color: '#dc2626', fontSize: 12, padding: 8 }}>
                  No active yards available. Please create or activate a yard first.
                </div>
              ) : (
                <select
                  id="assigned-yard"
                  value={formData.yardId}
                  onChange={(e) => setFormData({ ...formData, yardId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${errors.yardId ? '#ef4444' : 'var(--omt-color-border)'}`,
                    fontSize: 13,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {activeYards.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.yardCode} – {y.name} ({y.city}, {y.country})
                    </option>
                  ))}
                </select>
              )}
              {errors.yardId && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>
                  {errors.yardId}
                </span>
              )}
            </div>
          </div>

          {/* Routing Decision Radio */}
          <div>
            <span
              style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}
            >
              Routing Disposition Decision <span style={{ color: '#ef4444' }}>*</span>
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: formData.routingDecision === 'DISMANTLE' ? '2px solid #8633f3' : '1px solid var(--omt-color-border)',
                  backgroundColor: formData.routingDecision === 'DISMANTLE' ? '#f5f0ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="routingDecision"
                  value="DISMANTLE"
                  checked={formData.routingDecision === 'DISMANTLE'}
                  onChange={() => setFormData({ ...formData, routingDecision: 'DISMANTLE' })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#991b1b' }}>DISMANTLE</div>
                  <div style={{ fontSize: 11, color: '#5f5f6c' }}>Deconstruct for spare parts salvage</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: formData.routingDecision === 'KEEP_WHOLE' ? '2px solid #8633f3' : '1px solid var(--omt-color-border)',
                  backgroundColor: formData.routingDecision === 'KEEP_WHOLE' ? '#f5f0ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="routingDecision"
                  value="KEEP_WHOLE"
                  checked={formData.routingDecision === 'KEEP_WHOLE'}
                  onChange={() => setFormData({ ...formData, routingDecision: 'KEEP_WHOLE' })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>KEEP WHOLE</div>
                  <div style={{ fontSize: 11, color: '#5f5f6c' }}>Store or prepare for vehicle resale</div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label
                htmlFor="vehicle-notes"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                Inspection Notes (Optional)
              </label>
              <span style={{ fontSize: 11, color: '#8e8d9c' }}>
                {formData.notes.length} / 500 characters
              </span>
            </div>
            <textarea
              id="vehicle-notes"
              rows={3}
              maxLength={500}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Gate inspection details, damage assessment, missing parts..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--omt-color-border)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Link to="/vehicles" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || activeYards.length === 0}
              className="btn-primary"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Registering...' : 'Register Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
