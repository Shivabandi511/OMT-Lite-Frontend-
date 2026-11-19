import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Warehouse,
  Car,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'OPERATIONS DASHBOARD';
    if (path.startsWith('/yards/new')) return 'YARDS / NEW YARD';
    if (path.startsWith('/yards/')) return 'YARDS / YARD DETAILS';
    if (path.startsWith('/yards')) return 'YARD MANAGEMENT';
    if (path.startsWith('/vehicles/new')) return 'VEHICLES / NEW ASSET';
    if (path.startsWith('/vehicles/')) return 'VEHICLES / VEHICLE DETAILS';
    if (path.startsWith('/vehicles')) return 'VEHICLE ASSETS';
    if (path.startsWith('/users')) return 'TENANT ADMIN / WORKFORCE & STAFF ACCESS';
    return 'OMT PLATFORM';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 'var(--omt-sidebar-width)',
          backgroundColor: 'var(--omt-color-sidebar)',
          backgroundImage: 'var(--omt-sidebar-gradient)',
          borderRight: '1px solid var(--omt-color-sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: '6px 0 24px -8px rgba(134, 51, 243, 0.28)',
        }}
        className={mobileOpen ? 'sidebar-open' : ''}
      >
        {/* Logo Section */}
        <div
          style={{
            height: 'var(--omt-header-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--omt-color-sidebar-border)',
          }}
        >
          <div
            onClick={() => {
              navigate('/dashboard');
              setMobileOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <img
              src="/omt-favicon.png"
              alt="OMT"
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }}
              onError={(e) => {
                // fallback if image not found
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                OMT <span style={{ color: 'var(--omt-color-primary)' }}>LITE</span>
              </span>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#8e8d9c',
                }}
              >
                Yard & Vehicle System
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#adacbd',
              cursor: 'pointer',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              padding: '6px 10px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#716e85',
            }}
          >
            Core Modules
          </div>

          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : 'var(--omt-color-sidebar-text)',
              backgroundColor: isActive ? 'var(--omt-color-primary)' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/yards"
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : 'var(--omt-color-sidebar-text)',
              backgroundColor: isActive ? 'var(--omt-color-primary)' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <Warehouse size={17} />
            <span>Yards</span>
          </NavLink>

          <NavLink
            to="/vehicles"
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : 'var(--omt-color-sidebar-text)',
              backgroundColor: isActive ? 'var(--omt-color-primary)' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <Car size={17} />
            <span>Vehicles</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/users"
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : 'var(--omt-color-sidebar-text)',
                backgroundColor: isActive ? 'var(--omt-color-primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Users size={17} />
              <span>Workforce Access</span>
            </NavLink>
          )}
        </nav>

        {/* User Card in Sidebar Bottom */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid var(--omt-color-sidebar-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8633f3 0%, #7115d6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(134, 51, 243, 0.3)',
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OM'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: isAdmin ? 'rgba(134, 51, 243, 0.25)' : 'rgba(217, 119, 6, 0.25)',
                  color: isAdmin ? '#d8b4fe' : '#fcd34d',
                  marginTop: 2,
                }}
              >
                {isAdmin ? <ShieldCheck size={11} /> : <UserCheck size={11} />}
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#adacbd',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#adacbd';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: 'var(--omt-sidebar-width)',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
        className="main-layout"
      >
        {/* Top Sticky Header */}
        <header
          style={{
            height: 'var(--omt-header-height)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'rgba(242, 239, 251, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2dfec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            boxShadow: '0 4px 18px -6px rgba(134, 51, 243, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--omt-color-text-main)',
                cursor: 'pointer',
                padding: 4,
              }}
              className="hamburger-btn"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--omt-color-primary)',
                  borderBottom: '2px solid var(--omt-color-primary)',
                  paddingBottom: 2,
                }}
              >
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Seed Account indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                backgroundColor: '#ffffff',
                border: '1px solid #e2dfec',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--omt-color-text-muted)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px 32px 48px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside {
            transform: translateX(-100%);
          }
          aside.sidebar-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
          .hamburger-btn {
            display: block !important;
          }
          .main-layout {
            margin-left: 0 !important;
          }
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
