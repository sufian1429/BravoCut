import { useState, useRef, useEffect } from 'react';
import {
  User, Clock, Volume2, UserPlus, Info, Globe, ChevronDown, ArrowLeft,
  AlertTriangle, CalendarClock, CalendarDays, Users,
} from 'lucide-react';
import { locales } from '../utils/locales';
import {
  isShopOpen,
  isAfterClose,
  isNearClose,
  nextOpenDate,
  formatNextDay,
  barberAcceptsNearClose,
} from '../utils/shopHours';
import { totalMinutes, customerDuration } from '../utils/services';
import { getAvailableSlots, toDateKey, dateKeyToLabel } from '../utils/appointments';
import Hero from '../components/Hero';
import ServiceSelector from '../components/ServiceSelector';
import BookingConfirmModal from '../components/BookingConfirmModal';

export default function CustomerView({ barbers, appointments, onBook, onBookAdvance, theme }) {
  const [customerName, setCustomerName]     = useState('');
  const [customerPhone, setCustomerPhone]   = useState('');
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [selectedServices, setSelectedServices] = useState([]);
  const [lang, setLang]                     = useState('th');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [mode, setMode]                     = useState('now'); // 'now' | 'advance'
  const [screen, setScreen]                 = useState('hero'); // 'hero' | 'booking' — หน้าแรก vs หน้าสอง
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [confirmData, setConfirmData]       = useState(null);
  const [slotTakenError, setSlotTakenError] = useState(false);

  const dropdownRef = useRef(null);

  const t  = locales[lang];
  const th = theme;

  // ── เวลา ────────────────────────────────────────────────────────────────
  const now        = new Date();
  const shopOpen   = isShopOpen(now);    // true ระหว่าง 10:00–21:00
  const afterClose = isAfterClose(now);  // true เฉพาะ ≥ 21:00 → ต้องจองวันถัดไป
  const nearClose  = isNearClose(now);   // true ระหว่าง 20:30–21:00 → ช่างที่มีคิวรับไม่ทัน
  const nextDay    = nextOpenDate(now);
  const nextDayStr = formatNextDay(nextDay, t.locale);

  const isNextDayBooking = afterClose;

  // ช่างที่ถูก disable ใน near-close (เฉพาะโหมด "เข้าคิวตอนนี้")
  const barberDisabled = (barber) => nearClose && !barberAcceptsNearClose(barber);

  // ── จองล่วงหน้า: วันที่ / เวลา (เลือกข้ามวันข้ามเดือนได้ ไม่จำกัดแค่ 7 วัน) ──
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [selectedTime, setSelectedTime]       = useState(null);

  const durationMin = totalMinutes(selectedServices);

  const availableSlots = (() => {
    if (mode !== 'advance' || durationMin <= 0) return [];
    if (selectedBarber === 'any') {
      const union = new Set();
      barbers.forEach(b => {
        getAvailableSlots({ dateKey: selectedDateKey, barberId: b.id, durationMin, appointments, now })
          .forEach(s => union.add(s));
      });
      return Array.from(union).sort();
    }
    return getAvailableSlots({
      dateKey: selectedDateKey, barberId: parseInt(selectedBarber), durationMin, appointments, now,
    });
  })();

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ช่างที่เลือกไว้กลายเป็น disabled ระหว่างทาง (เวลาผ่านเข้าใกล้ปิด) → แสดงเป็น "ช่างคนไหนก็ได้" แทน
  // โดยไม่ต้องเซ็ต state ใหม่ (การเช็คตอน submit ก็ยังกันไว้อีกชั้นอยู่แล้ว)
  const barberSelectValue = (() => {
    if (mode === 'now' && selectedBarber !== 'any') {
      const b = barbers.find(b => b.id === parseInt(selectedBarber));
      if (b && barberDisabled(b)) return 'any';
    }
    return selectedBarber;
  })();

  const goToBooking = () => setScreen('booking');

  const getEstimatedTime = (barber, index) => {
    let waitMin = barber.currentCustomer ? customerDuration(barber.currentCustomer) : 0;
    for (let i = 0; i <= index; i++) waitMin += customerDuration(barber.queue[i]);
    const d = new Date();
    d.setMinutes(d.getMinutes() + waitMin);
    return t.estimatedTime(d.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' }));
  };

  // ── submit: เข้าคิวตอนนี้ ─────────────────────────────────────────────────
  const handleSubmitNow = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!customerName.trim() || !customerPhone.trim() || selectedServices.length === 0) return;
    if (selectedBarber !== 'any') {
      const b = barbers.find(b => b.id === parseInt(selectedBarber));
      if (b && barberDisabled(b)) return;
    }
    const result = onBook({
      name: customerName,
      phone: customerPhone,
      barberId: selectedBarber,
      isNextDay: isNextDayBooking,
      services: selectedServices,
    });
    if (!result) return;

    let estimatedTimeLabel = null;
    if (!result.immediateSeat) {
      const d = new Date();
      d.setMinutes(d.getMinutes() + (result.waitMinutes || 0));
      estimatedTimeLabel = t.estimatedTime(d.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' }));
    }

    setConfirmData({
      mode: 'now',
      customerName, customerPhone,
      barberName: result.barberName,
      serviceIds: selectedServices,
      immediateSeat: result.immediateSeat,
      queuePosition: result.queuePosition,
      estimatedTimeLabel,
      seatExpiresAt: result.seatExpiresAt,
    });

    setCustomerName('');
    setCustomerPhone('');
    setSelectedServices([]);
    setAttemptedSubmit(false);
  };

  // ── submit: จองล่วงหน้า ───────────────────────────────────────────────────
  const handleSubmitAdvance = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setSlotTakenError(false);
    if (!customerName.trim() || !customerPhone.trim() || selectedServices.length === 0 || !selectedTime) return;

    const result = onBookAdvance({
      name: customerName,
      phone: customerPhone,
      barberId: selectedBarber,
      dateKey: selectedDateKey,
      time: selectedTime,
      services: selectedServices,
    });

    if (!result || !result.ok) {
      setSlotTakenError(true);
      setSelectedTime(null);
      return;
    }

    const dateLabel = dateKeyToLabel(selectedDateKey, t.locale);
    setConfirmData({
      mode: 'advance',
      customerName, customerPhone,
      barberName: result.barberName,
      serviceIds: selectedServices,
      dateLabel,
      time: selectedTime,
    });

    setCustomerName('');
    setCustomerPhone('');
    setSelectedServices([]);
    setSelectedTime(null);
    setAttemptedSubmit(false);
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

  // สีแสดงสถานะร้าน
  const statusColor = shopOpen
    ? (nearClose ? th.accent : th.availColor)
    : (afterClose ? th.servingColor : th.accent);

  const statusLabel = shopOpen
    ? (nearClose ? '⚡ ใกล้ปิด' : '🟢 เปิดอยู่')
    : (afterClose ? '🔴 ปิดแล้ว' : '🕐 ยังไม่เปิด');

  // ── หน้าแรก: แสดงภาพเคลื่อนไหวอย่างเดียว ─────────────────────────────────
  if (screen === 'hero') {
    return <Hero theme={th} t={t} onCtaClick={goToBooking} />;
  }

  // ── หน้าสอง: ระบบจองคิว ───────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── ปุ่มย้อนกลับหน้าแรก ── */}
      <button type="button" onClick={() => setScreen('hero')}
        className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
        style={{ color: th.pageText + '70' }}>
        <ArrowLeft size={13} /> {t.heroTitle}
      </button>

      {/* ── แถบสถานะ + ภาษา ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: `${statusColor}15`,
            border: `1px solid ${statusColor}30`,
            color: statusColor,
          }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="font-medium">{t.shopHours}</span>
          <span className="opacity-50">•</span>
          <span>{statusLabel}</span>
        </div>

        {/* ภาษา */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}`, color: th.pageText }}>
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

      {/* ── Mode tabs ── */}
      <div className="flex rounded-xl p-1 gap-1 border"
        style={{ backgroundColor: th.inputBg, borderColor: th.inputBorder }}>
        {[
          { key: 'now', label: t.modeNow, icon: <Clock size={14} /> },
          { key: 'advance', label: t.modeAdvance, icon: <CalendarDays size={14} /> },
        ].map(({ key, label, icon }) => {
          const active = mode === key;
          return (
            <button key={key} type="button"
              onClick={() => { setMode(key); setAttemptedSubmit(false); setSlotTakenError(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={active
                ? { background: `linear-gradient(90deg,${th.accentFrom},${th.accentTo})`, color: th.accentText, boxShadow: `0 2px 8px ${th.accentShadow}` }
                : { color: th.pageText + '80' }}>
              {icon}{label}
            </button>
          );
        })}
      </div>

      {/* ── Banner ปิดแล้ว → จองวันถัดไป (≥ 21:00 เท่านั้น, เฉพาะโหมด now) ── */}
      {mode === 'now' && afterClose && (
        <div className="flex items-start gap-3 p-3 rounded-xl"
          style={{ backgroundColor: `${th.accent}15`, border: `1px solid ${th.accent}35` }}>
          <CalendarClock size={17} className="shrink-0 mt-0.5" style={{ color: th.accent }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: th.accent }}>{t.nextDayNote}</p>
            <p className="text-xs mt-0.5" style={{ color: th.pageText + '70' }}>
              {t.afterHoursBanner(nextDayStr)}
            </p>
          </div>
        </div>
      )}

      {mode === 'now' && !shopOpen && !afterClose && (
        <div className="flex items-start gap-3 p-3 rounded-xl"
          style={{ backgroundColor: `${th.accent}12`, border: `1px solid ${th.accent}30` }}>
          <Clock size={17} className="shrink-0 mt-0.5" style={{ color: th.accent }} />
          <p className="text-xs" style={{ color: th.pageText + '75' }}>
            <span className="font-semibold" style={{ color: th.accent }}>ร้านเปิด 10:00 น. </span>
            — สามารถจองคิวสำหรับวันนี้ได้เลยครับ
          </p>
        </div>
      )}

      {mode === 'now' && nearClose && (
        <div className="flex items-start gap-3 p-3 rounded-xl"
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
            {mode === 'now' ? t.bookingTitle : t.modeAdvance}
            {mode === 'now' && isNextDayBooking && (
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full align-middle"
                style={{ backgroundColor: `${th.accent}20`, color: th.accent }}>
                {t.nextDayNote}
              </span>
            )}
          </h2>
        </div>
        <div className="h-px mb-4 opacity-40" style={{ background: th.dividerLine }} />

        <form onSubmit={mode === 'now' ? handleSubmitNow : handleSubmitAdvance} className="space-y-4">
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

          {/* บริการ */}
          <div>
            <ServiceSelector theme={th} t={t} selected={selectedServices}
              onChange={ids => { setSelectedServices(ids); setSelectedTime(null); }} />
            {attemptedSubmit && selectedServices.length === 0 && (
              <p className="text-xs mt-1.5" style={{ color: th.servingColor }}>{t.servicesRequired}</p>
            )}
          </div>

          {/* เลือกช่าง */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: th.pageText + '60' }}>{t.labelBarber}</label>
            <select value={barberSelectValue}
              onChange={e => { setSelectedBarber(e.target.value); setSelectedTime(null); }}
              style={{ ...inputCls, appearance: 'none' }}>
              <option value="any">{t.anyBarber}</option>
              {barbers.map(b => {
                const disabled = mode === 'now' && barberDisabled(b);
                return (
                  <option key={b.id} value={b.id} disabled={disabled}>
                    {b.name}{disabled ? ` — ${t.barberFullNearClose}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {mode === 'now' ? (
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
          ) : (
            <>
              {/* เลือกวันที่ — จองข้ามวันข้ามเดือนได้ ไม่จำกัดแค่ 7 วัน */}
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: th.pageText + '60' }}>{t.selectDate}</label>
                <input
                  type="date"
                  value={selectedDateKey}
                  min={toDateKey(new Date())}
                  required
                  onChange={e => { if (e.target.value) { setSelectedDateKey(e.target.value); setSelectedTime(null); } }}
                  style={inputCls}
                />
                <p className="text-[11px] mt-1" style={{ color: th.pageText + '50' }}>
                  {dateKeyToLabel(selectedDateKey, t.locale)}{selectedDateKey === toDateKey(new Date()) ? ` ${t.todaySuffix}` : ''}
                </p>
              </div>

              {/* เลือกเวลา */}
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: th.pageText + '60' }}>{t.selectTime}</label>
                {durationMin === 0 ? (
                  <p className="text-xs" style={{ color: th.pageText + '55' }}>{t.pickTimeFirst}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs" style={{ color: th.servingColor }}>{t.noSlotsAvailable}</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSlots.map(slot => {
                      const active = slot === selectedTime;
                      return (
                        <button key={slot} type="button"
                          onClick={() => setSelectedTime(slot)}
                          className="px-2 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={active
                            ? { background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})`, color: th.accentText }
                            : { backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}`, color: th.pageText + '90' }}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
                {attemptedSubmit && !selectedTime && durationMin > 0 && availableSlots.length > 0 && (
                  <p className="text-xs mt-1.5" style={{ color: th.servingColor }}>{t.selectTime}</p>
                )}
                {slotTakenError && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: th.servingColor }}>
                    <AlertTriangle size={12} /> {t.noSlotsAvailable}
                  </p>
                )}
              </div>

              <button type="submit"
                className="w-full font-bold rounded-lg py-3 transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})`,
                  color: th.accentText,
                  fontSize: '15px',
                  boxShadow: `0 4px 14px ${th.accentShadow}`,
                }}>
                {t.advanceBookBtn}
              </button>
            </>
          )}

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
            <Users size={16} style={{ color: th.accent }} />
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold" style={{ color: th.pageText }}>
            {t.queueTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {barbers.map(barber => {
            const disabled = mode === 'now' && barberDisabled(barber);
            return (
              <div key={barber.id}
                className="rounded-xl p-4 flex flex-col transition-all duration-200"
                style={{
                  backgroundColor: th.cardBg,
                  border: `1px solid ${disabled ? th.servingColor + '40' : th.cardBorder}`,
                  boxShadow: th.cardGlow,
                  opacity: disabled ? 0.7 : 1,
                }}>
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
                              {getEstimatedTime(barber, index)}
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

      {/* ── ป๊อปอัพยืนยันการจอง ── */}
      {confirmData && (
        <BookingConfirmModal theme={th} t={t} data={confirmData} onClose={() => setConfirmData(null)} />
      )}
    </div>
  );
}
