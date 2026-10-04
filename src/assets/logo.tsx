import React from 'react';
import logoIconUrl from './Logo-icon.png';
import logoFullUrl from './Logo.png';
import mascotUrl from './Cute-Gold-Coin-Happy.png';

export { logoIconUrl, logoFullUrl, mascotUrl };

/**
 * Official Logo Assets for จดตังค์ (JODTANG)
 * Strict enforcement of user requirements:
 * - Left icon: "Logo-icon.png"
 * - Full logo: "Logo.png"
 */
export const JT_ICON = logoIconUrl || '/Logo-icon.png';
export const JT_LOGO = logoFullUrl || '/Logo.png';

/**
 * Jodtang3DIcon
 * Directly renders the official "Logo-icon.png"
 */
export const Jodtang3DIcon: React.FC<{
  className?: string;
  size?: number | string;
}> = ({ className = '', size = '100%' }) => {
  return (
    <div 
      style={{ width: size, height: size }} 
      className={`shrink-0 select-none inline-flex items-center justify-center ${className}`}
    >
      <img
        src={logoIconUrl}
        alt="Logo-icon.png"
        className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/Logo-icon.png';
        }}
      />
    </div>
  );
};

/**
 * BrandLogo Component
 * Strictly guarantees the left icon is "Logo-icon.png" without change,
 * and displays "จดตังค์ JODTANG" matching "Logo.png".
 */
export const BrandLogo: React.FC<{
  mode?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ mode = 'full', size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const subTextSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-xs tracking-[0.25em]',
    lg: 'text-sm tracking-[0.3em]',
    xl: 'text-base tracking-[0.35em]',
  };

  if (mode === 'icon') {
    return (
      <div className={`${iconSizes[size]} shrink-0 ${className}`}>
        <img 
          src={logoIconUrl} 
          alt="Logo-icon.png" 
          className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/Logo-icon.png';
          }}
        />
      </div>
    );
  }

  // Full brand lockup: 3D Icon on the left (Logo-icon.png) + "จดตังค์ JODTANG"
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official 3D Icon on Left: Logo-icon.png */}
      <div className={`${iconSizes[size]} shrink-0 drop-shadow-sm`}>
        <img 
          src={logoIconUrl} 
          alt="Logo-icon.png" 
          className="w-full h-full object-contain pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/Logo-icon.png';
          }}
        />
      </div>

      {/* Brand Typography matching Logo.png */}
      <div className="flex flex-col justify-center leading-none">
        <div className="relative inline-block">
          <span className={`font-black text-[#133F2E] ${textSizes[size]} tracking-tight font-['IBM_Plex_Sans_Thai',sans-serif]`}>
            จดตังค์
          </span>
          {/* Trademark Golden Sprout Leaves over 'ค์' */}
          <span className="absolute -top-1.5 -right-3 flex items-center pointer-events-none">
            <svg width="14" height="12" viewBox="0 0 16 14" fill="none">
              <path d="M4 12C3 6 7 2 11 1C11 5 8 10 4 12Z" fill="#F4D35E" stroke="#D69E2E" strokeWidth="1.2" />
              <path d="M10 13C9 8 12 5 15 5C15 8 13 11 10 13Z" fill="#F6E05E" stroke="#D69E2E" strokeWidth="1.2" />
            </svg>
          </span>
        </div>
        <span className={`font-extrabold text-[#252525] uppercase mt-1 font-['Plus_Jakarta_Sans',sans-serif] ${subTextSizes[size]}`}>
          JODTANG
        </span>
      </div>
    </div>
  );
};

// Nong Tang (น้องตังค์) mascot illustration component using Cute Gold Coin - Happy.png
export const NongTangMascot = ({ className = 'w-16 h-16' }: { className?: string }) => (
  <div className={`shrink-0 flex items-center justify-center ${className}`}>
    <img 
      src={mascotUrl || '/Cute-Gold-Coin-Happy.png'} 
      alt="น้องตังค์" 
      className="w-full h-full object-contain hover:scale-110 transition-transform drop-shadow-md pointer-events-none select-none"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/mascot.png';
      }}
    />
  </div>
);
