import React from 'react';
import { CheckCircle, Phone, Scissors } from 'lucide-react';

export default function BarberView({ barbers, onFinish, theme }) {
  const th = theme;

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

      {/* Grid ช่าง — 1 col มือถือ / 2 col tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {barbers.map(barber => (
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
              {barber.currentCustomer ? (
                <>
                  <span className="text-[10px] font-medium uppercase tracking-widest mb-1"
                    style={{ color: th.pageText + '50' }}>ลูกค้าปัจจุบัน</span>
                  <span className="text-base sm:text-lg font-bold mb-1.5" style={{ color: th.accentFrom }}>
                    {barber.currentCustomer.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ color: th.pageText + '60', backgroundColor: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                    <Phone size={11} style={{ color: th.accent + '80' }} />
                    {barber.currentCustomer.phone}
                  </div>
                  {barber.queue.length > 0 && (
                    <span className="text-xs mt-2" style={{ color: th.pageText + '45' }}>
                      คิวรออีก <span className="font-semibold" style={{ color: th.accent }}>{barber.queue.length}</span> คิว
                    </span>
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
              onClick={() => onFinish(barber.id)}
              disabled={!barber.currentCustomer}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
              style={barber.currentCustomer
                ? { background: 'linear-gradient(135deg,#34d399,#059669)', color: '#fff', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }
                : { backgroundColor: th.inputBg, border: `1px solid ${th.cardBorder}`, color: th.pageText + '30', cursor: 'not-allowed' }
              }>
              <CheckCircle size={16} />
              ตัดเสร็จเรียบร้อย
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
