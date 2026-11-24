import React, { useEffect } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';

export interface InfoModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  closeText?: string;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  title,
  subtitle,
  children,
  closeText = 'Close',
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'omtModalFadeIn 0.18s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: 480,
          padding: '24px',
          animation: 'omtModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}
          title="Close dialog"
        >
          <FiX size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#f3e8ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FiInfo size={22} />
          </div>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <h3
              style={{
                margin: '0 0 4px 0',
                fontSize: 18,
                fontWeight: 700,
                color: '#111827',
                fontFamily: 'var(--omt-font-display, inherit)',
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div style={{ marginBottom: 20 }}>{children}</div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};
