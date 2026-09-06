import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CustomerView from './views/CustomerView';
import BarberView from './views/BarberView';
import { themes } from './utils/themes';

export default function App() {
  const [viewMode, setViewMode] = useState('customer');
  const [theme, setTheme]       = useState(themes.pureWhite);
  const [barbers, setBarbers]   = useState([
    { id: 1, name: 'ช่างเอ (A)', currentCustomer: null, queue: [] },
    { id: 2, name: 'ช่างบี (B)', currentCustomer: null, queue: [] },
    { id: 3, name: 'ช่างซี (C)', currentCustomer: null, queue: [] },
    { id: 4, name: 'ช่างดี (D)', currentCustomer: null, queue: [] },
  ]);

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
    } catch (_) {}
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

  // ── handleBook ───────────────────────────────────────────────────────────
  const handleBook = ({ name, phone, barberId, isNextDay }) => {
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

    // speak() ต้องเรียกก่อน setState เพื่อให้อยู่ใน user-gesture call stack
    const target = barbers.find(b => b.id === targetBarberId);
    if (target) {
      if (isNextDay) {
        speak(`จองคิวสำเร็จครับ คุณ ${name} จะตัดกับ ${target.name} ในวันพรุ่งนี้ครับ`);
      } else if (!target.currentCustomer) {
        speak(`มีการจองคิวใหม่ครับ คุณ ${name} ตัดกับ ${target.name} ไม่มีคิว เชิญตัดได้เลยครับ`);
      } else {
        speak(`มีการจองคิวใหม่ครับ คุณ ${name} ตัดกับ ${target.name} ได้คิวที่ ${target.queue.length + 1} ครับ`);
      }
    }

    setBarbers(prev => prev.map(b => {
      if (b.id !== targetBarberId) return b;
      if (!b.currentCustomer) return { ...b, currentCustomer: { name, phone, id: Date.now() } };
      return { ...b, queue: [...b.queue, { name, phone, id: Date.now() }] };
    }));
  };

  // ── handleFinish ─────────────────────────────────────────────────────────
  const handleFinish = (barberId) => {
    const target = barbers.find(b => b.id === barberId);
    if (target?.queue.length > 0) {
      speak(`เชิญคิวต่อไปครับ คุณ ${target.queue[0].name} ที่ ${target.name} ครับ`);
    }
    setBarbers(prev => prev.map(b => {
      if (b.id !== barberId) return b;
      if (b.queue.length > 0) {
        const [next, ...rest] = b.queue;
        return { ...b, currentCustomer: next, queue: rest };
      }
      return { ...b, currentCustomer: null };
    }));
  };

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
      <Navbar viewMode={viewMode} setViewMode={setViewMode} theme={theme} setTheme={setTheme} />

      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {viewMode === 'customer'
          ? <CustomerView barbers={barbers} onBook={handleBook} theme={theme} />
          : <BarberView barbers={barbers} onFinish={handleFinish} theme={theme} />
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
