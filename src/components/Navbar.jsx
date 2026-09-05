import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { themeList } from '../utils/themes';

// SVG Logo ร้านตัดผม — ออกแบบเอง
function BarberLogo({ accentFrom, accentTo, accentText, size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accentFrom} />
          <stop offset="100%" stopColor={accentTo} />
        </linearGradient>
      </defs>

      {/* พื้นหลังกลม */}
      <circle cx="20" cy="20" r="19" fill="url(#logoGrad)" />

      {/* ด้ามกรรไกร (pivot) */}
      <circle cx="20" cy="20" r="2" fill={accentText} opacity="0.9" />

      {/* ใบกรรไกรบน-ซ้าย */}
      <path
        d="M20 20 L9 10"
        stroke={accentText}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* วงกลมจับบน-ซ้าย */}
      <circle cx="7.5" cy="8.5" r="3.5" stroke={accentText} strokeWidth="2" fill="none" />

      {/* ใบกรรไกรบน-ขวา */}
      <path
        d="M20 20 L31 10"
        stroke={accentText}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* วงกลมจับบน-ขวา */}
      <circle cx="32.5" cy="8.5" r="3.5" stroke={accentText} strokeWidth="2" fill="none" />

      {/* ใบมีด (comb line) ล่างซ้าย */}
      <path
        d="M20 20 L11 31"
        stroke={accentText}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* ฟันหวี 4 ซี่ */}
      <line x1="11" y1="31" x2="9"  y2="34" stroke={accentText} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="13" y1="31" x2="11" y2="34" stroke={accentText} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="15" y1="31" x2="13" y2="34" stroke={accentText} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="17" y1="31" x2="15" y2="34" stroke={accentText} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* แท่งโกน (razor) ล่างขวา */}
      <path
        d="M20 20 L29 31"
        stroke={accentText}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect
        x="27" y="30" width="7" height="3.5" rx="1"
        fill={accentText}
        opacity="0.75"
        transform="rotate(40 30.5 31.75)"
      />
    </svg>
  );
}

export default function Navbar({ viewMode, setViewMode, theme, setTheme }) {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const t = theme;

  const categories = [...new Set(themeList.map(th => th.category))];

  return (
    <>
      <nav
        style={{ backgroundColor: t.navBg, borderBottomColor: t.navBorder }}
        className="border-b sticky top-0 z-40"
      >
        <div style={{ background: t.navTopLine }} className="h-[2px]" />

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* SVG Logo พร้อม glow */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-lg opacity-50"
                style={{ backgroundColor: t.accent }}
              />
              <div className="relative drop-shadow-lg">
                <BarberLogo
                  accentFrom={t.accentFrom}
                  accentTo={t.accentTo}
                  accentText={t.accentText}
                  size={38}
                />
              </div>
            </div>

            {/* ชื่อร้าน */}
            <div>
              <h1
                className="font-display font-black tracking-widest leading-none text-lg sm:text-2xl"
                style={{
                  background: `linear-gradient(90deg, ${t.accentFrom}, ${t.accentTo})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BRAVO CUT
              </h1>
              <p
                className="text-[10px] tracking-[0.25em] uppercase mt-0.5"
                style={{ color: t.navSubtitle }}
              >
                Premium Barber Shop
              </p>
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* ปุ่มเปลี่ยนธีม */}
            <button
              onClick={() => setShowThemePicker(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: `${t.accent}18`,
                borderColor: `${t.accent}40`,
                color: t.accent,
              }}
            >
              <Palette size={13} />
              <span className="hidden sm:inline">{t.emoji} {t.name}</span>
            </button>

            {/* Toggle โหมด */}
            <div
              className="flex rounded-lg p-0.5 gap-0.5 border"
              style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder }}
            >
              {[
                { mode: 'customer', label: 'ลูกค้า' },
                { mode: 'barber',   label: 'ช่าง'   },
              ].map(({ mode, label }) => {
                const active = viewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap"
                    style={
                      active
                        ? {
                            background: `linear-gradient(90deg, ${t.accentFrom}, ${t.accentTo})`,
                            color: t.accentText,
                            boxShadow: `0 2px 8px ${t.accentShadow}`,
                          }
                        : { color: t.pageText + '70' }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Theme Picker Modal ── */}
      {showThemePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl"
            style={{
              backgroundColor: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* drag handle mobile */}
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden"
              style={{ backgroundColor: t.pageText + '30' }}
            />

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Palette size={16} style={{ color: t.accent }} />
                <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: t.pageText }}>
                  เลือกสไตล์ร้าน
                </h2>
              </div>
              <button
                onClick={() => setShowThemePicker(false)}
                className="p-1.5 rounded-lg hover:opacity-60"
                style={{ color: t.pageText }}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: t.pageText + '50' }}>
              เลือกแนวธีมที่ตรงกับสไตล์ร้านของคุณ
            </p>
            <div className="h-px mb-4" style={{ background: t.dividerLine }} />

            <div className="space-y-5">
              {categories.map(cat => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>
                      {cat}
                    </span>
                    <div className="flex-1 h-px" style={{ background: `${t.accent}30` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {themeList.filter(th => th.category === cat).map(th => {
                      const isActive = theme.id === th.id;
                      return (
                        <button
                          key={th.id}
                          onClick={() => { setTheme(th); setShowThemePicker(false); }}
                          className="relative rounded-xl p-2.5 text-left transition-all duration-200 active:scale-95"
                          style={{
                            backgroundColor: th.cardBg,
                            border: isActive
                              ? `2px solid ${th.accent}`
                              : `1px solid ${th.cardBorder}`,
                            boxShadow: isActive
                              ? `0 0 0 1px ${th.accent}40, 0 4px 16px rgba(0,0,0,0.4)`
                              : th.cardGlow,
                          }}
                        >
                          {/* แถบสี accent */}
                          <div
                            className="w-full h-1.5 rounded-full mb-2"
                            style={{ background: `linear-gradient(90deg, ${th.accentFrom}, ${th.accentTo})` }}
                          />
                          {/* preview dots */}
                          <div className="flex gap-1 mb-2">
                            <div className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: th.pageBg, border: `1px solid ${th.cardBorder}` }} />
                            <div className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }} />
                            <div className="w-3.5 h-3.5 rounded-full"
                              style={{ background: `linear-gradient(135deg, ${th.accentFrom}, ${th.accentTo})` }} />
                          </div>
                          <div className="text-sm leading-none mb-0.5">{th.emoji}</div>
                          <div className="text-[11px] font-bold leading-tight" style={{ color: th.pageText }}>{th.name}</div>
                          <div className="text-[10px] mt-0.5 leading-tight" style={{ color: th.pageText + '70' }}>{th.desc}</div>

                          {isActive && (
                            <div
                              className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{ backgroundColor: th.accent, color: th.accentText }}
                            >✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
