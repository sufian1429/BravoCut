import React from 'react';
import { CheckCircle, Phone, Scissors } from 'lucide-react';

export default function BarberView({ barbers, onFinish }) {
  return (
    <div>
      {/* Banner แจ้งเตือน */}
      <div className="bg-yellow-600/10 border border-yellow-700/30 text-yellow-500 p-4 rounded-xl mb-6 flex items-center gap-3">
        <div className="bg-yellow-600/20 p-2 rounded-lg shrink-0">
          <Scissors size={18} className="text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold text-yellow-400">โหมดสำหรับช่างตัดผม</h3>
          <p className="text-sm text-neutral-500 mt-0.5">กดปุ่มเมื่อให้บริการเสร็จสิ้น เพื่อเรียกคิวถัดไปอัตโนมัติ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barbers.map(barber => (
          <div
            key={barber.id}
            className="bg-[#111] border border-neutral-800/80 rounded-xl p-6 flex flex-col items-center text-center card-gold-glow transition-all duration-300"
          >
            {/* avatar */}
            <div className="w-14 h-14 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
              🧑🏻‍🦱
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-4">{barber.name}</h3>

            {/* ข้อมูลลูกค้า */}
            <div className="w-full bg-neutral-950 rounded-xl p-4 mb-5 min-h-[110px] flex flex-col justify-center items-center border border-neutral-800/60">
              {barber.currentCustomer ? (
                <>
                  <span className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-2">ลูกค้าปัจจุบัน</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                    {barber.currentCustomer.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                    <Phone size={12} className="text-yellow-700" />
                    {barber.currentCustomer.phone}
                  </div>
                  {barber.queue.length > 0 && (
                    <span className="text-xs text-neutral-600 mt-2.5">
                      คิวรออีก <span className="text-yellow-700 font-semibold">{barber.queue.length}</span> คิว
                    </span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-700">
                  <Scissors size={20} className="opacity-30" />
                  <span className="text-sm">เก้าอี้ว่าง</span>
                </div>
              )}
            </div>

            {/* ปุ่มตัดเสร็จ */}
            <button
              onClick={() => onFinish(barber.id)}
              disabled={!barber.currentCustomer}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                barber.currentCustomer
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/40 active:scale-95'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-700 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={18} />
              ตัดเสร็จเรียบร้อย
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
