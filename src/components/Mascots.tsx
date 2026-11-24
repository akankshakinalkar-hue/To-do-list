import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface MascotProps {
  className?: string;
  size?: number;
}

interface StrawberryMascotProps extends MascotProps {
  celebrating?: boolean;
  popTrigger?: number;
}

const STRAWBERRY_SRC = '/assets/aistudio/download__17__35e420ab.jpg';
const CAT_SRC = '/assets/aistudio/download__16__a4b77093.jpg';

const processedCache = new Map<string, string>();
const inFlightCache = new Map<string, Promise<string>>();

/**
 * Flood-fills exterior near-white pixels from image borders to create a clean
 * transparent PNG data URL and crops excess transparent padding.
 */
function removeWhiteBackgroundAndCrop(src: string): Promise<string> {
  const cached = processedCache.get(src);
  if (cached) return Promise.resolve(cached);

  const existingPromise = inFlightCache.get(src);
  if (existingPromise) return existingPromise;

  const promise = new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 320;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isNearWhite = (idx: number, threshold: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          return r >= threshold && g >= threshold && b >= threshold;
        };

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const enqueueIfBg = (x: number, y: number) => {
          const p = y * w + x;
          if (visited[p]) return;
          if (isNearWhite(p * 4, 228)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < w; x++) {
          enqueueIfBg(x, 0);
          enqueueIfBg(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueueIfBg(0, y);
          enqueueIfBg(w - 1, y);
        }

        while (head < tail) {
          const p = queue[head++];
          const x = p % w;
          const y = (p - x) / w;

          data[p * 4 + 3] = 0;

          if (x > 0) enqueueIfBg(x - 1, y);
          if (x < w - 1) enqueueIfBg(x + 1, y);
          if (y > 0) enqueueIfBg(x, y - 1);
          if (y < h - 1) enqueueIfBg(x, y + 1);
        }

        // Soften anti-aliased edge pixels touching the removed background
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            if (visited[p]) continue;
            const touchesBg =
              visited[p - 1] || visited[p + 1] || visited[p - w] || visited[p + w];
            if (!touchesBg) continue;
            const idx = p * 4;
            const minChannel = Math.min(data[idx], data[idx + 1], data[idx + 2]);
            if (minChannel > 205) {
              const alphaFactor = Math.max(0, Math.min(1, (240 - minChannel) / 35));
              data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Compute tight bounding box around non-transparent pixels
        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 16) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX <= minX || maxY <= minY) {
          resolve(src);
          return;
        }

        const pad = 4;
        const cx = Math.max(0, minX - pad);
        const cy = Math.max(0, minY - pad);
        const cw = Math.min(w - cx, maxX - minX + 1 + pad * 2);
        const ch = Math.min(h - cy, maxY - minY + 1 + pad * 2);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = cw;
        outCanvas.height = ch;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          resolve(src);
          return;
        }
        outCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

        const dataUrl = outCanvas.toDataURL('image/png');
        processedCache.set(src, dataUrl);
        resolve(dataUrl);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

  inFlightCache.set(src, promise);
  return promise;
}

const TransparentIllustration: React.FC<{
  src: string;
  alt: string;
  size: number;
  className?: string;
}> = ({ src, alt, size, className = '' }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => processedCache.get(src) || src);
  const isProcessed = resolvedSrc.startsWith('data:');

  useEffect(() => {
    let active = true;
    removeWhiteBackgroundAndCrop(src).then((url) => {
      if (active) setResolvedSrc(url);
    });
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={false}
      style={{ width: size, height: size }}
      className={`object-contain select-none pointer-events-none ${
        isProcessed ? '' : 'mix-blend-multiply'
      } ${className}`}
    />
  );
};

/**
 * Cute warm-brown coffee cup mascot with gentle bobbing, tilt, and rising steam.
 */
export const CoffeeMascot: React.FC<MascotProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <g className="mascot-steam-1">
          <path
            d="M31 20 C29 15, 34 12, 32 7"
            stroke="#B6A596"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g className="mascot-steam-2">
          <path
            d="M44 19 C46 14, 41 11, 44 6"
            stroke="#C7B7A8"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        <g className="mascot-coffee-body">
          <ellipse cx="38" cy="70" rx="18" ry="3.5" fill="#35302C" fillOpacity="0.08" />
          <path
            d="M54 36 C63 36, 65 49, 53 51"
            stroke="#8B6347"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M54 36 C61.5 36, 63 47.5, 53 49.5"
            stroke="#A4795A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M19 30 H57 L53 58 C52.2 63.5 47.5 67 41.5 67 H34.5 C28.5 67 23.8 63.5 23 58 L19 30 Z"
            fill="#A67C5B"
            stroke="#4A3526"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M24 35 L26.5 56"
            stroke="#C39B7B"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.65"
          />
          <ellipse
            cx="38"
            cy="30"
            rx="19.5"
            ry="5.5"
            fill="#F7EFE4"
            stroke="#4A3526"
            strokeWidth="2.8"
          />
          <ellipse cx="38" cy="30" rx="14.5" ry="3" fill="#D5B89C" />
          <circle cx="31.5" cy="46.5" r="2.3" fill="#32241B" />
          <circle cx="44.5" cy="46.5" r="2.3" fill="#32241B" />
          <ellipse cx="27.5" cy="50" rx="2.7" ry="1.5" fill="#E39798" opacity="0.75" />
          <ellipse cx="48.5" cy="50" rx="2.7" ry="1.5" fill="#E39798" opacity="0.75" />
          <path
            d="M35.5 49.5 C36.6 51.3, 39.4 51.3, 40.5 49.5"
            stroke="#32241B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Uploaded Strawberry illustration with transparent background, gentle bounce/wiggle, and completion pop.
 */
export const StrawberryMascot: React.FC<StrawberryMascotProps> = ({
  className = '',
  size = 32,
  celebrating = false,
  popTrigger = 0,
}) => {
  return (
    <motion.div
      key={popTrigger}
      initial={popTrigger > 0 ? { scale: 0.9, y: 2 } : false}
      animate={
        popTrigger > 0
          ? { scale: [0.92, 1.1, 0.98, 1], y: [2, -4, 0] }
          : { scale: 1, y: 0 }
      }
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className={
          celebrating ? 'mascot-strawberry-celebrate' : 'mascot-strawberry-idle'
        }
      >
        <TransparentIllustration
          src={STRAWBERRY_SRC}
          alt="Strawberry mascot"
          size={size}
        />
      </div>
    </motion.div>
  );
};

/**
 * Uploaded Black Cat illustration with transparent background and gentle idle float & sway.
 */
export const CatMascot: React.FC<MascotProps> = ({ className = '', size = 34 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="mascot-cat-idle">
        <TransparentIllustration
          src={CAT_SRC}
          alt="Black cat mascot"
          size={size}
        />
      </div>
    </div>
  );
};
