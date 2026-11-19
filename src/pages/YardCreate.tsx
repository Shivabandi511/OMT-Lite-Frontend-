import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Warehouse, AlertCircle, Info } from 'lucide-react';

export const YardCreate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Yard name is required';
    } else if (formData.name.trim().length < 3 || formData.name.trim().length > 100) {
      newErrors.name = 'Yard name must be between 3 and 100 characters';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
      const res = await api.post('/yards', formData);
      navigate(`/yards/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to create yard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
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

      <div className="omt-card">
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--omt-color-border)' }}>
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
            <Warehouse size={22} />
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
              Create New Yard
            </h1>
            <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)' }}>
              Register a new physical processing location in the OMT network
            </p>
          </div>
        </div>

        {/* Info Note on System Code */}
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
            <strong>Yard Code is System-Generated:</strong> Once submitted, the system will automatically allocate a sequence identifier (e.g. <code>YRD-0005</code>). Status defaults to <strong>ACTIVE</strong>.
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
          {/* Yard Name */}
          <div>
            <label
              htmlFor="yard-name"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--omt-color-text-main)',
                marginBottom: 6,
              }}
            >
              Yard Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="yard-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rotterdam Central Yard"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${errors.name ? '#ef4444' : 'var(--omt-color-border)'}`,
                fontSize: 13,
                outline: 'none',
              }}
            />
            {errors.name && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Country */}
            <div>
              <label
                htmlFor="yard-country"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--omt-color-text-main)',
                  marginBottom: 6,
                }}
              >
                Country <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="yard-country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Netherlands"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${errors.country ? '#ef4444' : 'var(--omt-color-border)'}`,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {errors.country && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.country}</span>}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="yard-city"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--omt-color-text-main)',
                  marginBottom: 6,
                }}
              >
                City <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="yard-city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Rotterdam"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${errors.city ? '#ef4444' : 'var(--omt-color-border)'}`,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              {errors.city && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.city}</span>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="yard-address"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--omt-color-text-main)',
                marginBottom: 6,
              }}
            >
              Full Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="yard-address"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street name, harbor/zone number, postal code..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${errors.address ? '#ef4444' : 'var(--omt-color-border)'}`,
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            {errors.address && <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.address}</span>}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Link to="/yards" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Yard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

