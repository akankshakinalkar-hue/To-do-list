import { ThemeId } from '../types';

export const THEME_ARTWORK: Record<ThemeId, { src: string; alt: string; label: string }> = {
  ivory: {
    src: '/src/assets/images/theme_warm_linen_1795510522380.jpg',
    alt: 'Warm linen sunlit desk with iced coffee, open paper journal, and sage plant',
    label: 'Warm Linen',
  },
  sage: {
    src: '/src/assets/images/theme_meadow_sage_1795510522105.jpg',
    alt: 'Meadow sage windowsill with eucalyptus vase, matcha latte, and sketchbook',
    label: 'Meadow Sage',
  },
  rose: {
    src: '/src/assets/images/theme_dusty_rose_1795510523485.jpg',
    alt: 'Dusty rose flowers beside a blush notebook and warm ceramic teacup',
    label: 'Dusty Rose',
  },
  peach: {
    src: '/src/assets/images/theme_soft_apricot_1795510523576.jpg',
    alt: 'Soft apricot reading nook with peach blossoms, warm tea, and linen planner',
    label: 'Soft Apricot',
  },
};

export interface CustomBannerState {
  mode: 'theme' | 'custom';
  src: string;
  fit: 'cover' | 'contain';
  position: 'center' | 'top' | 'bottom';
}

export const DEFAULT_BANNER_STATE: CustomBannerState = {
  mode: 'theme',
  src: '',
  fit: 'cover',
  position: 'center',
};

const CUSTOM_BANNER_STORAGE_KEY = 'my_tasks_custom_theme_banner_v2';
const LEGACY_BANNER_KEY = 'my_tasks_custom_theme_banner_v1';
const USER_NAME_STORAGE_KEY = 'my_tasks_user_name_v1';

export function loadBannerState(): CustomBannerState {
  try {
    const raw = localStorage.getItem(CUSTOM_BANNER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CustomBannerState> & { mode?: string };
      return {
        mode: parsed.mode === 'custom' && parsed.src ? 'custom' : 'theme',
        src: parsed.src || '',
        fit: parsed.fit === 'contain' ? 'contain' : 'cover',
        position:
          parsed.position === 'top' || parsed.position === 'bottom'
            ? parsed.position
            : 'center',
      };
    }
    const legacy = localStorage.getItem(LEGACY_BANNER_KEY);
    if (legacy) {
      return { ...DEFAULT_BANNER_STATE, mode: 'custom', src: legacy };
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_BANNER_STATE;
}

export function saveBannerState(state: CustomBannerState): boolean {
  try {
    localStorage.setItem(CUSTOM_BANNER_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadUserName(): string {
  try {
    return localStorage.getItem(USER_NAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveUserName(name: string): void {
  try {
    localStorage.setItem(USER_NAME_STORAGE_KEY, name);
  } catch {
    // Ignore storage errors
  }
}

export function fileToBannerDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type === 'image/gif' || file.size <= 350 * 1024) {
        resolve(result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1080;
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
