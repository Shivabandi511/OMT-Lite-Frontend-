import React from 'react';

interface OmtLogoLoaderProps {
  fullScreen?: boolean;
  overlay?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OmtLogoLoader: React.FC<OmtLogoLoaderProps> = ({
  fullScreen = false,
  overlay = false,
  text = 'Loading...',
  size = 'md',
}) => {
  const dimensions = {
    sm: { svgWidth: 44, svgHeight: 34, fontSize: 11, ringSize: 64 },
    md: { svgWidth: 68, svgHeight: 52, fontSize: 13, ringSize: 96 },
    lg: { svgWidth: 92, svgHeight: 70, fontSize: 15, ringSize: 130 },
  }[size];

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        userSelect: 'none',
      }}
    >
      {/* Animated OMT Emblem with orbital rings and pulse glow */}
      <div
        style={{
          position: 'relative',
          width: dimensions.ringSize,
          height: dimensions.ringSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient Pulsing Glow Halo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(134, 51, 243, 0.45) 0%, rgba(134, 51, 243, 0.05) 65%, transparent 75%)',
            animation: 'omt-glow-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Outer Orbit Spinning Dashed Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            border: '2px dashed rgba(168, 85, 247, 0.55)',
            borderTopColor: '#c084fc',
            borderRightColor: 'transparent',
            animation: 'omt-spin 3s linear infinite',
          }}
        />

        {/* Middle Counter-Rotating Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '2px solid rgba(134, 51, 243, 0.25)',
            borderLeftColor: '#8633f3',
            animation: 'omt-spin-reverse 2.2s linear infinite',
          }}
        />

        {/* Center Logo Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'omt-logo-breathe 2.4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 12px rgba(134, 51, 243, 0.65))',
          }}
        >
          <svg
            width={dimensions.svgWidth}
            height={dimensions.svgHeight}
            viewBox="0 0 46 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed lines on left with staggered animation */}
            <line
              x1="2"
              y1="9"
              x2="15"
              y2="9"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="omt-loader-line1"
            />
            <line
              x1="0"
              y1="17"
              x2="18"
              y2="17"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="omt-loader-line2"
            />
            <line
              x1="4"
              y1="25"
              x2="15"
              y2="25"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="omt-loader-line3"
            />

            {/* Orbit / Gear Outer Circle */}
            <circle
              cx="29"
              cy="17"
              r="12"
              stroke="#a855f7"
              strokeWidth="3.2"
              fill="#181328"
            />

            {/* Glowing Center Hub */}
            <circle
              cx="29"
              cy="17"
              r="5.5"
              fill="#c084fc"
            />

            {/* Surrounding orbital notches/rays */}
            <path
              d="M29 3V7M29 27V31M15 17H19M39 17H43M19 7L22 10M36 24L39 27M19 27L22 24M36 10L39 7"
              stroke="#a855f7"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Inner "OMT" lettering in center */}
            <text
              x="29"
              y="19.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="5.5"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="0.5"
            >
              OMT
            </text>
          </svg>
        </div>
      </div>

      {/* Loading Label with subtle purple gradient shimmer */}
      {text && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: dimensions.fontSize,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #8633f3 0%, #c084fc 50%, #8633f3 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'omt-text-shimmer 2.2s linear infinite',
            }}
          >
            {text}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#8e8d9c',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}
          >
            OMT Platform
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(15, 13, 30, 0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'omt-fade-in 0.2s ease-out',
        }}
      >
        <div
          style={{
            padding: '36px 48px',
            backgroundColor: '#1b142e',
            borderRadius: 20,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.5), 0 0 32px rgba(134, 51, 243, 0.25)',
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          borderRadius: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'omt-fade-in 0.15s ease-out',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
