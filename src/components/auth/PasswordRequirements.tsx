import React from 'react';
import { validatePassword } from '../../utils/passwordValidator';
import { Check } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const { checks } = validatePassword(password);
  const hasInput = password.length > 0;

  const items = [
    { label: '8+ chars', valid: checks.minLength },
    { label: 'A-Z', valid: checks.hasUppercase },
    { label: 'a-z', valid: checks.hasLowercase },
    { label: '0-9', valid: checks.hasNumber },
    { label: 'Special (@#$%)', valid: checks.hasSpecial },
    { label: 'No spaces allowed', valid: hasInput ? checks.noSpaces : false },
  ];

  return (
    <div
      style={{
        marginTop: 6,
        padding: '8px 10px',
        backgroundColor: '#faf9fd',
        borderRadius: 8,
        border: '1px solid #eeeaf6',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#656375',
          marginBottom: 6,
        }}
      >
        <span>Password Requirements:</span>
        {hasInput && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: !checks.notWeak
                ? '#d97706'
                : password.length >= 15
                ? '#059669'
                : password.length >= 12
                ? '#16a34a'
                : '#7c3aed',
              textTransform: 'none',
            }}
          >
            {!checks.notWeak
              ? 'Weak password'
              : password.length >= 15
              ? 'Strength: Excellent (15+ chars)'
              : password.length >= 12
              ? 'Strength: Strong (12+ chars)'
              : 'Strength: Good (8+ chars)'}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 6px',
        }}
      >
        {items.map((item, idx) => {
          const isMet = hasInput && item.valid;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 4,
                backgroundColor: isMet ? '#dcfce7' : '#f3f4f6',
                color: isMet ? '#15803d' : '#6b7280',
                fontWeight: isMet ? 600 : 500,
                border: isMet ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                transition: 'all 0.15s ease',
              }}
            >
              <Check
                size={11}
                strokeWidth={isMet ? 3 : 2}
                style={{ color: isMet ? '#16a34a' : '#9ca3af', flexShrink: 0 }}
              />
              <span>{item.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
