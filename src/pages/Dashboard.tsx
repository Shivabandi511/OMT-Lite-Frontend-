import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import type { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  RiCarLine,
  RiInboxLine,
  RiMoneyDollarCircleLine,
  RiVipDiamondLine,
  RiFocus3Line,
} from 'react-icons/ri';
import {
  FiAlertTriangle,
  FiClock,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>('Sep');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardSummary();
      setSummary(data);
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

  // 6-Month Revenue Data
  const monthlyRevenue = [
    { month: 'Jun', amount: 0, parts: 0 },
    { month: 'Jul', amount: 0, parts: 0 },
    { month: 'Aug', amount: 0, parts: 0 },
    { month: 'Sep', amount: 12400, parts: 34 },
    { month: 'Oct', amount: 0, parts: 0 },
    { month: 'Nov', amount: 0, parts: 0 },
  ];

  // Pipeline Data from screenshot
  const pipelineStats = [
    { label: 'Acquired', count: 0, percent: '0%', color: '#d1d5db' },
    { label: 'Parts Assigned', count: 0, percent: '0%', color: '#d1d5db' },
    { label: 'Ready', count: 4, percent: '14%', color: '#a78bfa' },
    { label: 'Dismantling', count: 2, percent: '7%', color: '#7c3aed' },
    { label: 'Dismantled', count: 19, percent: '68%', color: '#4c1d95' },
  ];

  // Ready to Load Breakdown
  const gradeBreakdown = [
    { grade: 'Grade A', count: 129, val: '$0', fillPct: 51, color: '#4c1d95' },
    { grade: 'Grade B', count: 254, val: '$0', fillPct: 100, color: '#8633f3' },
    { grade: 'Grade C', count: 87, val: '$0', fillPct: 34, color: '#a78bfa' },
    { grade: 'Grade D', count: 206, val: '$0', fillPct: 81, color: '#c4b5fd' },
    { grade: 'Ungraded', count: 91, val: '—', fillPct: 36, color: '#e0e7ff' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Welcome Title matching screenshot: Good morning, Shiva. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
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

      {/* Row 1: 5 KPI Summary Cards matching screenshot */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
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
              {isLoading ? '...' : (summary?.totalVehicles ?? 28)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              active
            </div>
          </div>
        </div>

        {/* Card 2: TOTAL PARTS */}
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
              TOTAL PARTS
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              2,390
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              extracted
            </div>
          </div>
        </div>

        {/* Card 3: REVENUE · THIS MONTH */}
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
              <RiMoneyDollarCircleLine />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              REVENUE · THIS MONTH
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              $0
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              No sales yet
            </div>
          </div>
        </div>

        {/* Card 4: EST. STOCK VALUE */}
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
              <RiVipDiamondLine />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--omt-color-text-muted)', letterSpacing: '0.04em' }}>
              EST. STOCK VALUE
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              $18,500
            </div>
            <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 4 }}>
              estimated parts + whole cars
            </div>
          </div>
        </div>

        {/* Card 5: REALIZATION */}
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
              REALIZATION
            </span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--omt-color-text-main)', lineHeight: 1.1 }}>
              —
            </div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
              sold price vs estimate
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Revenue Bar Chart (Left) + Needs Attention (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: 16,
        }}
        className="dashboard-middle-row"
      >
        {/* Left Card: Revenue, last 6 months */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
              Revenue, last 6 months
            </h2>
            <span style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
              parts sold · actual prices
            </span>
          </div>

          {/* Bar Chart Container */}
          <div
            style={{
              flex: 1,
              minHeight: 180,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              paddingTop: 30,
              paddingBottom: 8,
              borderBottom: '1px solid var(--omt-color-border-subtle, #f1f0f7)',
              position: 'relative',
            }}
          >
            {monthlyRevenue.map((item) => {
              const isSep = item.month === 'Sep';
              const isHovered = hoveredMonth === item.month;
              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  onMouseLeave={() => setHoveredMonth('Sep')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    width: '14%',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Tooltip on active bar */}
                  {isHovered && isSep && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -24,
                        backgroundColor: '#181328',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 10,
                      }}
                    >
                      $12,400 (34 parts)
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{
                      width: isSep ? 46 : 28,
                      height: isSep ? 135 : 4,
                      backgroundColor: isSep ? '#a78bfa' : 'rgba(167, 139, 250, 0.45)',
                      borderRadius: isSep ? '6px 6px 2px 2px' : 999,
                      transition: 'all 0.25s ease',
                      boxShadow: isSep ? '0 4px 12px rgba(167, 139, 250, 0.3)' : 'none',
                    }}
                  />

                  {/* Month Label */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: item.month === 'Nov' ? 800 : 600,
                      color: item.month === 'Nov' ? '#8633f3' : 'var(--omt-color-text-muted)',
                      textDecoration: item.month === 'Nov' ? 'underline' : 'none',
                    }}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Needs Attention */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)', marginBottom: 16 }}>
            Needs attention
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Alert 1 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--omt-color-border)',
                borderLeft: '3px solid #f87171',
                backgroundColor: 'var(--omt-color-surface-variant, #fcfbfe)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <FiAlertTriangle />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                  NG-00002 selling slowly
                </div>
                <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
                  1495 of 1500 items unsold after 74 days
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--omt-color-border)',
                borderLeft: '3px solid #f87171',
                backgroundColor: 'var(--omt-color-surface-variant, #fcfbfe)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <FiAlertTriangle />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                  NG-00001 selling slowly
                </div>
                <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
                  131 of 132 items unsold after 96 days
                </div>
              </div>
            </div>

            {/* Alert 3 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--omt-color-border)',
                borderLeft: '3px solid #f59e0b',
                backgroundColor: 'var(--omt-color-surface-variant, #fcfbfe)',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <FiClock />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--omt-color-text-main)' }}>
                  91 parts ungraded
                </div>
                <div style={{ fontSize: 11, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
                  Grading blocks pricing and loading
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Vehicle Pipeline Donut Chart (Left) + Ready to load Grades (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 16,
        }}
        className="dashboard-bottom-row"
      >
        {/* Left Card: Vehicle Pipeline */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
              Vehicle Pipeline
            </h2>
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
            {/* SVG Donut Chart */}
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
                {/* Dismantled: 68% -> circumference = 2 * pi * 38 = 238.76. 68% = 162.3 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#4c1d95"
                  strokeWidth="12"
                  strokeDasharray="162 239"
                  strokeDashoffset="0"
                />
                {/* Ready: 14% -> 33.4. Offset = -162 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#a78bfa"
                  strokeWidth="12"
                  strokeDasharray="33 239"
                  strokeDashoffset="-162"
                />
                {/* Dismantling: 7% -> 16.7. Offset = -195 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#7c3aed"
                  strokeWidth="12"
                  strokeDasharray="17 239"
                  strokeDashoffset="-195"
                />
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
                  28
                </div>
                <div style={{ fontSize: 10, color: 'var(--omt-color-text-muted)', marginTop: 2 }}>
                  in pipeline
                </div>
              </div>
            </div>

            {/* Pipeline Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
              {pipelineStats.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        border: item.count === 0 ? '1px solid #9ca3af' : 'none',
                      }}
                    />
                    <span style={{ color: 'var(--omt-color-text-main)', fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontWeight: 700, color: 'var(--omt-color-text-main)', width: 14, textAlign: 'right' }}>
                      {item.count}
                    </span>
                    <span style={{ color: 'var(--omt-color-text-muted)', width: 34, textAlign: 'right' }}>
                      {item.percent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Ready to load */}
        <div className="omt-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--omt-color-text-main)' }}>
              Ready to load
            </h2>
            <span style={{ fontSize: 12, color: 'var(--omt-color-text-muted)' }}>
              767 extracted, unsold
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {gradeBreakdown.map((row) => (
              <div key={row.grade} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--omt-color-text-main)',
                    width: 72,
                    flexShrink: 0,
                  }}
                >
                  {row.grade}
                </span>

                {/* Progress bar container */}
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    backgroundColor: 'var(--omt-color-surface-variant, #f1f0f7)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${row.fillPct}%`,
                      height: '100%',
                      backgroundColor: row.color,
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--omt-color-text-main)',
                    width: 60,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {row.count} · {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
