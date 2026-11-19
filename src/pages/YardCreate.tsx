import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { OmtLogoLoader } from '../components/common/OmtLogoLoader';
import {
  RiArrowLeftLine,
  RiBuilding2Line,
  RiCheckLine,
  RiAlertLine,
} from 'react-icons/ri';

export const YardCreate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    ownershipType: 'Owned',
    country: 'United States',
    city: '',
    address: '',
    address2: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute preview auto yard code based on selected country
  const getAutoCodePreview = () => {
    const country = formData.country || 'US';
    const prefix = country.toUpperCase().includes('NIGERIA')
      ? 'NG'
      : country.toUpperCase().includes('CANADA')
      ? 'CA'
      : country.toUpperCase().includes('GERMANY')
      ? 'DE'
      : country.toUpperCase().includes('NETHERLANDS')
      ? 'NL'
      : 'US';
    return `${prefix}-XX-0001`;
  };

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
      const fullAddress = formData.address2.trim()
        ? `${formData.address.trim()}, ${formData.address2.trim()}`
        : formData.address.trim();

      const res = await api.post('/yards', {
        name: formData.name.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: fullAddress,
      });

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
    <div style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 60 }}>
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

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          border: '1px solid #ebe8f3',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isSubmitting && <OmtLogoLoader overlay text="Creating Yard..." size="sm" />}

        {/* Card Header matching Screenshot 3.1 */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f0eff6',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#efe7ff',
              color: '#8633f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RiBuilding2Line size={22} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--omt-font-display)',
                fontSize: 20,
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 2px 0',
              }}
            >
              New Yard
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Add a physical site where vehicles are received, stored, or dismantled
            </p>
          </div>
        </div>

        {generalError && (
          <div
            style={{
              margin: '20px 28px 0',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RiAlertLine size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Auto Code Preview */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#6b7280',
                  marginBottom: 6,
                }}
              >
                YARD CODE (AUTO)
              </div>
              <input
                type="text"
                value={getAutoCodePreview()}
                disabled
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f3f0f9',
                  color: '#4b5563',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* IDENTITY Section */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  marginBottom: 12,
                }}
              >
                IDENTITY
              </div>

              {/* Yard Name */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: '#ef4444' }}>* </span>Yard Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sacramento Main Yard"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: errors.name ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Ownership Type */}
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
                  <span style={{ color: '#ef4444' }}>* </span>Ownership Type
                </label>
                <select
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Owned">Company Owned</option>
                  <option value="Leased">Leased Location</option>
                  <option value="Partner">Partner / Third Party</option>
                </select>
              </div>
            </div>

            {/* ADDRESS Section */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  marginBottom: 12,
                }}
              >
                ADDRESS
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Country */}
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
                    <span style={{ color: '#ef4444' }}>* </span>Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                  </select>
                </div>

                {/* City */}
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
                    <span style={{ color: '#ef4444' }}>* </span>City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Sacramento"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: errors.city ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.city && (
                    <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                      {errors.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: '#ef4444' }}>* </span>Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: errors.address ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.address && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Address Line 2 */}
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
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  placeholder="Suite, building, yard gate, etc."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              padding: '18px 28px',
              backgroundColor: '#faf9fc',
              borderTop: '1px solid #f0eff6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Link
              to="/yards"
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#8633f3',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 10px rgba(134, 51, 243, 0.3)',
              }}
            >
              <span>Create Yard</span>
              <RiCheckLine size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
