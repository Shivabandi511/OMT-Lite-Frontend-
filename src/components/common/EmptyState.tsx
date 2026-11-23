import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ icon: Icon = Inbox, title, description, actionText, onAction, actionIcon: ActionIcon }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#faf9fd',
          borderRadius: 12,
          border: '1.5px dashed var(--omt-color-border)',
          margin: '16px 0',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#efe7ff',
            color: 'var(--omt-color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Icon size={28} />
        </div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--omt-color-text-main)',
            marginBottom: 6,
            fontFamily: 'var(--omt-font-display)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: 'var(--omt-color-text-muted)',
            maxWidth: 420,
            lineHeight: 1.5,
            marginBottom: actionText && onAction ? 18 : 0,
          }}
        >
          {description}
        </p>
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="btn-primary"
            style={{ fontSize: 13, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {ActionIcon && <ActionIcon size={15} />}
            <span>{actionText}</span>
          </button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
