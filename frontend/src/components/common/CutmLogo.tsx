import React from 'react';

interface CutmLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  alt?: string;
}

export const CutmLogo: React.FC<CutmLogoProps> = ({
  className = '',
  size = 52,
  glow = true,
  alt = 'Centurion University of Technology and Management (CUTM) Logo'
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle Glow Backdrop */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full bg-amber-500/25 blur-lg -z-10 animate-pulse-slow pointer-events-none"
        />
      )}

      {/* Official CUTM Logo Image */}
      <img
        src="/cutm-logo.png"
        alt={alt}
        className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        loading="eager"
      />
    </div>
  );
};
