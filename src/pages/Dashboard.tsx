import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Warehouse,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<DashboardSummary>('/dashboard');
      setSummary(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--omt-color-text-main)',
            }}
          >
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
            Overview of live yard capacity and processing pipeline
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchDashboardData}
            className="btn-secondary"
            title="Refresh statistics"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isAdmin && (
            <Link to="/yards/new" className="btn-secondary">
              <Plus size={14} />
              <span>Add Yard</span>
            </Link>
          )}

          <Link to="/vehicles/new" className="btn-primary">
            <Plus size={14} />
            <span>Register Vehicle</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 24,
            border: '1px solid #fecaca',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 18,
          marginBottom: 28,
        }}
      >
        {/* Total Yards */}
        <div className="omt-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
                Total Yards
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                {isLoading ? '...' : summary?.totalYards ?? 0}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#efe7ff',
                color: 'var(--omt-color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Warehouse size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#059669', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} />
            <span>{summary?.activeYards ?? 0} Active</span>
            <span style={{ color: '#8e8d9c', marginLeft: 4 }}>({summary?.inactiveYards ?? 0} Inactive)</span>
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="omt-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
                Total Vehicles
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--omt-color-text-main)', marginTop: 4 }}>
                {isLoading ? '...' : summary?.totalVehicles ?? 0}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Car size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#5f5f6c' }}>
            <span>Registered vehicle assets across all active yards</span>
          </div>
        </div>

        {/* Received */}
        <div className="omt-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
                Received
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--omt-color-primary)', marginTop: 4 }}>
                {isLoading ? '...' : summary?.vehiclesReceived ?? 0}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#efe7ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
            <span>Awaiting triage / processing</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="omt-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
                In Progress
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                {isLoading ? '...' : summary?.vehiclesInProgress ?? 0}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#b45309', fontWeight: 600 }}>
            <span>Active dismantling or holding</span>
          </div>
        </div>

        {/* Completed */}
        <div className="omt-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8e8d9c', letterSpacing: '0.05em' }}>
                Completed
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                {isLoading ? '...' : summary?.vehiclesCompleted ?? 0}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#059669', fontWeight: 600 }}>
            <span>Archived &amp; Read-Only</span>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Yards Module Preview */}
        <div className="omt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#efe7ff',
                  color: 'var(--omt-color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Warehouse size={18} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>Yard Operations</h2>
            </div>
            <Link to="/yards" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--omt-color-primary)', textDecoration: 'none' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Manage site locations where incoming vehicles are received, stored, or dismantled. Yards with active vehicles cannot be deactivated.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/yards" className="btn-secondary" style={{ flex: 1 }}>
              Browse Yards
            </Link>
            {isAdmin && (
              <Link to="/yards/new" className="btn-primary" style={{ flex: 1 }}>
                <Plus size={14} /> Add Yard
              </Link>
            )}
          </div>
        </div>

        {/* Vehicles Module Preview */}
        <div className="omt-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#f3e8ff',
                  color: '#9333ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Car size={18} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>Vehicle Asset Registry</h2>
            </div>
            <Link to="/vehicles" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--omt-color-primary)', textDecoration: 'none' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--omt-color-text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Register new vehicles under active yards, validate 17-digit VINs, track dismantling routing, and advance forward status stages.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/vehicles" className="btn-secondary" style={{ flex: 1 }}>
              Browse Vehicles
            </Link>
            <Link to="/vehicles/new" className="btn-primary" style={{ flex: 1 }}>
              <Plus size={14} /> Register Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
