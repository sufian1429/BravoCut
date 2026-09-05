import React, { useState, useRef, useEffect } from 'react';
import { User, Clock, Volume2, UserPlus, Info, Globe, ChevronDown } from 'lucide-react';
import { locales } from '../utils/locales';

export default function CustomerView({ barbers, onBook }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('any');
  const [lang, setLang] = useState('th');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const t = locales[lang];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLang = (key) => { setLang(key); setDropdownOpen(false); };

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

      {/* Dropdown ภาษา */}
      <div className="flex justify-end">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-yellow-700/60 rounded-lg text-sm font-medium text-neutral-300 transition-all duration-200"
          >
            <Globe size={14} className="text-yellow-600" />
            <span>{locales[lang].flag} {locales[lang].label}</span>
            <ChevronDown size={13} className={`text-neutral-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#111] border border-neutral-800 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-slide-up">
              {/* เส้นทองหัว dropdown */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-yellow-700 to-transparent" />
              {Object.entries(locales).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleSelectLang(key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    lang === key
                      ? 'bg-gradient-to-r from-yellow-700/30 to-transparent text-yellow-400 font-semibold border-l-2 border-yellow-500'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{val.flag}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ฟอร์มจองคิว */}
      <section className="bg-[#111] border border-neutral-800/80 rounded-2xl p-6 shadow-2xl shadow-black/50 card-gold-glow transition-all duration-300">
        {/* หัวข้อ section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-600/15 p-2 rounded-lg">
            <UserPlus size={20} className="text-yellow-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">{t.bookingTitle}</h2>
        </div>
        <div className="gold-line mb-6 opacity-40" />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 tracking-wider uppercase">{t.labelName}</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t.placeholderName}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-700 focus:outline-none focus:border-yellow-600/70 focus:ring-1 focus:ring-yellow-600/30 transition-all"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 tracking-wider uppercase">{t.labelPhone}</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={t.placeholderPhone}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-700 focus:outline-none focus:border-yellow-600/70 focus:ring-1 focus:ring-yellow-600/30 transition-all"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5 tracking-wider uppercase">{t.labelBarber}</label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-600/70 focus:ring-1 focus:ring-yellow-600/30 transition-all appearance-none"
            >
              <option value="any">{t.anyBarber}</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-lg py-3 transition-all duration-200 shadow-lg shadow-yellow-900/40 hover:shadow-yellow-700/50 active:scale-95"
            >
              {t.bookBtn}
            </button>
          </div>
        </form>

        <div className="mt-5 flex items-center gap-2 text-xs text-neutral-700">
          <Volume2 size={13} className="text-yellow-800" /> {t.voiceNote}
        </div>
      </section>

      {/* สถานะคิว */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-600/15 p-2 rounded-lg">
            <Clock size={20} className="text-yellow-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">{t.queueTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="bg-[#111] border border-neutral-800/80 rounded-xl p-5 flex flex-col h-full card-gold-glow transition-all duration-300"
            >
              {/* หัวช่าง */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-800/80">
                <div className="w-11 h-11 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center text-lg border border-neutral-700/50 shadow-inner">
                  🧑🏻‍🦱
                </div>
                <div>
                  <h3 className="font-semibold text-white">{barber.name}</h3>
                  {barber.currentCustomer ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {t.serving}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t.available}
                    </span>
                  )}
                </div>
              </div>

              {/* ลูกค้าปัจจุบัน */}
              <div className="flex-grow">
                {barber.currentCustomer ? (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">{t.cuttingNow}</p>
                    <div className="bg-neutral-950 rounded-lg px-4 py-3 flex items-center gap-3 border-l-2 border-yellow-600">
                      <User size={16} className="text-yellow-600 shrink-0" />
                      <span className="font-semibold text-white text-sm">{barber.currentCustomer.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 py-5 text-center text-neutral-700 text-sm border border-dashed border-neutral-800 rounded-lg">
                    {t.noCustomer}
                  </div>
                )}

                {/* คิวรอ */}
                {barber.queue.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">{t.queueWaiting(barber.queue.length)}</p>
                    <div className="space-y-2">
                      {barber.queue.map((q, index) => (
                        <div key={q.id} className="bg-neutral-950/70 rounded-lg px-3 py-2.5 flex flex-col gap-1 border border-neutral-800/60">
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-700/30 text-yellow-500 border border-yellow-700/40 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0">
                              {index + 1}
                            </span>
                            <span className="font-medium text-neutral-200 text-sm">{q.name}</span>
                          </div>
                          <div className="pl-7 text-xs text-neutral-600 flex items-center gap-1">
                            <Info size={11} className="text-yellow-800" /> {getEstimatedTime(index)}
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
