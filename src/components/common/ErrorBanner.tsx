import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = React.memo(({ message, onRetry }) => {
  return (
    <div
      style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        color: '#991b1b',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#ffffff',
            border: '1px solid #f87171',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: '#b91c1c',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
});

ErrorBanner.displayName = 'ErrorBanner';
