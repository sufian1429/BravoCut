import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CustomerView from './views/CustomerView';
import BarberView from './views/BarberView';
import { themes } from './utils/themes';

export default function App() {
  const [viewMode, setViewMode] = useState('customer');
  const [theme, setTheme] = useState(themes.pureWhite);
  const [barbers, setBarbers] = useState([
    { id: 1, name: 'ช่างเอ (A)', currentCustomer: null, queue: [] },
    { id: 2, name: 'ช่างบี (B)', currentCustomer: null, queue: [] },
    { id: 3, name: 'ช่างซี (C)', currentCustomer: null, queue: [] },
    { id: 4, name: 'ช่างดี (D)', currentCustomer: null, queue: [] },
  ]);

  // speak() ต้องถูกเรียกโดยตรงใน event handler (synchronous)
  // ห้ามเรียกใน callback ของ setState เพราะ browser จะบล็อกเสียง (Autoplay Policy)
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.pitch = 1.8;
    utterance.volume = 1;
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const thFemale = voices.find(v => v.lang.startsWith('th') && v.name.toLowerCase().includes('female'));
      const thAny = voices.find(v => v.lang.startsWith('th'));
      const enFemale = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira'))
      );
      utterance.voice = thFemale || thAny || enFemale || null;
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length > 0) doSpeak();
    else window.speechSynthesis.onvoiceschanged = doSpeak;
  };

  const handleBook = ({ name, phone, barberId }) => {
    // 1. คำนวณ targetBarberId ก่อน
    let targetBarberId = barberId;
    if (targetBarberId === 'any') {
      const freeBarber = barbers.find(b => !b.currentCustomer);
      if (freeBarber) {
        targetBarberId = freeBarber.id;
      } else {
        let minQueue = Infinity, bestBarber = null;
        barbers.forEach(b => { if (b.queue.length < minQueue) { minQueue = b.queue.length; bestBarber = b; } });
        targetBarberId = bestBarber.id;
      }
    }
    targetBarberId = parseInt(targetBarberId);

    // 2. เรียก speak() ก่อน setState ทันที — ยังอยู่ใน event handler
    const targetBarber = barbers.find(b => b.id === targetBarberId);
    if (targetBarber) {
      if (!targetBarber.currentCustomer) {
        speak(`มีการจองคิวใหม่ คุณ ${name} ตัดกับ ${targetBarber.name} ไม่มีคิว เชิญตัดได้เลยค่ะ`);
      } else {
        speak(`มีการจองคิวใหม่ คุณ ${name} ตัดกับ ${targetBarber.name} ได้คิวที่ ${targetBarber.queue.length + 1} ค่ะ`);
      }
    }

    // 3. อัปเดต state หลัง speak()
    setBarbers(prev => prev.map(barber => {
      if (barber.id !== targetBarberId) return barber;
      if (!barber.currentCustomer) {
        return { ...barber, currentCustomer: { name, phone, id: Date.now() } };
      } else {
        return { ...barber, queue: [...barber.queue, { name, phone, id: Date.now() }] };
      }
    }));
  };

  const handleFinish = (barberId) => {
    // 1. หาข้อมูลก่อน
    const targetBarber = barbers.find(b => b.id === barberId);

    // 2. เรียก speak() ก่อน setState ทันที — ยังอยู่ใน event handler
    if (targetBarber?.queue.length > 0) {
      speak(`เชิญคิวต่อไป คุณ ${targetBarber.queue[0].name} ที่ ${targetBarber.name} ค่ะ`);
    }

    // 3. อัปเดต state หลัง speak()
    setBarbers(prev => prev.map(barber => {
      if (barber.id !== barberId) return barber;
      if (barber.queue.length > 0) {
        const [nextCustomer, ...newQueue] = barber.queue;
        return { ...barber, currentCustomer: nextCustomer, queue: newQueue };
      }
      return { ...barber, currentCustomer: null };
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
