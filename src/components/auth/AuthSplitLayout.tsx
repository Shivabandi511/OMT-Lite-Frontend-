import React from 'react';
import { Check } from 'lucide-react';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ children }) => {
  return (
    <div className="auth-split-layout">
      {/* Left Brand Panel */}
      <div className="auth-left-panel">
        {/* Top Logo */}
        <div className="auth-brand-logo">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="9" x2="14" y2="9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="16" x2="16" y2="16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4" y1="23" x2="14" y2="23" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="26" cy="16" r="10" stroke="#a855f7" strokeWidth="3" fill="#1b1233" />
              <circle cx="26" cy="16" r="4.5" fill="#c084fc" />
              <path d="M26 4V8M26 24V28M14 16H18M34 16H38M17.5 7.5L20.5 10.5M31.5 21.5L34.5 24.5M17.5 24.5L20.5 21.5M31.5 10.5L34.5 7.5" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="auth-brand-text">OMT Lite</span>
        </div>

        {/* Middle Value Proposition Headline & Checklist */}
        <div className="auth-hero-content">
          <h1 className="auth-hero-headline">
            Supply chain intelligence for salvage operations.
          </h1>

          <p className="auth-hero-subtext">
            The enterprise standard for heavy machinery and vehicle logistics, connecting global yards with real-time traceability.
          </p>

          <div className="auth-hero-list">
            <div className="auth-hero-item">
              <div className="auth-check-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <div className="auth-item-title">QR traceability</div>
                <div className="auth-item-desc">End-to-end component tracking across borders.</div>
              </div>
            </div>

            <div className="auth-hero-item">
              <div className="auth-check-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <div className="auth-item-title">Container management</div>
                <div className="auth-item-desc">Optimized manifest planning and load tracking.</div>
              </div>
            </div>

            <div className="auth-hero-item">
              <div className="auth-check-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <div className="auth-item-title">Nigeria tracking</div>
                <div className="auth-item-desc">Customized clearance modules for Nigerian operations.</div>
              </div>
            </div>

            <div className="auth-hero-item">
              <div className="auth-check-icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <div className="auth-item-title">Multi-yard SaaS</div>
                <div className="auth-item-desc">Unified dashboard for distributed salvage networks.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="auth-footer">
          © 2026 OMT Lite Enterprise. All rights reserved.
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="auth-right-panel">
        {children}
      </div>
    </div>
  );
};
