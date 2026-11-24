import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { OmtLogoLoader } from '../common/OmtLogoLoader';
import {
  RiDashboardLine,
  RiCarLine,
  RiSettings4Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from 'react-icons/ri';
import {
  FiPackage,
  FiUser,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';

export const AppLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/mfa/login', { replace: true });
  };

  // Theme state persisted in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('omt_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('omt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Collapse state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('omt_sidebar_collapsed');
    return saved !== null ? saved === 'true' : false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('omt_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Compute initials (e.g. Shiva Test -> ST)
  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/profile')) return 'PROFILE';
    if (path.startsWith('/dashboard')) return 'DASHBOARD';
    if (path.startsWith('/yards/new')) return 'YARDS / NEW YARD';
    if (path.startsWith('/yards/')) return 'YARDS / DETAILS';
    if (path.startsWith('/yards')) return 'YARDS';
    if (path.startsWith('/vehicles/new')) return 'VEHICLES / NEW VEHICLE';
    if (path.startsWith('/vehicles/')) return 'VEHICLES / DETAILS';
    if (path.startsWith('/vehicles')) return 'VEHICLES';
    if (path.startsWith('/users')) return 'WORKFORCE ACCESS';
    return 'PROFILE';
  };

  const sidebarWidth = isCollapsed ? 68 : 240;

  if (isLoading) {
    return <OmtLogoLoader fullScreen text="Initializing OMT..." />;
  }

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
          width: sidebarWidth,
          minWidth: sidebarWidth,
          backgroundColor: '#181328',
          backgroundImage: 'radial-gradient(120% 40% at 0% 0%, rgba(168, 132, 240, 0.14), transparent 60%), linear-gradient(185deg, #241a3d 0%, #181328 55%, #120e22 100%)',
          borderRight: '1px solid #2e2842',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: '6px 0 24px -8px rgba(134, 51, 243, 0.28)',
          overflowX: 'hidden',
        }}
        className={mobileOpen ? 'sidebar-open' : ''}
      >
        {/* Logo Section */}
        <div
          style={{
            height: 64,
            padding: isCollapsed ? '0 14px' : '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
              gap: 12,
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',
            }}
            title="OMT Platform"
          >
            {/* OMT Logo Emblem matching screenshot */}
            <div
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="36" height="28" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="2" y1="9" x2="14" y2="9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="16" x2="16" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="4" y1="23" x2="14" y2="23" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="26" cy="16" r="10" stroke="#a855f7" strokeWidth="3" fill="#1b1233" />
                <circle cx="26" cy="16" r="4.5" fill="#c084fc" />
                <path d="M26 4V8M26 24V28M14 16H18M34 16H38M17.5 7.5L20.5 10.5M31.5 21.5L34.5 24.5M17.5 24.5L20.5 21.5M31.5 10.5L34.5 7.5" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--omt-font-display)',
                    fontWeight: 800,
                    fontSize: 16,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                  }}
                >
                  OMT <span style={{ color: '#a855f7' }}>LITE</span>
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
            )}
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
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav
          style={{
            flex: 1,
            padding: isCollapsed ? '16px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Dashboard NavLink */}
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            data-tooltip="Dashboard"
            className={isCollapsed ? 'sidebar-collapsed-item' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 12,
              padding: isCollapsed ? '12px 0' : '10px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#adacbd',
              backgroundColor: isActive ? '#8633f3' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <RiDashboardLine size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Vehicles NavLink */}
          <NavLink
            to="/vehicles"
            onClick={() => setMobileOpen(false)}
            data-tooltip="Vehicles"
            className={isCollapsed ? 'sidebar-collapsed-item' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 12,
              padding: isCollapsed ? '12px 0' : '10px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#adacbd',
              backgroundColor: isActive ? '#8633f3' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
            title={isCollapsed ? 'Vehicles' : undefined}
          >
            <RiCarLine size={20} />
            {!isCollapsed && <span>Vehicles</span>}
          </NavLink>

          {/* Yards NavLink */}
          <NavLink
            to="/yards"
            onClick={() => setMobileOpen(false)}
            data-tooltip="Yards"
            className={isCollapsed ? 'sidebar-collapsed-item' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 12,
              padding: isCollapsed ? '12px 0' : '10px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#adacbd',
              backgroundColor: isActive ? '#8633f3' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
            title={isCollapsed ? 'Yards' : undefined}
          >
            <FiPackage size={19} />
            {!isCollapsed && <span>Yards</span>}
          </NavLink>

          {/* Workforce Access (Admin) or Settings */}
          {isAdmin && (
            <NavLink
              to="/users"
              onClick={() => setMobileOpen(false)}
              data-tooltip="Workforce Access"
              className={isCollapsed ? 'sidebar-collapsed-item' : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: isCollapsed ? '12px 0' : '10px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : '#adacbd',
                backgroundColor: isActive ? '#8633f3' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              })}
              title={isCollapsed ? 'Workforce Access' : undefined}
            >
              <RiSettings4Line size={20} />
              {!isCollapsed && <span>Workforce Access</span>}
            </NavLink>
          )}
        </nav>

        {/* Lower / Bottom Action Section matching screenshot */}
        <div
          style={{
            padding: isCollapsed ? '12px 8px' : '14px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Profile Link in Sidebar */}
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            data-tooltip="Profile Settings"
            className={isCollapsed ? 'sidebar-collapsed-item' : ''}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 12,
              padding: isCollapsed ? '12px 0' : '10px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#adacbd',
              backgroundColor: isActive ? '#8633f3' : 'transparent',
              boxShadow: isActive ? '0 4px 14px rgba(134, 51, 243, 0.4)' : 'none',
              transition: 'all 0.15s ease',
            })}
            title={isCollapsed ? 'Profile' : undefined}
          >
            <FiUser size={19} />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>

          {/* User Details in Expanded Mode */}
          {!isCollapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 6px',
                marginTop: 2,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8633f3 0%, #7115d6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {getInitials(user?.name)}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'Shiva Test'}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#9ca3af',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email || 'bandishivakumar880@gmail.com'}
                </div>
              </div>

              {/* Quick Sign Out button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  padding: 6,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FiLogOut size={16} />
              </button>
            </div>
          )}

          {/* Collapse Toggle Button matching screenshot bottom door/collapse icon */}
          <button
            onClick={toggleCollapse}
            data-tooltip={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={isCollapsed ? 'sidebar-collapsed-item' : ''}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: isCollapsed ? '10px 0' : '8px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#adacbd',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(134, 51, 243, 0.25)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(134, 51, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#adacbd';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="main-layout"
      >
        {/* Top Sticky Header */}
        <header
          className="app-header"
          style={{
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'var(--omt-header-bg, rgba(244, 241, 251, 0.94))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--omt-color-border, #e5e2ed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {/* Left: Mobile menu toggle & Breadcrumb Tab with purple underline */}
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
              <FiMenu size={22} />
            </button>

            {/* Breadcrumb Tab with purple bottom underline matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--omt-font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8633f3',
                  position: 'relative',
                  paddingBottom: 4,
                  borderBottom: '2.5px solid #8633f3',
                }}
              >
                {location.pathname.startsWith('/vehicles/') && location.pathname !== '/vehicles' ? (
                  <span>
                    <Link to="/vehicles" style={{ color: 'inherit', textDecoration: 'none' }}>
                      VEHICLES
                    </Link>{' '}
                    / DETAILS
                  </span>
                ) : location.pathname.startsWith('/yards/') && location.pathname !== '/yards' ? (
                  <span>
                    <Link to="/yards" style={{ color: 'inherit', textDecoration: 'none' }}>
                      YARDS
                    </Link>{' '}
                    / DETAILS
                  </span>
                ) : (
                  getBreadcrumbTitle()
                )}
              </div>
            </div>
          </div>

          {/* Right Header items: Theme toggle & ST Avatar matching screenshot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle Button (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme === 'dark' ? '#fbbf24' : '#4b5563',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(134, 51, 243, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* ST Purple Circle Avatar matching screenshot */}
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
                userSelect: 'none',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="View Profile"
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-main-content" style={{ flex: 1, padding: '28px 32px 48px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside {
            transform: translateX(-100%) !important;
            width: 240px !important;
          }
          aside.sidebar-open {
            transform: translateX(0) !important;
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
          header {
            padding: 0 16px !important;
          }
          main {
            padding: 16px 12px 40px !important;
          }
        }
      `}</style>
    </div>
  );
};
