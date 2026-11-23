import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import yardService from '../services/yardService';
import type { Yard, YardStatus } from '../types';
import { OmtLogoLoader } from '../components/common/OmtLogoLoader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  RiSearchLine,
  RiAddLine,
  RiFilter3Line,
  RiEyeLine,
  RiEditLine,
  RiCloseLine,
  RiCheckLine,
} from 'react-icons/ri';

export const YardList: React.FC = () => {
  const [yards, setYards] = useState<Yard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<YardStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State matching Screenshot 3.1
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    ownershipType: 'Owned',
    country: 'United States',
    city: '',
    address: '',
    address2: '',
  });

  const fetchYards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;

      const data = await yardService.getYards(params);
      setYards(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load yards');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchYards();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [fetchYards]);

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
    const nextNum = (yards.length + 1).toString().padStart(4, '0');
    return `${prefix}-XX-${nextNum}`;
  };

  const handleCreateYard = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Yard name must be between 3 and 100 characters';
    }
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address Line 1 is required';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setModalErrors({});
      const fullAddress = formData.address2.trim()
        ? `${formData.address.trim()}, ${formData.address2.trim()}`
        : formData.address.trim();

      await yardService.createYard({
        name: formData.name.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: fullAddress,
      });

      setShowModal(false);
      setFormData({
        name: '',
        ownershipType: 'Owned',
        country: 'United States',
        city: '',
        address: '',
        address2: '',
      });
      setSuccessMsg('Yard successfully created! Ready for vehicle storage and dismantling.');
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchYards();
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setModalErrors(err.response.data.fieldErrors);
      } else {
        setModalErrors({ general: err.response?.data?.message || 'Failed to create yard.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header matching Screenshot 3.2 */}
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#8e8d9c', marginBottom: 2 }}>
            Settings / Physical Locations
          </div>
          <h1
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#111827',
              margin: '0 0 4px 0',
            }}
          >
            Yards
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Physical locations where vehicles, parts and workforce are stationed
          </p>
        </div>

        {/* Both ADMIN and STAFF can create yards! */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            backgroundColor: '#8633f3',
            color: '#ffffff',
            borderRadius: 8,
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, transform 0.1s ease',
            boxShadow: '0 2px 10px rgba(134, 51, 243, 0.3)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7115d6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8633f3')}
        >
          <RiAddLine size={18} />
          <span>New Yard</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RiCheckLine size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={fetchYards} />}

      {/* Search and Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #ebe8f3',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', flex: 1, minWidth: 260, position: 'relative' }}>
          <RiSearchLine
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or name..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              backgroundColor: '#faf9fc',
              color: '#111827',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#8633f3';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#faf9fc';
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
            <RiFilter3Line size={15} />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as YardStatus | '')}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 13,
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: 500,
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table matching Screenshot 3.2 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #ebe8f3',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#1b142e',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648' }}>Yard Code</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648' }}>Yard Name</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648' }}>City</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648' }}>Country</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648' }}>Status</th>
                <th style={{ padding: '14px 20px', borderBottom: '1px solid #2e2648', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: '#8e8d9c' }}>
                    <OmtLogoLoader text="Loading yards..." size="sm" />
                  </td>
                </tr>
              ) : yards.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: '#8e8d9c' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      No yards found
                    </div>
                    <div style={{ fontSize: 12 }}>Try adjusting your search terms or filters.</div>
                  </td>
                </tr>
              ) : (
                yards.map((yard, index) => (
                  <tr
                    key={yard.id}
                    style={{
                      borderBottom: '1px solid #f3f2f8',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf9fe',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f0fd')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#faf9fe')
                    }
                  >
                    {/* Yard Code */}
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#8633f3', fontFamily: 'monospace' }}>
                      {yard.yardCode}
                    </td>

                    {/* Yard Name */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{yard.name}</div>
                      <div style={{ fontSize: 11, color: '#8e8d9c', marginTop: 2 }}>{yard.address}</div>
                    </td>

                    {/* City */}
                    <td style={{ padding: '14px 20px', color: '#374151', fontWeight: 500 }}>
                      {yard.city}
                    </td>

                    {/* Country */}
                    <td style={{ padding: '14px 20px', color: '#374151', fontWeight: 500 }}>
                      {yard.country}
                    </td>

                    {/* Status matching Screenshot 3.2 pill */}
                    <td style={{ padding: '14px 20px' }}>
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
                    </td>

                    {/* Actions matching Screenshot 3.2 (Eye and Pencil) */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <Link
                          to={`/yards/${yard.id}`}
                          style={{
                            color: '#6b7280',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s, background-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#8633f3';
                            e.currentTarget.style.backgroundColor = '#f3e8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6b7280';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="View Yard Details"
                        >
                          <RiEyeLine size={17} />
                        </Link>

                        <Link
                          to={`/yards/${yard.id}?edit=true`}
                          style={{
                            color: '#6b7280',
                            padding: 6,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s, background-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#8633f3';
                            e.currentTarget.style.backgroundColor = '#f3e8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6b7280';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Edit Yard"
                        >
                          <RiEditLine size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination matching Screenshot 3.2 */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #ebe8f3',
            fontSize: 12,
            color: '#6b7280',
          }}
        >
          <div>
            Showing 1 to {yards.length} of {yards.length} results
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 4,
                backgroundColor: '#8633f3',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              1
            </span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>20 / page</span>
          </div>
        </div>
      </div>

      {/* New Yard Modal matching Screenshot 3.1 & 3.2 */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(15, 13, 30, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'omt-fade-in 0.2s ease-out',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.4), 0 0 32px rgba(134, 51, 243, 0.2)',
              border: '1px solid #ebe8f3',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isSubmitting && <OmtLogoLoader overlay text="Creating Yard..." size="sm" />}

            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f0eff6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#111827',
                  fontFamily: 'var(--omt-font-display)',
                }}
              >
                New Yard
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
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
                <RiCloseLine size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateYard}>
              <div
                style={{
                  padding: '20px 24px',
                  maxHeight: '75vh',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {/* Auto Code Banner */}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
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

                {/* Identity Section matching Screenshot 3.1 */}
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
                        fontSize: 12,
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
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: modalErrors.name ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {modalErrors.name && (
                      <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                        {modalErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Ownership Type */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
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
                        padding: '10px 14px',
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

                {/* Address Section matching Screenshot 3.1 & 3.2 */}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    {/* Country */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 12,
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
                          padding: '10px 14px',
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
                          fontSize: 12,
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
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: modalErrors.city ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {modalErrors.city && (
                        <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                          {modalErrors.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div style={{ marginBottom: 14 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
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
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: modalErrors.address ? '1.5px solid #ef4444' : '1px solid #e5e7eb',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {modalErrors.address && (
                      <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>
                        {modalErrors.address}
                      </span>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12,
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
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {modalErrors.general && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {modalErrors.general}
                  </div>
                )}
              </div>

              {/* Modal Footer matching Screenshot 3.1 */}
              <div
                style={{
                  padding: '16px 24px',
                  backgroundColor: '#faf9fc',
                  borderTop: '1px solid #f0eff6',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 22px',
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
                    boxShadow: '0 2px 8px rgba(134, 51, 243, 0.3)',
                  }}
                >
                  <span>Create Yard</span>
                  <RiCheckLine size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
