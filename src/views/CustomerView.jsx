import React, { useState } from 'react';
import { User, Clock, Volume2, UserPlus, Info, Globe } from 'lucide-react';
import { locales } from '../utils/locales';

export default function CustomerView({ barbers, onBook }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [lang, setLang] = useState('th');

  const t = locales[lang];

  const getEstimatedTime = (queueIndex) => {
    const avgMinutesPerCut = 40;
    const waitMinutes = (queueIndex + 1) * avgMinutesPerCut;
    const estimateDate = new Date();
    estimateDate.setMinutes(estimateDate.getMinutes() + waitMinutes);
    const timeStr = estimateDate.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });
    return t.estimatedTime(timeStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    onBook({ name: customerName, phone: customerPhone, barberId: selectedBarber });
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="space-y-8">

      {/* ปุ่มเลือกภาษา */}
      <div className="flex items-center justify-end gap-2">
        <Globe size={16} className="text-neutral-400" />
        {Object.entries(locales).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              lang === key
                ? 'bg-yellow-600 text-black'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {val.flag} {val.label}
          </button>
        ))}
      </div>

      {/* ฟอร์มจองคิว */}
      <section className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
          <UserPlus className="text-yellow-500" /> {t.bookingTitle}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm text-neutral-400 mb-1">{t.labelName}</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t.placeholderName}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-neutral-400 mb-1">{t.labelPhone}</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={t.placeholderPhone}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-neutral-400 mb-1">{t.labelBarber}</label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 appearance-none"
            >
              <option value="any">{t.anyBarber}</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg p-3 flex justify-center items-center transition-colors"
            >
              {t.bookBtn}
            </button>
          </div>
        </form>
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <Volume2 size={14} /> {t.voiceNote}
        </div>
      </section>

      {/* สถานะคิวปัจจุบัน */}
      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
          <Clock className="text-yellow-500" /> {t.queueTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barbers.map(barber => (
            <div key={barber.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4 border-b border-neutral-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center text-xl">🧑🏻‍🦱</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                    {barber.currentCustomer ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full mt-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {t.serving}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {t.available}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                {barber.currentCustomer ? (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-400 mb-1">{t.cuttingNow}</p>
                    <div className="bg-neutral-900 rounded-lg p-3 flex items-center gap-3 border-l-4 border-yellow-500">
                      <User size={18} className="text-yellow-600" />
                      <span className="font-medium text-white">{barber.currentCustomer.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center py-4 text-neutral-500">{t.noCustomer}</div>
                )}

                {barber.queue.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">{t.queueWaiting(barber.queue.length)}</p>
                    <div className="space-y-2">
                      {barber.queue.map((q, index) => (
                        <div key={q.id} className="bg-neutral-900/50 rounded-lg p-3 text-sm flex flex-col gap-1 border border-neutral-800">
                          <div className="flex items-center gap-2">
                            <span className="bg-neutral-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">{index + 1}</span>
                            <span className="font-medium text-neutral-200">{q.name}</span>
                          </div>
                          <div className="pl-7 text-xs text-yellow-600/80 flex items-center gap-1">
                            <Info size={12} /> {getEstimatedTime(index)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
