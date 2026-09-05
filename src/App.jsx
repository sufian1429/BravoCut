import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CustomerView from './views/CustomerView';
import BarberView from './views/BarberView';

export default function App() {
  const [viewMode, setViewMode] = useState('customer');
  const [barbers, setBarbers] = useState([
    { id: 1, name: 'ช่างเอ (A)', currentCustomer: null, queue: [] },
    { id: 2, name: 'ช่างบี (B)', currentCustomer: null, queue: [] },
    { id: 3, name: 'ช่างซี (C)', currentCustomer: null, queue: [] },
    { id: 4, name: 'ช่างดี (D)', currentCustomer: null, queue: [] },
  ]);

  // ฟังก์ชันเสียงประกาศ (เสียงเด็กผู้หญิง)
  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;

    // หยุดเสียงเก่าก่อน แล้วค่อยพูดใหม่
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.pitch = 1.8;   // เสียงสูงขึ้น (0 = ต่ำ, 2 = สูงสุด)
    utterance.volume = 1;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      // หาเสียงผู้หญิงภาษาไทยก่อน
      const thFemale = voices.find(v =>
        v.lang.startsWith('th') && v.name.toLowerCase().includes('female')
      );
      // ถ้าไม่มี ใช้เสียงไทยทั่วไป
      const thAny = voices.find(v => v.lang.startsWith('th'));
      // ถ้าไม่มีเสียงไทยเลย ใช้เสียงผู้หญิงภาษาอังกฤษ
      const enFemale = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira'))
      );

      utterance.voice = thFemale || thAny || enFemale || null;
      window.speechSynthesis.speak(utterance);
    };

    // voices อาจยังโหลดไม่เสร็จตอน mount
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  };

  const handleBook = ({ name, phone, barberId }) => {
    let targetBarberId = barberId;

    if (targetBarberId === 'any') {
      const freeBarber = barbers.find(b => !b.currentCustomer);
      if (freeBarber) {
        targetBarberId = freeBarber.id;
      } else {
        let minQueue = Infinity;
        let bestBarber = null;
        barbers.forEach(b => {
          if (b.queue.length < minQueue) {
            minQueue = b.queue.length;
            bestBarber = b;
          }
        });
        targetBarberId = bestBarber.id;
      }
    }

    targetBarberId = parseInt(targetBarberId);

    const updatedBarbers = barbers.map(barber => {
      if (barber.id === targetBarberId) {
        if (!barber.currentCustomer) {
          speak(`มีการจองคิวใหม่ คุณ ${name} ตัดกับ ${barber.name} ไม่มีคิว เชิญตัดได้เลยค่ะ`);
          return { ...barber, currentCustomer: { name, phone, id: Date.now() } };
        } else {
          const queuePosition = barber.queue.length + 1;
          speak(`มีการจองคิวใหม่ คุณ ${name} ตัดกับ ${barber.name} ได้คิวที่ ${queuePosition} ค่ะ`);
          return { ...barber, queue: [...barber.queue, { name, phone, id: Date.now() }] };
        }
      }
      return barber;
    });

    setBarbers(updatedBarbers);
  };

  const handleFinish = (barberId) => {
    const updatedBarbers = barbers.map(barber => {
      if (barber.id === barberId) {
        if (barber.queue.length > 0) {
          const nextCustomer = barber.queue[0];
          const newQueue = barber.queue.slice(1);
          speak(`เชิญคิวต่อไป คุณ ${nextCustomer.name} ที่ ${barber.name} ค่ะ`);
          return { ...barber, currentCustomer: nextCustomer, queue: newQueue };
        } else {
          return { ...barber, currentCustomer: null };
        }
      }
      return barber;
    });
    setBarbers(updatedBarbers);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans">
      <Navbar viewMode={viewMode} setViewMode={setViewMode} />
      <main className="max-w-4xl mx-auto p-4 py-8 animate-fade-in">
        {viewMode === 'customer'
          ? <CustomerView barbers={barbers} onBook={handleBook} />
          : <BarberView barbers={barbers} onFinish={handleFinish} />
        }
      </main>
    </div>
  );
}
