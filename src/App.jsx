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

  // ฟังก์ชันเสียงประกาศ
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
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

  // ในไฟล์ src/App.jsx ตรงส่วน return ให้แก้ className เป็นแบบนี้:
return (
  <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans">
    <Navbar viewMode={viewMode} setViewMode={setViewMode} />
    
    {/* เพิ่ม animate-fade-in เพื่อให้หน้าจอค่อยๆ ปรากฏขึ้นมาอย่างนุ่มนวล */}
    <main className="max-w-4xl mx-auto p-4 py-8 animate-fade-in">
      {viewMode === 'customer' 
        ? <CustomerView barbers={barbers} onBook={handleBook} />
        : <BarberView barbers={barbers} onFinish={handleFinish} />
      }
    </main>
  </div>
);
}