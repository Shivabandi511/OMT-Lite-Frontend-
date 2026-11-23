import React from 'react';
import type { YardStatus, VehicleStatus, RoutingDecision } from '../../types';

interface StatusBadgeProps {
  status: YardStatus | VehicleStatus | RoutingDecision | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: '#ecfdf5',
          text: '#065f46',
          border: '#a7f3d0',
          dot: '#10b981',
          label: 'Active',
        };
      case 'INACTIVE':
        return {
          bg: '#f3f4f6',
          text: '#4b5563',
          border: '#e5e7eb',
          dot: '#9ca3af',
          label: 'Inactive',
        };
      case 'RECEIVED':
        return {
          bg: '#eff6ff',
          text: '#1e40af',
          border: '#bfdbfe',
          dot: '#3b82f6',
          label: 'Received',
        };
      case 'IN_PROGRESS':
        return {
          bg: '#fef3c7',
          text: '#92400e',
          border: '#fde68a',
          dot: '#f59e0b',
          label: 'In Progress',
        };
      case 'COMPLETED':
        return {
          bg: '#f0fdf4',
          text: '#166534',
          border: '#bbf7d0',
          dot: '#22c55e',
          label: 'Completed',
        };
      case 'DISMANTLE':
        return {
          bg: '#faf5ff',
          text: '#6b21a8',
          border: '#e9d5ff',
          dot: '#a855f7',
          label: 'Dismantle',
        };
      case 'KEEP_WHOLE':
        return {
          bg: '#f0fdfa',
          text: '#115e59',
          border: '#99f6e4',
          dot: '#14b8a6',
          label: 'Keep Whole',
        };
      default:
        return {
          bg: '#f3f4f6',
          text: '#374151',
          border: '#e5e7eb',
          dot: '#6b7280',
          label: status,
        };
    }
  };

  const config = getBadgeStyle();
  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: 9999,
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.dot,
        }}
      />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
