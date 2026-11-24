import React, { useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <FiAlertTriangle size={24} color="#dc2626" />,
          iconBg: '#fee2e2',
          btnBg: '#dc2626',
          btnHover: '#b91c1c',
          btnText: '#ffffff',
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={24} color="#d97706" />,
          iconBg: '#fef3c7',
          btnBg: '#d97706',
          btnHover: '#b45309',
          btnText: '#ffffff',
        };
      case 'success':
        return {
          icon: <FiCheckCircle size={24} color="#16a34a" />,
          iconBg: '#dcfce7',
          btnBg: '#16a34a',
          btnHover: '#15803d',
          btnText: '#ffffff',
        };
      case 'primary':
      default:
        return {
          icon: <FiCheckCircle size={24} color="#7c3aed" />,
          iconBg: '#ede9fe',
          btnBg: 'var(--omt-color-primary, #7c3aed)',
          btnHover: 'var(--omt-color-primary-hover, #6d28d9)',
          btnText: '#ffffff',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="omt-confirm-title"
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
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <style>{`
        @keyframes omtModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes omtModalPop {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes omtModalSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: 460,
          padding: '24px 24px 20px 24px',
          animation: 'omtModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: isLoading ? 'not-allowed' : 'pointer',
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

        {/* Header with Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: v.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {v.icon}
          </div>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <h3
              id="omt-confirm-title"
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
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              OMT Platform Confirmation
            </span>
          </div>
        </div>

        {/* Message Body */}
        <div
          style={{
            fontSize: 13.5,
            color: '#374151',
            lineHeight: 1.55,
            marginBottom: 24,
            padding: '12px 14px',
            backgroundColor: '#f9fafb',
            borderRadius: 10,
            border: '1px solid #f3f4f6',
          }}
        >
          {message}
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: v.btnBg,
              color: v.btnText,
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
              transition: 'opacity 0.15s',
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderTopColor: '#ffffff',
                  animation: 'omtModalSpin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            <span>{isLoading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
