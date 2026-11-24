import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeId } from '../types';
import { CustomBannerState, THEME_ARTWORK } from '../utils/bannerStorage';

interface ThemeBannerCardProps {
  theme: ThemeId;
  banner: CustomBannerState;
}

export const ThemeBannerCard: React.FC<ThemeBannerCardProps> = ({ theme, banner }) => {
  const [imgError, setImgError] = useState(false);

  const artwork = THEME_ARTWORK[theme] || THEME_ARTWORK.ivory;
  const displaySrc = banner.mode === 'custom' && banner.src ? banner.src : artwork.src;
  const displayAlt = banner.mode === 'custom' ? 'Dashboard theme image' : artwork.alt;

  useEffect(() => {
    setImgError(false);
  }, [theme, banner.src, banner.mode]);

  return (
    <div
      className="relative h-[165px] sm:h-[185px] lg:h-[205px] w-full overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      {!imgError ? (
        <img
          src={displaySrc}
          alt={displayAlt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`h-full w-full ${
            banner.fit === 'contain' ? 'object-contain p-2' : 'object-cover'
          }`}
          style={{
            objectPosition:
              banner.position === 'top'
                ? 'center top'
                : banner.position === 'bottom'
                  ? 'center bottom'
                  : 'center center',
            backgroundColor: banner.fit === 'contain' ? 'var(--bg-canvas)' : undefined,
          }}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center p-6 text-center"
          style={{
            background:
              'linear-gradient(135deg, var(--bg-subtle) 0%, var(--peach-soft) 50%, var(--sage-soft) 100%)',
          }}
        >
          <Sparkles className="h-6 w-6 text-[var(--accent-primary)] mb-2" />
          <p className="text-sm font-medium text-[var(--text-primary)]">{artwork.label}</p>
        </div>
      )}
    </div>
  );
};
