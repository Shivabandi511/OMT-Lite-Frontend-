import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#efe7ff',
          color: 'var(--omt-color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <AlertTriangle size={32} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--omt-font-display)',
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--omt-color-text-main)',
          marginBottom: 8,
        }}
      >
        404 – Page Not Found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--omt-color-text-muted)', maxWidth: 420, marginBottom: 24, lineHeight: 1.5 }}>
        The page you are looking for does not exist in the OMT Lite Platform or has been relocated.
      </p>

      <Link to="/dashboard" className="btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

