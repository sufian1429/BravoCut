import { useState, useEffect } from 'react';
import { CheckCircle2, User, Phone, Scissors, CalendarClock, Clock, Timer, X } from 'lucide-react';
import { SERVICES } from '../utils/services';

// ── BookingConfirmModal ──────────────────────────────────────────────────
// ป๊อปอัพหลังลูกค้าจองสำเร็จ — สรุปรายละเอียดทั้งหมด
// ถ้าเป็นคิว "เข้าคิวตอนนี้" และช่างว่างพอดี (immediateSeat) จะมีนาฬิกานับถอยหลัง
// 15 นาที เตือนว่าต้องมาถึงร้านทันเวลา ไม่งั้นระบบจะสละสิทธิ์ให้คนถัดไปอัตโนมัติ

function useCountdown(expiresAt) {
  const [remainingMs, setRemainingMs] = useState(() => (expiresAt ? expiresAt - Date.now() : null));

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remainingMs;
}

// แถวรายละเอียดหนึ่งบรรทัด — ประกาศนอก component หลัก เพื่อไม่ให้ถูกสร้างใหม่ทุก render
function Row({ th, icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
      <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${th.accent}18` }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide" style={{ color: th.pageText + '55' }}>{label}</div>
        <div className="text-sm font-semibold truncate" style={{ color: th.pageText }}>{value}</div>
      </div>
    </div>
  );
}

export default function BookingConfirmModal({ theme, t, data, onClose }) {
  const th = theme;
  const remainingMs = useCountdown(data?.immediateSeat ? data.seatExpiresAt : null);

  if (!data) return null;

  const serviceLabels = (data.serviceIds || [])
    .map(id => t.serviceNames[id] || SERVICES.find(s => s.id === id)?.icon)
    .join(' + ');

  const isAdvance = data.mode === 'advance';
  const expired = remainingMs !== null && remainingMs <= 0;

  const mm = remainingMs !== null ? Math.floor(remainingMs / 60000) : 0;
  const ss = remainingMs !== null ? Math.floor((remainingMs % 60000) / 1000) : 0;
  const countdownLabel = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between"
          style={{ background: `linear-gradient(135deg,${th.accentFrom}22,${th.accentTo}11)` }}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={24} style={{ color: '#34d399' }} />
            <h3 className="font-display text-base font-bold" style={{ color: th.pageText }}>
              {isAdvance ? t.confirmTitleAdvance : t.confirmTitleNow}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-60" style={{ color: th.pageText + '80' }}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <Row th={th} icon={<User size={15} style={{ color: th.accent }} />} label={t.confirmName} value={data.customerName} />
          <Row th={th} icon={<Phone size={15} style={{ color: th.accent }} />} label={t.confirmPhone} value={data.customerPhone} />
          <Row th={th} icon={<Scissors size={15} style={{ color: th.accent }} />} label={t.confirmBarber} value={data.barberName} />
          <Row th={th} icon={<Clock size={15} style={{ color: th.accent }} />} label={t.confirmService} value={serviceLabels} />

          {isAdvance ? (
            <Row th={th} icon={<CalendarClock size={15} style={{ color: th.accent }} />} label={t.confirmDate}
              value={`${data.dateLabel}  •  ${data.time} น.`} />
          ) : data.immediateSeat ? null : (
            <Row th={th} icon={<CalendarClock size={15} style={{ color: th.accent }} />}
              label={t.queueTitle}
              value={`${t.confirmQueuePos(data.queuePosition)} — ${data.estimatedTimeLabel}`} />
          )}

          {/* immediate-seat 15 min countdown */}
          {!isAdvance && data.immediateSeat && (
            <div className="mt-3 rounded-xl p-4 text-center"
              style={{
                backgroundColor: expired ? `${th.servingColor}18` : `${th.accent}14`,
                border: `1px solid ${expired ? th.servingColor + '50' : th.accent + '40'}`,
              }}>
              <p className="text-sm font-semibold mb-1" style={{ color: th.pageText }}>
                {t.immediateSeatNote}
              </p>
              <div className="flex items-center justify-center gap-2 my-2">
                <Timer size={22} style={{ color: expired ? th.servingColor : th.accent }} />
                <span className="text-3xl font-black tabular-nums" style={{ color: expired ? th.servingColor : th.accent }}>
                  {expired ? t.timeExpired : countdownLabel}
                </span>
              </div>
              <p className="text-xs font-semibold mb-1" style={{ color: th.accent }}>{t.arriveWithinTitle}</p>
              <p className="text-xs leading-relaxed" style={{ color: th.pageText + '75' }}>{t.arriveWithinDesc}</p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})`,
              color: th.accentText,
              boxShadow: `0 4px 14px ${th.accentShadow}`,
            }}>
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
