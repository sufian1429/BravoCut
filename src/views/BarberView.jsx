import React from 'react';
import { CheckCircle, Phone } from 'lucide-react';

export default function BarberView({ barbers, onFinish }) {
  return (
    <div>
      <div className="bg-yellow-600/10 border border-yellow-600/30 text-yellow-500 p-4 rounded-xl mb-6 flex items-center gap-3">
        <CheckCircle />
        <div>
          <h3 className="font-bold">โหมดสำหรับช่างตัดผม</h3>
          <p className="text-sm text-neutral-400">กดเมื่อให้บริการเสร็จสิ้น เพื่อเรียกคิวถัดไป</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barbers.map(barber => (
          <div key={barber.id} className="bg-neutral-800 border-2 border-neutral-700 rounded-xl p-6 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{barber.name}</h3>
            
            <div className="w-full bg-neutral-900 rounded-lg p-4 mb-6 min-h-[120px] flex flex-col justify-center items-center">
              {barber.currentCustomer ? (
                <>
                  <span className="text-neutral-400 text-sm mb-1">ลูกค้าปัจจุบัน</span>
                  <span className="text-xl font-bold text-yellow-500 mb-2">{barber.currentCustomer.name}</span>
                  <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800 px-3 py-1 rounded-full">
                    <Phone size={14} /> {barber.currentCustomer.phone}
                  </div>
                  <span className="text-xs text-neutral-500 mt-3">มีคิวรออีก {barber.queue.length} คิว</span>
                </>
              ) : (
                <span className="text-neutral-500">เก้าอี้ว่าง</span>
              )}
            </div>

            <button
              onClick={() => onFinish(barber.id)}
              disabled={!barber.currentCustomer}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                barber.currentCustomer 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                  : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle />
              ตัดเสร็จเรียบร้อย
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}