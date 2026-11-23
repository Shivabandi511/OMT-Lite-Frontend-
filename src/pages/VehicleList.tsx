import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import yardService from '../services/yardService';
import type { Vehicle, Yard, RoutingDecision, VehicleStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  Search,
  Plus,
  Car,
  Filter,
  Eye,
  Warehouse,
  Lock,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { decodeVinLocally } from '../utils/vinDecoder';

export const VehicleList: React.FC = () => {
  const { canMakeOperations, isStaff } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [yardFilter, setYardFilter] = useState<string>('');
  const [routingFilter, setRoutingFilter] = useState<RoutingDecision | ''>('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodedSearchVin = searchTerm.trim().length >= 3 ? decodeVinLocally(searchTerm.trim()) : null;

  // Load yards for filter dropdown
  useEffect(() => {
    yardService.getYards().then(setYards).catch(() => {});
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (yardFilter) params.yardId = yardFilter;
      if (routingFilter) params.routingDecision = routingFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await vehicleService.getVehicles(params);
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, yardFilter, routingFilter, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVehicles();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [fetchVehicles]);

  const resetFilters = () => {
    setSearchTerm('');
    setYardFilter('');
    setRoutingFilter('');
    setStatusFilter('');
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
            Vehicle Asset Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
            Register identification, inspect routing decisions, and advance lifecycle stages
          </p>
        </div>

        <div>
          {canMakeOperations ? (
            <Link to="/vehicles/new" className="btn-primary">
              <Plus size={15} />
              <span>Register New Vehicle</span>
            </Link>
          ) : (
            <button
              disabled
              className="btn-secondary"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              title="Read-Only Staff: Operational modifications require Tenant Admin approval"
            >
              <Lock size={14} />
              <span>Register Vehicle (Read-Only)</span>
            </button>
          )}
        </div>
      </div>

      {isStaff && !canMakeOperations && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#92400e',
            fontSize: 13,
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Read-Only Staff Mode:</strong> Your Tenant Administrator has granted you Read-Only permissions. You can search, inspect, and track vehicles, but vehicle registration and status advance operations are restricted.
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="omt-card"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
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
              placeholder="Search by VIN, asset code, make, or model..."
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
            {decodedSearchVin && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  zIndex: 10,
                  backgroundColor: '#f5f0ff',
                  border: '1px solid #d8b4fe',
                  borderRadius: 6,
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: '#6b21a8',
                  boxShadow: '0 4px 12px rgba(107, 33, 168, 0.1)',
                }}
              >
                <Sparkles size={12} color="#7e22ce" />
                <span>
                  VIN Match: <strong>{decodedSearchVin.displayName}</strong> (Make: {decodedSearchVin.make}, Model: {decodedSearchVin.model})
                </span>
              </div>
            )}
          </div>

          {/* Yard Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Warehouse size={14} color="#8e8d9c" />
            <select
              value={yardFilter}
              onChange={(e) => setYardFilter(e.target.value)}
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
              <option value="">All Yards</option>
              {yards.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.yardCode} - {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Routing Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="#8e8d9c" />
            <select
              value={routingFilter}
              onChange={(e) => setRoutingFilter(e.target.value as RoutingDecision | '')}
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
              <option value="">All Routing</option>
              <option value="DISMANTLE">Dismantle</option>
              <option value="KEEP_WHOLE">Keep Whole</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | '')}
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
            <option value="RECEIVED">Received</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {(searchTerm || yardFilter || routingFilter || statusFilter) && (
            <button
              onClick={resetFilters}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12 }}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchVehicles} />}

      {/* Vehicles Table */}
      <div className="omt-table-wrapper">
        <table className="omt-table">
          <thead>
            <tr>
              <th>Asset Code</th>
              <th>VIN</th>
              <th>Make &amp; Model</th>
              <th>Yard Location</th>
              <th>Routing</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#8e8d9c' }}>
                  Loading vehicle assets...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px 0' }}>
                  <EmptyState
                    icon={Car}
                    title="No vehicles found"
                    description={
                      searchTerm || yardFilter || routingFilter || statusFilter
                        ? 'No vehicles match your active search and filter criteria. Try clearing filters.'
                        : 'No vehicle assets registered yet.'
                    }
                    actionText={searchTerm || yardFilter || routingFilter || statusFilter ? 'Reset Filters' : undefined}
                    onAction={searchTerm || yardFilter || routingFilter || statusFilter ? resetFilters : undefined}
                  />
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
                        color: 'var(--omt-color-primary)',
                        backgroundColor: '#efe7ff',
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {v.assetCode}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--omt-font-mono)', fontSize: 12, fontWeight: 600 }}>
                      {v.vin}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                      {v.make} {v.model}
                    </div>
                    <div style={{ fontSize: 11, color: '#8e8d9c' }}>Year {v.manufactureYear}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--omt-color-text-main)' }}>
                      {v.yardName}
                    </div>
                    <div style={{ fontSize: 11, color: '#8e8d9c' }}>{v.yardCode}</div>
                  </td>
                  <td>
                    <StatusBadge status={v.routingDecision} size="sm" />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StatusBadge status={v.status} size="sm" />
                      {v.status === 'COMPLETED' && (
                        <span
                          title="Completed vehicles are read-only"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#059669',
                          }}
                        >
                          <Lock size={12} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </Link>
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
