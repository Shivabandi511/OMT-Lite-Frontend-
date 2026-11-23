import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import vehicleService from '../services/vehicleService';
import type { DashboardSummary, Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  RiCarLine,
  RiInboxLine,
  RiStore2Line,
  RiFocus3Line,
} from 'react-icons/ri';
import {
  FiArrowRight,
  FiRefreshCw,
  FiEye,
  FiAlertCircle,
} from 'react-icons/fi';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [summaryData, vehiclesData] = await Promise.all([
        dashboardService.getDashboardSummary(),
        vehicleService.getVehicles(),
      ]);
      setSummary(summaryData);
      setRecentVehicles(vehiclesData.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute first name for greeting
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Shiva';

  // Dynamic calculations from backend summary
  const totalVehicles = summary?.totalVehicles ?? 0;
  const receivedCount = summary?.vehiclesReceived ?? 0;
  const inProgressCount = summary?.vehiclesInProgress ?? 0;
  const completedCount = summary?.vehiclesCompleted ?? 0;
  const dismantleCount = summary?.vehiclesDismantle ?? 0;
  const keepWholeCount = summary?.vehiclesKeepWhole ?? 0;

  const totalParts = summary?.totalParts ?? 0;
  const extractedParts = summary?.extractedParts ?? 0;
  const pendingParts = summary?.pendingParts ?? 0;
  const extractableParts = summary?.extractableParts ?? 0;

  // Real percentage calculations
  const completionRate = totalVehicles > 0 ? Math.round((completedCount / totalVehicles) * 100) : 0;
  const inProgressRate = totalVehicles > 0 ? Math.round((inProgressCount / totalVehicles) * 100) : 0;
  const readyRate = totalVehicles > 0 ? Math.round((receivedCount / totalVehicles) * 100) : 0;

  const dismantlePct = totalVehicles > 0 ? Math.round((dismantleCount / totalVehicles) * 100) : 0;
  const keepWholePct = totalVehicles > 0 ? Math.round((keepWholeCount / totalVehicles) * 100) : 0;

  // Circumference for Donut Chart (r = 38)
  const circumference = 238.76;
  const completedOffset = 0;
  const completedDash = totalVehicles > 0 ? (completedCount / totalVehicles) * circumference : 0;

  const inProgressDash = totalVehicles > 0 ? (inProgressCount / totalVehicles) * circumference : 0;
  const inProgressOffset = -completedDash;

  const readyDash = totalVehicles > 0 ? (receivedCount / totalVehicles) * circumference : 0;
  const readyOffset = -(completedDash + inProgressDash);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Welcome Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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
            Good morning, {firstName}.
          </h1>
          <p style={{ fontSize: 12, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
            Real-time yard inventory and vehicle processing lifecycle
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: 12 }}
          title="Refresh dashboard data"
        >
          <FiRefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchDashboardData} />}

      {/* Row 1: Real Dynamic KPI Summary Cards */}
      <div className="dashboard-kpi-grid">
        {/* Card 1: VEHICLES IN YARD */}
        <div className="omt-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: 'rgba(134, 51, 243, 0.1)',
                color: '#8633f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              <RiCarLine />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              VEHICLES IN YARD
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              {isLoading ? '...' : totalVehicles}
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              {inProgressCount} in dismantling · {receivedCount} ready
            </div>
          </div>
        </div>

        {/* Card 2: ACTIVE STORAGE YARDS */}
        <div className="omt-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: 'rgba(134, 51, 243, 0.1)',
                color: '#8633f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              <RiStore2Line />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              ACTIVE STORAGE YARDS
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              {isLoading ? '...' : (summary?.activeYards ?? 0)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              {summary?.inactiveYards ?? 0} inactive · {summary?.totalYards ?? 0} total yards
            </div>
          </div>
        </div>

        {/* Card 3: TOTAL REGISTERED PARTS */}
        <div className="omt-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: 'rgba(134, 51, 243, 0.1)',
                color: '#8633f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              <RiInboxLine />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              REGISTERED PARTS
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              {isLoading ? '...' : totalParts.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              {extractableParts} can be extracted · {extractedParts} extracted
            </div>
          </div>
        </div>

        {/* Card 4: PROCESSING COMPLETION RATE */}
        <div className="omt-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: 'rgba(134, 51, 243, 0.1)',
                color: '#8633f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              <RiFocus3Line />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              PROCESSING RATE
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              {isLoading ? '...' : `${completionRate}%`}
            </div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
              {completedCount} of {totalVehicles} completed
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Real Visual Pipeline & Routing Decision Breakdown */}
      <div className="dashboard-middle-row">
        {/* Left Card: Dynamic Vehicle Pipeline Donut Chart */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
                Vehicle Processing Pipeline
              </h2>
              <span style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
                Live distribution across processing lifecycle
              </span>
            </div>
            <Link
              to="/vehicles"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                color: '#8633f3',
                textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              <span>ASSETS</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="dashboard-donut-wrapper">
            {/* Real SVG Donut Chart */}
            <div style={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="var(--omt-color-border-subtle, #f1f0f7)"
                  strokeWidth="12"
                />

                {/* Completed / Dismantled Segment */}
                {completedDash > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#4c1d95"
                    strokeWidth="12"
                    strokeDasharray={`${completedDash} ${circumference}`}
                    strokeDashoffset={completedOffset}
                  />
                )}

                {/* In Progress / Dismantling Segment */}
                {inProgressDash > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#7c3aed"
                    strokeWidth="12"
                    strokeDasharray={`${inProgressDash} ${circumference}`}
                    strokeDashoffset={inProgressOffset}
                  />
                )}

                {/* Ready / Received Segment */}
                {readyDash > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#a78bfa"
                    strokeWidth="12"
                    strokeDasharray={`${readyDash} ${circumference}`}
                    strokeDashoffset={readyOffset}
                  />
                )}
              </svg>

              {/* Center Stat */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1 }}>
                  {totalVehicles}
                </div>
                <div style={{ fontSize: 10, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
                  in pipeline
                </div>
              </div>
            </div>

            {/* Pipeline Legend with Real Numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
              {/* Ready */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a78bfa' }} />
                  <span style={{ color: 'var(--omt-color-text-main)', fontWeight: 500 }}>
                    Ready (Received)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)', width: 14, textAlign: 'right' }}>
                    {receivedCount}
                  </span>
                  <span style={{ color: 'var(--omt-color-text-muted)', width: 34, textAlign: 'right' }}>
                    {readyRate}%
                  </span>
                </div>
              </div>

              {/* Dismantling */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7c3aed' }} />
                  <span style={{ color: 'var(--omt-color-text-main)', fontWeight: 500 }}>
                    Dismantling In Progress
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)', width: 14, textAlign: 'right' }}>
                    {inProgressCount}
                  </span>
                  <span style={{ color: 'var(--omt-color-text-muted)', width: 34, textAlign: 'right' }}>
                    {inProgressRate}%
                  </span>
                </div>
              </div>

              {/* Completed */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4c1d95' }} />
                  <span style={{ color: 'var(--omt-color-text-main)', fontWeight: 500 }}>
                    Completed / Graded
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)', width: 14, textAlign: 'right' }}>
                    {completedCount}
                  </span>
                  <span style={{ color: 'var(--omt-color-text-muted)', width: 34, textAlign: 'right' }}>
                    {completionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Routing Decisions & Parts Breakdown (Dynamic) */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
              Routing Decisions &amp; Parts Status
            </h2>
            <span style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
              Asset allocation and extraction readiness
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Routing: Dismantle for Parts */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--omt-color-text-main)' }}>
                  Dismantle for Parts
                </span>
                <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                  {dismantleCount} vehicles ({dismantlePct}%)
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  backgroundColor: 'var(--omt-color-surface-variant, #f1f0f7)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${dismantlePct}%`,
                    height: '100%',
                    backgroundColor: '#8633f3',
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Routing: Sell as Whole Car */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--omt-color-text-main)' }}>
                  Sell as Whole Car
                </span>
                <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                  {keepWholeCount} vehicles ({keepWholePct}%)
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  backgroundColor: 'var(--omt-color-surface-variant, #f1f0f7)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${keepWholePct}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* Real Parts Status Metrics */}
            <div className="dashboard-parts-stats">
              <div>
                <div style={{ color: 'var(--omt-color-text-muted)', fontSize: 11 }}>Extracted Parts</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#059669', marginTop: 2 }}>
                  {extractedParts}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--omt-color-text-muted)', fontSize: 11 }}>Pending Extraction</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#d97706', marginTop: 2 }}>
                  {pendingParts}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--omt-color-text-muted)', fontSize: 11 }}>Extractable Catalog</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#8633f3', marginTop: 2 }}>
                  {extractableParts}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Real Recent Vehicle Assets in Yard */}
      <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
              Recent Vehicle Assets in Yard
            </h2>
            <span style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
              Latest inventory registered across storage facilities
            </span>
          </div>

          <Link
            to="/vehicles"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: '#8633f3',
              textDecoration: 'none',
            }}
          >
            <span>View All Vehicles</span>
            <FiArrowRight size={13} />
          </Link>
        </div>

        {/* Operational Notice if any vehicle is ready */}
        {receivedCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <FiAlertCircle size={16} color="#d97706" />
            <span>
              <strong>{receivedCount} vehicle(s)</strong> are in <em>Ready (Received)</em> status awaiting dismantling assignment.
            </span>
          </div>
        )}

        {/* Vehicles Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="omt-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Vehicle</th>
                <th>VIN</th>
                <th>Yard Location</th>
                <th>Routing</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px 12px', color: '#8e8d9c' }}>
                    Loading vehicle inventory...
                  </td>
                </tr>
              ) : recentVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px 12px', color: '#8e8d9c' }}>
                    No vehicle assets registered yet.
                  </td>
                </tr>
              ) : (
                recentVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        style={{
                          color: '#8633f3',
                          fontWeight: 700,
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                        }}
                      >
                        {vehicle.assetCode}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--omt-color-text-main)' }}>
                        {vehicle.manufactureYear} {vehicle.make} {vehicle.model}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
                        {vehicle.vin}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--omt-color-text-main)', fontWeight: 500 }}>
                        {vehicle.yardName}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={vehicle.routingDecision} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={vehicle.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        <FiEye size={12} />
                        <span>Parts</span>
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

export default Dashboard;
