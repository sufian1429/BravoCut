import { useState, useEffect } from 'react';
import {
  CheckCircle, Phone, Scissors, RotateCcw, AlertCircle,
  Bell, CheckCheck, Timer, CalendarClock, User as UserIcon,
} from 'lucide-react';
import { SERVICES } from '../utils/services';
import { toDateKey, hhmmToMinutes, dateKeyToLabel } from '../utils/appointments';

// ── helpers ────────────────────────────────────────────────────────────
function serviceIcons(serviceIds = []) {
  return serviceIds.map(id => SERVICES.find(s => s.id === id)?.icon).filter(Boolean).join(' ');
}

function formatCountdown(expiresAt, now) {
  const remain = Math.max(0, expiresAt - now);
  const mm = Math.floor(remain / 60000);
  const ss = Math.floor((remain % 60000) / 1000);
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** เวลาปัจจุบันแบบ live — อัปเดตทุกวินาที เพื่อให้นาฬิกานับถอยหลังเดินสด ๆ */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export default function BarberView({
  barbers, appointments, onFinish, onReset, onArrived,
  onAcknowledgeWalkIn, onAcknowledgeAppointment, onAcknowledgeAll, theme,
}) {
  const th = theme;
  const now = useNow(1000);

  // confirmId = barberId ที่รอยืนยัน, null = ไม่มี dialog
  const [confirmId, setConfirmId]     = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleFinishClick = (barberId) => setConfirmId(barberId);
  const handleFinishConfirm = () => { onFinish(confirmId); setConfirmId(null); };
  const handleResetConfirm  = () => { onReset(); setConfirmReset(false); };

  // ── รวมรายการแจ้งเตือนที่ยังไม่รับทราบ (คิวตอนนี้ + จองล่วงหน้า) ────────
  const walkInNotifications = [];
  barbers.forEach(b => {
    if (b.currentCustomer && !b.currentCustomer.acknowledged) {
      walkInNotifications.push({
        kind: 'now', barberId: b.id, barberName: b.name, customerId: b.currentCustomer.id,
        name: b.currentCustomer.name, phone: b.currentCustomer.phone,
        services: b.currentCustomer.services, sortKey: b.currentCustomer.id,
      });
    }
    b.queue.forEach(q => {
      if (!q.acknowledged) {
        walkInNotifications.push({
          kind: 'now', barberId: b.id, barberName: b.name, customerId: q.id,
          name: q.name, phone: q.phone, services: q.services, sortKey: q.id,
        });
      }
    });
  });
  const appointmentNotifications = appointments
    .filter(a => !a.acknowledged)
    .map(a => ({
      kind: 'advance', appointmentId: a.id,
      barberName: barbers.find(b => b.id === a.barberId)?.name || '-',
      name: a.customerName, phone: a.customerPhone, services: a.services,
      dateKey: a.dateKey, time: a.time, sortKey: a.createdAt,
    }));
  const allNotifications = [...walkInNotifications, ...appointmentNotifications]
    .sort((a, b) => (a.sortKey || 0) - (b.sortKey || 0));

  // ── รายการนัดล่วงหน้าที่ยังไม่ถึงเวลา (แสดงเป็นตารางคร่าว ๆ) ────────────
  const nowKey = toDateKey(new Date());
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const upcomingAppointments = appointments
    .filter(a => a.dateKey > nowKey || (a.dateKey === nowKey && hhmmToMinutes(a.time) >= nowMin))
    .sort((a, b) => (a.dateKey + a.time).localeCompare(b.dateKey + b.time));

  return (
    <div className="space-y-4">

      {/* Banner */}
      <div className="p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3"
        style={{ backgroundColor: `${th.accent}12`, border: `1px solid ${th.accent}30` }}>
        <div className="p-1.5 rounded-lg shrink-0 mt-0.5 sm:mt-0"
          style={{ backgroundColor: `${th.accent}20` }}>
          <Scissors size={16} style={{ color: th.accent }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: th.accent }}>
            โหมดสำหรับช่างตัดผม
          </h3>
          <p className="text-xs mt-0.5" style={{ color: th.pageText + '55' }}>
            กดปุ่มเมื่อให้บริการเสร็จ เพื่อเรียกคิวถัดไปอัตโนมัติ
          </p>
        </div>
      </div>

      {/* ── การแจ้งเตือนใหม่ (admin) ── */}
      {allNotifications.length > 0 && (
        <div className="rounded-xl overflow-hidden"
          style={{ backgroundColor: th.cardBg, border: `1px solid ${th.servingColor}45`, boxShadow: th.cardGlow }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: `${th.servingColor}14` }}>
            <div className="flex items-center gap-2">
              <Bell size={16} style={{ color: th.servingColor }} className="animate-pulse" />
              <h3 className="font-bold text-sm" style={{ color: th.pageText }}>
                การแจ้งเตือนใหม่ ({allNotifications.length})
              </h3>
            </div>
            <button onClick={onAcknowledgeAll}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:opacity-80"
              style={{ backgroundColor: `${th.accent}18`, color: th.accent }}>
              <CheckCheck size={13} /> รับทราบทั้งหมด
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: th.cardBorder }}>
            {allNotifications.map(n => (
              <div key={`${n.kind}-${n.customerId || n.appointmentId}`}
                className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: n.kind === 'now' ? `${th.availColor}20` : `${th.accent}20`,
                        color: n.kind === 'now' ? th.availColor : th.accent,
                      }}>
                      {n.kind === 'now' ? 'เข้าคิวตอนนี้' : 'จองล่วงหน้า'}
                    </span>
                    <span className="font-semibold text-sm truncate" style={{ color: th.pageText }}>{n.name}</span>
                    <span className="text-xs" style={{ color: th.pageText + '55' }}>{serviceIcons(n.services)}</span>
                  </div>
                  <div className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: th.pageText + '60' }}>
                    <span className="flex items-center gap-1"><Phone size={10} />{n.phone}</span>
                    <span>•</span>
                    <span>{n.barberName}</span>
                    {n.kind === 'advance' && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CalendarClock size={10} />{dateKeyToLabel(n.dateKey)} {n.time} น.
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => n.kind === 'now'
                    ? onAcknowledgeWalkIn(n.barberId, n.customerId)
                    : onAcknowledgeAppointment(n.appointmentId)}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${th.accent}18`, color: th.accent }}>
                  รับทราบ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid ช่าง — 1 col มือถือ / 2 col tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {barbers.map(barber => {
          const cc = barber.currentCustomer;
          const showCountdown = cc && !cc.arrived && cc.seatExpiresAt;
          const expired = showCountdown && now > cc.seatExpiresAt;
          return (
            <div key={barber.id}
              className="rounded-xl p-4 sm:p-5 flex flex-col items-center text-center"
              style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.cardGlow }}>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 shrink-0"
                style={{ backgroundColor: th.inputBg, border: `1px solid ${th.inputBorder}` }}>
                🧑🏻‍🦱
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold mb-3"
                style={{ color: th.pageText }}>
                {barber.name}
              </h3>

              {/* ข้อมูลลูกค้า */}
              <div className="w-full rounded-xl p-3 mb-3 min-h-[88px] flex flex-col justify-center items-center"
                style={{ backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}` }}>
                {cc ? (
                  <>
                    <span className="text-[10px] font-medium uppercase tracking-widest mb-1"
                      style={{ color: th.pageText + '50' }}>ลูกค้าปัจจุบัน</span>
                    <span className="text-base sm:text-lg font-bold mb-1.5" style={{ color: th.accentFrom }}>
                      {cc.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{ color: th.pageText + '60', backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                      <Phone size={11} style={{ color: th.accent + '80' }} />
                      {cc.phone}
                    </div>
                    {cc.services?.length > 0 && (
                      <span className="text-xs mt-1.5" style={{ color: th.pageText + '55' }}>
                        {serviceIcons(cc.services)}
                      </span>
                    )}
                    {barber.queue.length > 0 && (
                      <span className="text-xs mt-2" style={{ color: th.pageText + '45' }}>
                        คิวรออีก <span className="font-semibold" style={{ color: th.accent }}>{barber.queue.length}</span> คิว
                      </span>
                    )}

                    {/* นับถอยหลัง 15 นาที + ปุ่มยืนยันลูกค้ามาแล้ว */}
                    {showCountdown && (
                      <div className="w-full mt-3 rounded-lg p-2 flex items-center justify-between gap-2"
                        style={{
                          backgroundColor: expired ? `${th.servingColor}20` : `${th.accent}14`,
                          border: `1px solid ${expired ? th.servingColor + '50' : th.accent + '35'}`,
                        }}>
                        <span className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: expired ? th.servingColor : th.accent }}>
                          <Timer size={12} /> {expired ? 'เกินเวลา' : formatCountdown(cc.seatExpiresAt, now)}
                        </span>
                        <button onClick={() => onArrived(barber.id)}
                          className="text-[11px] font-bold px-2 py-1 rounded-md"
                          style={{ backgroundColor: '#059669', color: '#fff' }}>
                          ลูกค้ามาแล้ว
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5" style={{ color: th.pageText + '30' }}>
                    <Scissors size={18} />
                    <span className="text-xs">เก้าอี้ว่าง</span>
                  </div>
                )}
              </div>

              {/* ปุ่มตัดเสร็จ */}
              <button
                onClick={() => handleFinishClick(barber.id)}
                disabled={!cc}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                style={cc
                  ? { background: 'linear-gradient(135deg,#34d399,#059669)', color: '#fff', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }
                  : { backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}`, color: th.pageText + '30', cursor: 'not-allowed' }
                }>
                <CheckCircle size={16} />
                ตัดเสร็จเรียบร้อย
              </button>
            </div>
          );
        })}
      </div>

      {/* ── รายการนัดล่วงหน้า ── */}
      {upcomingAppointments.length > 0 && (
        <section className="rounded-xl p-4"
          style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.cardGlow }}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} style={{ color: th.accent }} />
            <h3 className="font-bold text-sm" style={{ color: th.pageText }}>
              รายการนัดล่วงหน้า ({upcomingAppointments.length})
            </h3>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}` }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-center shrink-0 px-2 py-1 rounded-md"
                    style={{ backgroundColor: `${th.accent}18`, color: th.accent }}>
                    <div className="text-[10px] font-semibold leading-none">{dateKeyToLabel(a.dateKey)}</div>
                    <div className="text-xs font-bold leading-tight mt-0.5">{a.time}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <UserIcon size={12} style={{ color: th.pageText + '60' }} />
                      <span className="text-sm font-semibold truncate" style={{ color: th.pageText }}>{a.customerName}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: th.pageText + '55' }}>
                      {barbers.find(b => b.id === a.barberId)?.name} • {serviceIcons(a.services)} • {a.customerPhone}
                    </div>
                  </div>
                </div>
                {!a.acknowledged && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${th.servingColor}18`, color: th.servingColor }}>
                    ใหม่
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ปุ่ม รีเซ็ตคิวทั้งหมด ── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: `${th.servingColor}15`, border: `1px solid ${th.servingColor}35`, color: th.servingColor }}>
          <RotateCcw size={13} />
          รีเซ็ตคิวทั้งหมด
        </button>
      </div>

      {/* ── Confirm Dialog: ตัดเสร็จ ── */}
      {confirmId !== null && (() => {
        const barber = barbers.find(b => b.id === confirmId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmId(null)}>
            <div className="rounded-2xl p-5 w-full max-w-xs shadow-2xl"
              style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} style={{ color: '#34d399' }} />
                <h3 className="font-bold text-sm" style={{ color: th.pageText }}>ยืนยันตัดเสร็จ</h3>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: th.pageText + '80' }}>
                ยืนยันว่า <span className="font-semibold" style={{ color: th.accent }}>{barber?.currentCustomer?.name}</span> ตัดเสร็จแล้ว
                และจะเรียกคิวถัดไปของ <span className="font-semibold">{barber?.name}</span> อัตโนมัติ
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium"
                  style={{ backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}`, color: th.pageText + '80' }}>
                  ยกเลิก
                </button>
                <button onClick={handleFinishConfirm}
                  className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#34d399,#059669)', color: '#fff', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirm Dialog: รีเซ็ตทั้งหมด ── */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmReset(false)}>
          <div className="rounded-2xl p-5 w-full max-w-xs shadow-2xl"
            style={{ backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} style={{ color: th.servingColor }} />
              <h3 className="font-bold text-sm" style={{ color: th.pageText }}>รีเซ็ตคิวทั้งหมด?</h3>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: th.pageText + '80' }}>
              ลูกค้าและคิวรอของช่างทุกคนจะถูกล้างออกทั้งหมด ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-xl text-xs font-medium"
                style={{ backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}`, color: th.pageText + '80' }}>
                ยกเลิก
              </button>
              <button onClick={handleResetConfirm}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: `linear-gradient(135deg,${th.servingColor},#b91c1c)`, color: '#fff', boxShadow: `0 4px 12px ${th.servingColor}40` }}>
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
