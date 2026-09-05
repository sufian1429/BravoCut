import React, { useState, useRef, useEffect } from 'react';
import { User, Clock, Volume2, UserPlus, Info, Globe, ChevronDown, AlertTriangle, CalendarClock } from 'lucide-react';
import { locales } from '../utils/locales';
import {
  isShopOpen,
  isNearClose,
  nextOpenDate,
  formatNextDay,
  barberAcceptsNearClose,
} from '../utils/shopHours';

export default function CustomerView({ barbers, onBook, theme }) {
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [lang, setLang]                     = useState('th');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef = useRef(null);

  const t  = locales[lang];
  const th = theme;

  // คำนวณ state เวลา (re-evaluate ทุก render — component เล็กพอ)
  const now        = new Date();
  const shopOpen   = isShopOpen(now);
  const nearClose  = isNearClose(now);
  const nextDay    = nextOpenDate(now);
  const nextDayStr = formatNextDay(nextDay, t.locale);

  // ช่างที่ถูก disable ในช่วง near-close
  const barberDisabled = (barber) => nearClose && !barberAcceptsNearClose(barber);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ถ้า selectedBarber ถูก disable → reset เป็น 'any'
  useEffect(() => {
    if (selectedBarber !== 'any') {
      const b = barbers.find(b => b.id === parseInt(selectedBarber));
      if (b && barberDisabled(b)) setSelectedBarber('any');
    }
  }, [nearClose, barbers]);

  const getEstimatedTime = (i) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + (i + 1) * 40);
    return t.estimatedTime(d.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    // ถ้าเลือกช่างที่ disable → ป้องกันไม่ให้ submit
    if (selectedBarber !== 'any') {
      const b = barbers.find(b => b.id === parseInt(selectedBarber));
      if (b && barberDisabled(b)) return;
    }

    onBook({
      name: customerName,
      phone: customerPhone,
      barberId: selectedBarber,
      isNextDay: !shopOpen,   // ส่งไปให้ App รู้ว่าเป็นจองวันถัดไป
    });
    setCustomerName('');
    setCustomerPhone('');
  };

  const inputCls = {
    backgroundColor: th.inputBg,
    border: `1px solid ${th.inputBorder}`,
    color: th.pageText,
    borderRadius: '0.5rem',
    padding: '0.7rem 1rem',
    fontSize: '16px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Language Dropdown ── */}
      <div className="flex items-center justify-between gap-2">

        {/* แสดงเวลาทำการ */}
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: shopOpen ? `${th.availColor}15` : `${th.servingColor}15`,
            border: `1px solid ${shopOpen ? th.availColor : th.servingColor}30`,
            color: shopOpen ? th.availColor : th.servingColor,
          }}>
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: shopOpen ? th.availColor : th.servingColor }} />
          <span className="font-medium">{shopOpen ? t.shopHours : t.shopHours}</span>
          <span className="opacity-60">•</span>
          <span>{shopOpen ? (nearClose ? '⚡ ใกล้ปิด' : '🟢 เปิดอยู่') : '🔴 ปิดแล้ว'}</span>
        </div>

        {/* ภาษา */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}`, color: th.pageText }}
          >
            <Globe size={13} style={{ color: th.accent }} />
            <span>{locales[lang].flag} {locales[lang].label}</span>
            <ChevronDown size={12} style={{ color: th.pageText + '60' }}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
              <div className="h-px" style={{ background: th.dividerLine }} />
              {Object.entries(locales).map(([key, val]) => (
                <button key={key}
                  onClick={() => { setLang(key); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={lang === key
                    ? { backgroundColor: `${th.accent}20`, color: th.accent, fontWeight: 600, borderLeft: `2px solid ${th.accent}` }
                    : { color: th.pageText + 'aa' }}>
                  <span>{val.flag}</span><span>{val.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Banner นอกเวลา ── */}
      {!shopOpen && (
        <div className="flex items-start gap-3 p-3 rounded-xl text-sm"
          style={{ backgroundColor: `${th.accent}15`, border: `1px solid ${th.accent}35` }}>
          <CalendarClock size={18} className="shrink-0 mt-0.5" style={{ color: th.accent }} />
          <div>
            <p className="font-semibold" style={{ color: th.accent }}>{t.nextDayNote}</p>
            <p className="text-xs mt-0.5" style={{ color: th.pageText + '70' }}>
              {t.afterHoursBanner(nextDayStr)}
            </p>
          </div>
        </div>
      )}

      {/* ── Banner ใกล้ปิด ── */}
      {shopOpen && nearClose && (
        <div className="flex items-start gap-3 p-3 rounded-xl text-sm"
          style={{ backgroundColor: `${th.servingColor}12`, border: `1px solid ${th.servingColor}30` }}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: th.servingColor }} />
          <p className="text-xs leading-relaxed" style={{ color: th.pageText + '80' }}>
            <span className="font-semibold" style={{ color: th.servingColor }}>ใกล้ปิดร้าน 20:30 น. </span>
            — ช่างที่มีคิวหรือกำลังตัดอยู่จะไม่สามารถรับได้ทัน กรุณาเลือกช่างที่ว่างอยู่เท่านั้น
          </p>
        </div>
      )}

      {/* ── Booking Form ── */}
      <section className="rounded-2xl p-4 sm:p-6"
        style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.cardGlow }}>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${th.accent}20` }}>
            <UserPlus size={16} style={{ color: th.accent }} />
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: th.pageText }}>
            {t.bookingTitle}
            {!shopOpen && (
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full align-middle"
                style={{ backgroundColor: `${th.accent}20`, color: th.accent }}>
                {t.nextDayNote}
              </span>
            )}
          </h2>
        </div>
        <div className="h-px mb-4 opacity-40" style={{ background: th.dividerLine }} />

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* ชื่อ + เบอร์ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: th.pageText + '60' }}>{t.labelName}</label>
              <input type="text" value={customerName} required
                onChange={e => setCustomerName(e.target.value)}
                placeholder={t.placeholderName} style={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: th.pageText + '60' }}>{t.labelPhone}</label>
              <input type="tel" value={customerPhone} required
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder={t.placeholderPhone} style={inputCls} />
            </div>
          </div>

          {/* เลือกช่าง + ปุ่มจอง */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: th.pageText + '60' }}>{t.labelBarber}</label>
              <select value={selectedBarber} onChange={e => setSelectedBarber(e.target.value)}
                style={{ ...inputCls, appearance: 'none' }}>
                <option value="any">{t.anyBarber}</option>
                {barbers.map(b => {
                  const disabled = barberDisabled(b);
                  return (
                    <option key={b.id} value={b.id} disabled={disabled}>
                      {b.name}{disabled ? ` — ${t.barberFullNearClose}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full font-bold rounded-lg py-3 transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})`,
                  color: th.accentText,
                  fontSize: '15px',
                  boxShadow: `0 4px 14px ${th.accentShadow}`,
                }}>
                {t.bookBtn}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs pt-1" style={{ color: th.pageText + '40' }}>
            <Volume2 size={12} style={{ color: th.accent + '70' }} />
            {t.voiceNote}
          </div>
        </form>
      </section>

      {/* ── Queue Status ── */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${th.accent}20` }}>
            <Clock size={16} style={{ color: th.accent }} />
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: th.pageText }}>
            {t.queueTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {barbers.map(barber => {
            const disabled = barberDisabled(barber);
            return (
              <div key={barber.id}
                className="rounded-xl p-4 flex flex-col transition-all duration-200"
                style={{
                  backgroundColor: th.cardBg,
                  border: `1px solid ${disabled ? th.servingColor + '40' : th.cardBorder}`,
                  boxShadow: th.cardGlow,
                  opacity: disabled ? 0.7 : 1,
                }}>

                {/* หัวช่าง */}
                <div className="flex items-center gap-3 pb-3 mb-3"
                  style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}` }}>
                    🧑🏻‍🦱
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: th.pageText }}>
                      {barber.name}
                    </h3>

                    {/* badge สถานะ */}
                    {disabled ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5"
                        style={{ color: th.servingColor, backgroundColor: th.servingBg, border: `1px solid ${th.servingBorder}` }}>
                        🚫 {t.barberFullNearClose}
                      </span>
                    ) : barber.currentCustomer ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5"
                        style={{ color: th.servingColor, backgroundColor: th.servingBg, border: `1px solid ${th.servingBorder}` }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: th.servingColor }} />
                        {t.serving}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5"
                        style={{ color: th.availColor, backgroundColor: th.availBg, border: `1px solid ${th.availBorder}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.availColor }} />
                        {t.available}
                      </span>
                    )}
                  </div>
                </div>

                {/* ลูกค้าปัจจุบัน */}
                <div className="flex-grow">
                  {barber.currentCustomer ? (
                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: th.pageText + '50' }}>
                        {t.cuttingNow}
                      </p>
                      <div className="rounded-lg px-3 py-2.5 flex items-center gap-2"
                        style={{ backgroundColor: th.inputBg, borderLeft: `2px solid ${th.accent}` }}>
                        <User size={14} style={{ color: th.accent }} className="shrink-0" />
                        <span className="font-semibold text-sm truncate" style={{ color: th.pageText }}>
                          {barber.currentCustomer.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 py-4 text-center text-xs rounded-lg"
                      style={{ color: th.pageText + '35', border: `1px dashed ${th.cardBorder}` }}>
                      {t.noCustomer}
                    </div>
                  )}

                  {barber.queue.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: th.pageText + '50' }}>
                        {t.queueWaiting(barber.queue.length)}
                      </p>
                      <div className="space-y-1.5">
                        {barber.queue.map((q, index) => (
                          <div key={q.id} className="rounded-lg px-3 py-2 flex flex-col gap-1"
                            style={{ backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}` }}>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                                style={{ backgroundColor: th.badgeBg, color: th.badgeText, border: `1px solid ${th.badgeBorder}` }}>
                                {index + 1}
                              </span>
                              <span className="font-medium text-sm truncate" style={{ color: th.pageText }}>{q.name}</span>
                            </div>
                            <div className="pl-7 text-xs flex items-center gap-1" style={{ color: th.pageText + '45' }}>
                              <Info size={10} style={{ color: th.accent + '70' }} />
                              {getEstimatedTime(index)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
