import React, { useRef, useState } from 'react';
import { Check, ImagePlus, Link2, RotateCcw, User } from 'lucide-react';
import { THEMES } from '../themes';
import { ThemeId } from '../types';
import {
  CustomBannerState,
  DEFAULT_BANNER_STATE,
  fileToBannerDataUrl,
  THEME_ARTWORK,
} from '../utils/bannerStorage';

interface SettingsPageProps {
  userName: string;
  onChangeUserName: (name: string) => void;
  theme: ThemeId;
  onChangeTheme: (id: ThemeId) => void;
  banner: CustomBannerState;
  onChangeBanner: (next: CustomBannerState) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userName,
  onChangeUserName,
  theme,
  onChangeTheme,
  banner,
  onChangeBanner,
}) => {
  const [nameDraft, setNameDraft] = useState(userName);
  const [nameSaved, setNameSaved] = useState(false);

  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameDraft.trim();
    onChangeUserName(cleaned);
    setNameDraft(cleaned);
    setNameSaved(true);
    window.setTimeout(() => setNameSaved(false), 2000);
  };

  const handleFile = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await fileToBannerDataUrl(file);
      onChangeBanner({
        ...banner,
        mode: 'custom',
        src: dataUrl,
      });
      setUrlError('');
    } catch {
      setUrlError('Could not load that image file.');
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Please paste an image URL.');
      return;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:' && parsed.protocol !== 'data:') {
        setUrlError('Please enter a valid http(s) image URL.');
        return;
      }
    } catch {
      setUrlError('Please enter a valid image URL.');
      return;
    }

    onChangeBanner({
      ...banner,
      mode: 'custom',
      src: trimmed,
    });
    setUrlInput('');
    setUrlError('');
  };

  const handleSelectPreset = (presetTheme: ThemeId) => {
    onChangeBanner({
      ...banner,
      mode: 'custom',
      src: THEME_ARTWORK[presetTheme].src,
    });
  };

  const handleResetThemeArt = () => {
    onChangeBanner({
      ...DEFAULT_BANNER_STATE,
      mode: 'theme',
    });
  };

  const previewArtwork = THEME_ARTWORK[theme] || THEME_ARTWORK.ivory;
  const previewSrc = banner.mode === 'custom' && banner.src ? banner.src : previewArtwork.src;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Personalize your name, pastel color theme, and dashboard cover image.
        </p>
      </div>

      {/* Profile / Name Section */}
      <section
        aria-labelledby="settings-profile-heading"
        className="rounded-2xl border p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-hairline)]">
          <User className="h-4 w-4 text-[var(--accent-primary)]" />
          <h3 id="settings-profile-heading" className="text-base font-semibold text-[var(--text-primary)]">
            Your Name
          </h3>
        </div>

        <form onSubmit={handleSaveName} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label
              htmlFor="settings-user-name"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Name shown in your welcome greeting
            </label>
            <input
              id="settings-user-name"
              type="text"
              value={nameDraft}
              onChange={(e) => {
                setNameDraft(e.target.value);
                if (nameSaved) setNameSaved(false);
              }}
              placeholder="Enter your name..."
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {nameSaved && <Check className="h-4 w-4" />}
            <span>{nameSaved ? 'Saved' : 'Save Name'}</span>
          </button>
        </form>
      </section>

      {/* Pastel Theme Palette Section */}
      <section
        aria-labelledby="settings-palette-heading"
        className="rounded-2xl border p-5 sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="pb-4 border-b border-[var(--border-hairline)]">
          <h3 id="settings-palette-heading" className="text-base font-semibold text-[var(--text-primary)]">
            Pastel Color Theme
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Choose the overall palette for your planner surfaces and accents.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(THEMES).map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTheme(item.id)}
                className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors hover:bg-[var(--bg-canvas)]"
                style={{
                  backgroundColor: active ? 'var(--bg-subtle)' : 'var(--bg-canvas)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-hairline)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex items-center -space-x-1 shrink-0">
                    {item.swatch.map((hex, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.name}
                  </span>
                </div>
                {active && <Check className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Theme Image Upload & Options Section */}
      <section
        aria-labelledby="settings-theme-image-heading"
        className="rounded-2xl border p-5 sm:p-6 space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h3
              id="settings-theme-image-heading"
              className="text-base font-semibold text-[var(--text-primary)]"
            >
              Dashboard Theme Image
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Upload any photo or GIF, paste an image link, or choose a preset illustration for the top of your dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetThemeArt}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)] whitespace-nowrap"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Auto Theme</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload theme image"
          onChange={(e) => {
            const file = e.target.files?.[0];
            void handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Live Preview & Dropzone */}
          <div className="lg:col-span-6 space-y-3">
            <div
              className="relative h-52 overflow-hidden rounded-2xl border transition-colors"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-hairline)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                void handleFile(file);
              }}
            >
              <img
                src={previewSrc}
                alt="Dashboard theme preview"
                referrerPolicy="no-referrer"
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
                }}
              />
              {dragActive && (
                <div
                  className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                  }}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Drop image here
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)]"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <ImagePlus className="h-4 w-4 text-[var(--accent-primary)]" />
              <span>Choose Image or GIF from Device</span>
            </button>
          </div>

          {/* URL, Fit, Crop, and Presets */}
          <div className="lg:col-span-6 space-y-4">
            <form onSubmit={handleApplyUrl} className="space-y-1.5">
              <label
                htmlFor="settings-banner-url"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Or paste an image URL
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center rounded-xl border px-3 py-2"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: urlError ? 'var(--rose)' : 'var(--border-hairline)',
                  }}
                >
                  <Link2 className="h-4 w-4 text-[var(--text-muted)] mr-2 shrink-0" />
                  <input
                    id="settings-banner-url"
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (urlError) setUrlError('');
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 text-xs font-medium text-white shrink-0"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Apply
                </button>
              </div>
              {urlError && (
                <p className="text-xs" style={{ color: 'var(--rose)' }}>
                  {urlError}
                </p>
              )}
            </form>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Image Fit
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['cover', 'contain'] as const).map((fitMode) => (
                    <button
                      key={fitMode}
                      type="button"
                      onClick={() => onChangeBanner({ ...banner, fit: fitMode })}
                      className="rounded-xl border px-2.5 py-2 text-xs font-medium"
                      style={{
                        backgroundColor:
                          banner.fit === fitMode ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                        borderColor:
                          banner.fit === fitMode
                            ? 'var(--accent-primary)'
                            : 'var(--border-hairline)',
                      }}
                    >
                      {fitMode === 'cover' ? 'Fill' : 'Fit Whole'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Crop Focus
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => onChangeBanner({ ...banner, position: pos })}
                      className="rounded-xl border px-2 py-2 text-xs font-medium capitalize"
                      style={{
                        backgroundColor:
                          banner.position === pos ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                        borderColor:
                          banner.position === pos
                            ? 'var(--accent-primary)'
                            : 'var(--border-hairline)',
                      }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                Included Theme Artwork
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(THEME_ARTWORK) as ThemeId[]).map((tid) => {
                  const active =
                    (banner.mode === 'theme' && theme === tid) ||
                    (banner.mode === 'custom' && banner.src === THEME_ARTWORK[tid].src);
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => handleSelectPreset(tid)}
                      className="group relative aspect-video overflow-hidden rounded-xl border transition-transform hover:scale-[1.03]"
                      style={{
                        borderColor: active
                          ? 'var(--accent-primary)'
                          : 'var(--border-hairline)',
                      }}
                      title={THEME_ARTWORK[tid].label}
                    >
                      <img
                        src={THEME_ARTWORK[tid].src}
                        alt={THEME_ARTWORK[tid].label}
                        className="h-full w-full object-cover"
                      />
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Check className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
