import React, { useState } from 'react';
import { Scissors, Palette, X } from 'lucide-react';
import { themeList } from '../utils/themes';

export default function Navbar({ viewMode, setViewMode, theme, setTheme }) {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const t = theme;

  return (
    <>
      <nav style={{ backgroundColor: t.navBg, borderBottomColor: t.navBorder }}
        className="border-b sticky top-0 z-40">
        {/* เส้น accent บนสุด */}
        <div style={{ background: t.navTopLine }} className="h-[2px]" />

        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-md opacity-40"
                style={{ backgroundColor: t.accent }} />
              <div className="relative p-2 rounded-lg text-black shadow-lg"
                style={{ background: `linear-gradient(135deg, ${t.accentFrom}, ${t.accentTo})` }}>
                <Scissors size={20} strokeWidth={2.5} style={{ color: t.accentText }} />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-black tracking-widest leading-none"
                style={{ background: `linear-gradient(90deg,${t.accentFrom},${t.accentTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                BRAVO CUT
              </h1>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: t.navSubtitle }}>
                Premium Barber Shop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ปุ่มเปลี่ยนธีม */}
            <button
              onClick={() => setShowThemePicker(true)}
              title="เปลี่ยนธีม"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 hover:opacity-80"
              style={{ backgroundColor: `${t.accent}18`, borderColor: `${t.accent}40`, color: t.accent }}
            >
              <Palette size={14} />
              <span className="hidden sm:inline">{t.emoji} {t.name}</span>
            </button>

            {/* Toggle โหมด */}
            <div className="flex rounded-lg p-1 gap-1 border"
              style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder }}>
              {['customer', 'barber'].map((mode) => {
                const active = viewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                    style={active
                      ? { background: `linear-gradient(90deg,${t.accentFrom},${t.accentTo})`, color: t.accentText, boxShadow: `0 2px 8px ${t.accentShadow}` }
                      : { color: t.pageText + '70' }
                    }
                  >
                    {mode === 'customer' ? 'โหมดลูกค้า' : 'โหมดช่าง'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Theme Picker Modal */}
      {showThemePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: t.cardBg, border: `1px solid ${t.cardBorder}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Palette size={18} style={{ color: t.accent }} />
                <h2 className="font-display text-lg font-bold" style={{ color: t.pageText }}>
                  เลือกธีม
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${t.accent}20`, color: t.accent }}>
                  {themeList.length} ธีม
                </span>
              </div>
              <button onClick={() => setShowThemePicker(false)}
                className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
                style={{ color: t.pageText }}>
                <X size={18} />
              </button>
            </div>

            {/* divider */}
            <div className="h-px mb-5" style={{ background: t.dividerLine }} />

            {/* Grid ธีม */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {themeList.map((th) => {
                const isActive = theme.id === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => { setTheme(th); setShowThemePicker(false); }}
                    className="relative rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.03] active:scale-95"
                    style={{
                      backgroundColor: th.cardBg,
                      border: isActive
                        ? `2px solid ${th.accent}`
                        : `1px solid ${th.cardBorder}`,
                      boxShadow: isActive ? th.cardGlowHover : th.cardGlow,
                    }}
                  >
                    {/* Preview สี */}
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-6 h-6 rounded-full shadow-inner"
                        style={{ background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})` }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }} />
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}` }} />
                    </div>

                    <div className="text-lg mb-0.5">{th.emoji}</div>
                    <div className="text-sm font-bold" style={{ color: th.pageText }}>{th.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: th.pageText + '70' }}>{th.desc}</div>

                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: th.accent, color: th.accentText }}>
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
