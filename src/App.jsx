import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CustomerView from './views/CustomerView';
import BarberView from './views/BarberView';
import { themes } from './utils/themes';
import { totalMinutes, customerDuration } from './utils/services';
import { isSlotAvailable, findAnyAvailableBarber } from './utils/appointments';

const SEAT_GRACE_MS = 15 * 60 * 1000; // ลูกค้าต้องมาถึงภายใน 15 นาที ไม่งั้นสละสิทธิ์อัตโนมัติ

export default function App() {
  const [viewMode, setViewMode] = useState('customer');
  const [theme, setTheme]       = useState(themes.pureWhite);
  const BARBERS_DEFAULT = [
    { id: 1, name: 'ช่างเอ (A)', currentCustomer: null, queue: [] },
    { id: 2, name: 'ช่างบี (B)', currentCustomer: null, queue: [] },
    { id: 3, name: 'ช่างซี (C)', currentCustomer: null, queue: [] },
    { id: 4, name: 'ช่างดี (D)', currentCustomer: null, queue: [] },
  ];

  const [barbers, setBarbers] = useState(() => {
    try {
      const saved = localStorage.getItem('bravocut_barbers');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return BARBERS_DEFAULT;
  });

  // ── รายการนัดล่วงหน้า (date + time booking) ────────────────────────────
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('bravocut_appointments');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  // sync ทุกครั้งที่ barbers เปลี่ยน
  useEffect(() => {
    try { localStorage.setItem('bravocut_barbers', JSON.stringify(barbers)); } catch { /* ignore */ }
  }, [barbers]);

  useEffect(() => {
    try { localStorage.setItem('bravocut_appointments', JSON.stringify(appointments)); } catch { /* ignore */ }
  }, [appointments]);

  // เก็บ ref ของ barbers ล่าสุดไว้ใช้ใน interval โดยไม่ต้อง re-subscribe
  const barbersRef = useRef(barbers);
  useEffect(() => { barbersRef.current = barbers; }, [barbers]);

  // ── AudioContext unlock ───────────────────────────────────────────────────
  // browser ทุกตัว (Chrome, Safari, Firefox, Samsung) บล็อก audio จนกว่า
  // user จะ interact กับหน้า → เราสร้าง AudioContext + resume ทันทีที่ user
  // แตะ/คลิกครั้งแรก เพื่อ "unlock" audio สำหรับ session นั้น
  const audioCtxRef    = useRef(null);
  const audioUnlocked  = useRef(false);

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      // เล่น silent buffer 0 วินาที เพื่อ resume context
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      ctx.resume().then(() => {
        audioUnlocked.current = true;
        audioCtxRef.current   = ctx;
      });
    } catch { /* ignore */ }
  };

  // ผูก unlock กับทุก interaction บนหน้า
  useEffect(() => {
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    events.forEach(e => window.addEventListener(e, unlockAudio, { once: false, passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, unlockAudio));
  }, []);

  // โหลด voices ล่วงหน้าตั้งแต่ mount — Safari โหลดช้า
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── speak() ──────────────────────────────────────────────────────────────
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    // resume AudioContext ก่อนเสมอ (Safari ต้องการ)
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang   = 'th-TH';
    utter.rate   = 0.85;
    utter.pitch  = 0.7;   // เสียงต่ำ — ผู้ชายวัยกลางคน
    utter.volume = 1;

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();

      // เลือกเสียงตามลำดับความสำคัญ
      const pick =
        // 1. ผู้ชายไทย
        voices.find(v => v.lang.startsWith('th') && /male/i.test(v.name)) ||
        // 2. ไทยทั่วไป
        voices.find(v => v.lang.startsWith('th')) ||
        // 3. ผู้ชายอังกฤษ (Daniel=macOS, David=Win, Fred=macOS, Google UK Male=Chrome)
        voices.find(v => v.lang.startsWith('en') && /Daniel|David|Fred|Google UK English Male/i.test(v.name)) ||
        // 4. อังกฤษทั่วไป (fallback สุดท้าย)
        voices.find(v => v.lang.startsWith('en')) ||
        null;

      utter.voice = pick;

      // Chrome บาง version มี bug ที่ SpeechSynthesis หยุดกลางคัน
      // แก้ด้วยการ resume ทุก 10 วินาที
      const resumeTimer = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      }, 10000);

      utter.onend = () => clearInterval(resumeTimer);
      utter.onerror = () => clearInterval(resumeTimer);

      window.speechSynthesis.speak(utter);
    };

    // voices อาจยังไม่โหลด (Safari) → รอ event
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    }
  };

  // ── handleBook (เข้าคิวตอนนี้ / walk-in) ────────────────────────────────
  // คืนค่าข้อมูลสรุป ให้ CustomerView เอาไปเปิดป๊อปอัพยืนยัน
  // หมายเหตุ: ใช้เฉพาะตอนร้านเปิดอยู่จริงเท่านั้น — กรณีนอกเวลาทำการ
  // CustomerView จะเรียก onBookAdvance (นัดวันถัดไป) แทน ไม่ใช่ฟังก์ชันนี้
  const handleBook = ({ name, phone, barberId, services }) => {
    let targetBarberId = barberId;
    if (targetBarberId === 'any') {
      const free = barbers.find(b => !b.currentCustomer);
      if (free) {
        targetBarberId = free.id;
      } else {
        let min = Infinity, best = null;
        barbers.forEach(b => { if (b.queue.length < min) { min = b.queue.length; best = b; } });
        targetBarberId = best.id;
      }
    }
    targetBarberId = parseInt(targetBarberId);

    const target = barbers.find(b => b.id === targetBarberId);
    if (!target) return null;

    const immediateSeat  = !target.currentCustomer;
    const queuePosition  = immediateSeat ? null : target.queue.length + 1;
    const seatExpiresAt  = immediateSeat ? Date.now() + SEAT_GRACE_MS : null;
    const waitMinutes    = immediateSeat ? 0 : (
      (target.currentCustomer ? customerDuration(target.currentCustomer) : 0) +
      target.queue.reduce((sum, c) => sum + customerDuration(c), 0)
    );

    // speak() ต้องเรียกก่อน setState เพื่อให้อยู่ใน user-gesture call stack
    if (immediateSeat) {
      speak(`มีการจองคิวใหม่ครับ คุณ ${name} ตัดกับ ${target.name} ไม่มีคิว เชิญตัดได้เลยครับ`);
    } else {
      speak(`มีการจองคิวใหม่ครับ คุณ ${name} ตัดกับ ${target.name} ได้คิวที่ ${queuePosition} ครับ`);
    }

    const customerRecord = {
      name, phone, id: Date.now(),
      services: services || [],
      acknowledged: false,
      arrived: false,
      seatExpiresAt,
    };

    setBarbers(prev => prev.map(b => {
      if (b.id !== targetBarberId) return b;
      if (!b.currentCustomer) return { ...b, currentCustomer: customerRecord };
      return { ...b, queue: [...b.queue, customerRecord] };
    }));

    return { barberName: target.name, immediateSeat, queuePosition, seatExpiresAt, waitMinutes };
  };

  // ── handleBookAdvance (จองล่วงหน้า — เลือกวันที่ + เวลา) ────────────────
  const handleBookAdvance = ({ name, phone, barberId, dateKey, time, services }) => {
    const durationMin = totalMinutes(services);
    let targetBarberId = barberId;

    if (targetBarberId === 'any') {
      const found = findAnyAvailableBarber({
        dateKey, time, durationMin, barberIds: barbers.map(b => b.id), appointments,
      });
      if (found == null) return { ok: false };
      targetBarberId = found;
    } else {
      targetBarberId = parseInt(targetBarberId);
      if (!isSlotAvailable({ dateKey, time, barberId: targetBarberId, durationMin, appointments })) {
        return { ok: false };
      }
    }

    const target = barbers.find(b => b.id === targetBarberId);
    if (!target) return { ok: false };

    speak(`จองคิวล่วงหน้าสำเร็จครับ คุณ ${name} นัดตัดกับ ${target.name} เวลา ${time} น.`);

    const record = {
      id: Date.now(),
      barberId: targetBarberId,
      dateKey, time, durationMin,
      services: services || [],
      customerName: name,
      customerPhone: phone,
      createdAt: Date.now(),
      acknowledged: false,
    };
    setAppointments(prev => [...prev, record]);

    return { ok: true, barberName: target.name };
  };

  // ── handleReset (barber view) ────────────────────────────────────────────
  const handleReset = () => {
    setBarbers(prev => prev.map(b => ({ ...b, currentCustomer: null, queue: [] })));
  };

  // ── handleFinish (barber view) ───────────────────────────────────────────
  const handleFinish = (barberId) => {
    const target = barbers.find(b => b.id === barberId);
    if (target?.queue.length > 0) {
      speak(`เชิญคิวต่อไปครับ คุณ ${target.queue[0].name} ที่ ${target.name} ครับ`);
    }
    setBarbers(prev => prev.map(b => {
      if (b.id !== barberId) return b;
      if (b.queue.length > 0) {
        const [next, ...rest] = b.queue;
        return {
          ...b,
          currentCustomer: { ...next, seatExpiresAt: Date.now() + SEAT_GRACE_MS, arrived: false },
          queue: rest,
        };
      }
      return { ...b, currentCustomer: null };
    }));
  };

  // ── handleArrived — ช่างกดยืนยันว่าลูกค้ามาถึงแล้ว (หยุดนับถอยหลัง) ─────
  const handleArrived = (barberId) => {
    setBarbers(prev => prev.map(b => {
      if (b.id !== barberId || !b.currentCustomer) return b;
      return { ...b, currentCustomer: { ...b.currentCustomer, arrived: true, seatExpiresAt: null } };
    }));
  };

  // ── ระบบแจ้งเตือนฝั่งแอดมิน (ช่าง) — รับทราบคิวใหม่ ──────────────────────
  const handleAcknowledgeWalkIn = (barberId, customerId) => {
    setBarbers(prev => prev.map(b => {
      if (b.id !== barberId) return b;
      const currentCustomer = b.currentCustomer && b.currentCustomer.id === customerId
        ? { ...b.currentCustomer, acknowledged: true } : b.currentCustomer;
      const queue = b.queue.map(q => (q.id === customerId ? { ...q, acknowledged: true } : q));
      return { ...b, currentCustomer, queue };
    }));
  };

  const handleAcknowledgeAppointment = (appointmentId) => {
    setAppointments(prev => prev.map(a => (a.id === appointmentId ? { ...a, acknowledged: true } : a)));
  };

  const handleAcknowledgeAll = () => {
    setBarbers(prev => prev.map(b => ({
      ...b,
      currentCustomer: b.currentCustomer ? { ...b.currentCustomer, acknowledged: true } : null,
      queue: b.queue.map(q => ({ ...q, acknowledged: true })),
    })));
    setAppointments(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  // ── auto-release: ลูกค้าที่ได้คิวทันที (immediateSeat) แต่ไม่มาภายใน 15 นาที ─
  useEffect(() => {
    const id = setInterval(() => {
      const current = barbersRef.current;
      const expiredBarbers = current.filter(b =>
        b.currentCustomer &&
        !b.currentCustomer.arrived &&
        b.currentCustomer.seatExpiresAt &&
        Date.now() > b.currentCustomer.seatExpiresAt
      );
      if (expiredBarbers.length === 0) return;

      expiredBarbers.forEach(b => {
        if (b.queue.length > 0) {
          speak(`คิวของคุณ ${b.currentCustomer.name} หมดเวลาที่กำหนด ระบบสละสิทธิ์อัตโนมัติ เชิญคิวต่อไปครับ คุณ ${b.queue[0].name} ที่ ${b.name} ครับ`);
        } else {
          speak(`คิวของคุณ ${b.currentCustomer.name} หมดเวลาที่กำหนด ระบบสละสิทธิ์อัตโนมัติครับ`);
        }
      });

      setBarbers(prev => prev.map(b => {
        const isExpired = expiredBarbers.some(e => e.id === b.id);
        if (!isExpired) return b;
        if (b.queue.length > 0) {
          const [next, ...rest] = b.queue;
          return {
            ...b,
            currentCustomer: { ...next, seatExpiresAt: Date.now() + SEAT_GRACE_MS, arrived: false },
            queue: rest,
          };
        }
        return { ...b, currentCustomer: null };
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── จำนวนแจ้งเตือนที่ยังไม่รับทราบ (badge) ───────────────────────────────
  const unacknowledgedCount = barbers.reduce((sum, b) => {
    let c = b.currentCustomer && !b.currentCustomer.acknowledged ? 1 : 0;
    c += b.queue.filter(q => !q.acknowledged).length;
    return sum + c;
  }, 0) + appointments.filter(a => !a.acknowledged).length;

  const t = theme;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: t.pageBg,
        color: t.pageText,
        backgroundImage: t.texture
          ? 'repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.012) 40px,rgba(255,255,255,0.012) 41px)'
          : 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Navbar
        viewMode={viewMode} setViewMode={setViewMode}
        theme={theme} setTheme={setTheme}
        unacknowledgedCount={unacknowledgedCount}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {viewMode === 'customer'
          ? <CustomerView
              barbers={barbers}
              appointments={appointments}
              onBook={handleBook}
              onBookAdvance={handleBookAdvance}
              theme={theme}
            />
          : <BarberView
              barbers={barbers}
              appointments={appointments}
              onFinish={handleFinish}
              onReset={handleReset}
              onArrived={handleArrived}
              onAcknowledgeWalkIn={handleAcknowledgeWalkIn}
              onAcknowledgeAppointment={handleAcknowledgeAppointment}
              onAcknowledgeAll={handleAcknowledgeAll}
              theme={theme}
            />
        }
      </main>

      <footer className="mt-12 pb-6 text-center">
        <div className="h-px max-w-xs mx-auto mb-4" style={{ background: t.dividerLine }} />
        <p className="text-xs tracking-widest uppercase" style={{ color: t.footerText }}>
          Bravo Cut © 2026
        </p>
      </footer>
    </div>
  );
}
