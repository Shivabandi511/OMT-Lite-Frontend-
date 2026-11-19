import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Yard, YardStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Warehouse,
  Filter,
  Eye,
  Edit2,
  AlertCircle,
  Car,
} from 'lucide-react';

export const YardList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [yards, setYards] = useState<Yard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<YardStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await api.get<Yard[]>('/yards', { params });
      setYards(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load yards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchYards();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

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
            Yard Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
            Locations for receiving, storage, and vehicle dismantling
          </p>
        </div>

        {isAdmin && (
          <Link to="/yards/new" className="btn-primary">
            <Plus size={15} />
            <span>Create New Yard</span>
          </Link>
        )}
      </div>

      {/* Search and Filters Toolbar */}
      <div
        className="omt-card"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flex: 1, minWidth: 260, position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8e8d9c',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by yard name, code, or city..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 8,
              border: '1px solid var(--omt-color-border)',
              fontSize: 13,
              outline: 'none',
              backgroundColor: '#faf9fd',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
            <Filter size={14} />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as YardStatus | '')}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--omt-color-border)',
              fontSize: 13,
              outline: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

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
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Yards Table */}
      <div className="omt-table-wrapper">
        <table className="omt-table">
          <thead>
            <tr>
              <th>Yard Code</th>
              <th>Yard Name</th>
              <th>Location</th>
              <th>Vehicles</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#8e8d9c' }}>
                  Loading yards...
                </td>
              </tr>
            ) : yards.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#8e8d9c' }}>
                  <Warehouse size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <div>No yards found matching your criteria.</div>
                </td>
              </tr>
            ) : (
              yards.map((yard) => (
                <tr key={yard.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--omt-font-mono)',
                        fontWeight: 700,
                        fontSize: 12,
                        color: 'var(--omt-color-primary)',
                        backgroundColor: '#efe7ff',
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {yard.yardCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--omt-color-text-main)' }}>{yard.name}</div>
                    <div style={{ fontSize: 11, color: '#8e8d9c', marginTop: 2 }}>{yard.address}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{yard.city}</div>
                    <div style={{ fontSize: 11, color: '#8e8d9c' }}>{yard.country}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Car size={14} color="#8e8d9c" />
                      <span style={{ fontWeight: 700 }}>{yard.assignedVehicleCount}</span>
                      {yard.activeVehicleCount > 0 && (
                        <span style={{ fontSize: 10, color: '#d97706', backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                          {yard.activeVehicleCount} active
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        yard.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'
                      }`}
                    >
                      <span className="badge-status-dot" />
                      {yard.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Link
                        to={`/yards/${yard.id}`}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        title="View yard details"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to={`/yards/${yard.id}?edit=true`}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, borderColor: '#d8b4fe', color: '#7c3aed' }}
                          title="Edit yard details"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
