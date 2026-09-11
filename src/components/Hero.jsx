import { Scissors, ArrowRight } from 'lucide-react';

// ── Hero Section (หน้าแรก) ───────────────────────────────────────────────
// หน้าแรกที่ลูกค้าเห็นเมื่อเข้าเว็บ แสดง "ภาพเคลื่อนไหวอย่างเดียว" — ไม่มี
// ฟอร์มจองหรือสถานะคิวปะปนอยู่ในหน้านี้เลย ไม่มีไฟล์วิดีโอจริง จึงสร้าง
// ภาพเคลื่อนไหวด้วย CSS ล้วน (ลายเสาไฟบาร์เบอร์หมุน + วงแสงลอย) แทน
// ปุ่ม "จองคิวเลย" จะพาไปหน้าสอง (ระบบจองคิว) ผ่าน onCtaClick

export default function Hero({ theme, t, onCtaClick }) {
  const th = theme;

  return (
    <section
      className="relative overflow-hidden rounded-2xl min-h-[70vh] sm:min-h-[75vh] flex items-center justify-center"
      style={{ border: `1px solid ${th.cardBorder}`, boxShadow: th.cardGlow }}
    >
      <style>{`
        @keyframes bc-pole-spin {
          from { background-position: 0 0; }
          to   { background-position: 0 80px; }
        }
        @keyframes bc-orb-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(24px, -18px) scale(1.12); }
        }
        @keyframes bc-orb-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20px, 16px) scale(1.08); }
        }
        @keyframes bc-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bc-bounce {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(4px); }
        }
        .bc-hero-pole {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg,
            var(--bc-a) 0px, var(--bc-a) 14px,
            var(--bc-b) 14px, var(--bc-b) 28px,
            var(--bc-c) 28px, var(--bc-c) 42px
          );
          background-size: 80px 80px;
          animation: bc-pole-spin 3.5s linear infinite;
          opacity: 0.16;
        }
        .bc-hero-orb-a { animation: bc-orb-float-a 7s ease-in-out infinite; }
        .bc-hero-orb-b { animation: bc-orb-float-b 8.5s ease-in-out infinite; }
        .bc-hero-content { animation: bc-fade-up 0.6s ease-out; }
        .bc-hero-arrow { animation: bc-bounce 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bc-hero-pole, .bc-hero-orb-a, .bc-hero-orb-b, .bc-hero-content, .bc-hero-arrow { animation: none; }
        }
      `}</style>

      {/* พื้นหลังไล่สี */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${th.pageBg}, ${th.cardBg})` }}
      />

      {/* ลายเสาไฟบาร์เบอร์หมุน */}
      <div
        className="bc-hero-pole"
        style={{ '--bc-a': th.accentFrom, '--bc-b': th.pageText, '--bc-c': th.accentTo }}
      />

      {/* วงแสงลอย */}
      <div
        className="bc-hero-orb-a absolute -top-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 rounded-full blur-3xl"
        style={{ background: th.accentFrom, opacity: 0.25 }}
      />
      <div
        className="bc-hero-orb-b absolute -bottom-14 -right-10 w-52 h-52 sm:w-72 sm:h-72 rounded-full blur-3xl"
        style={{ background: th.accentTo, opacity: 0.22 }}
      />

      {/* เนื้อหา */}
      <div className="bc-hero-content relative px-5 sm:px-10 py-10 flex flex-col items-center text-center gap-3 sm:gap-4">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-1 shadow-lg"
          style={{ background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})` }}
        >
          <Scissors size={30} style={{ color: th.accentText }} />
        </div>

        <h1
          className="font-display font-black tracking-widest text-4xl sm:text-6xl"
          style={{ color: th.pageText }}
        >
          {t.heroTitle}
        </h1>

        <p
          className="text-sm sm:text-lg max-w-md"
          style={{ color: th.pageText + '80' }}
        >
          {t.heroSubtitle}
        </p>

        <button
          onClick={onCtaClick}
          className="mt-3 font-bold rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base flex items-center gap-2 transition-transform active:scale-95 hover:scale-[1.03]"
          style={{
            background: `linear-gradient(135deg,${th.accentFrom},${th.accentTo})`,
            color: th.accentText,
            boxShadow: `0 6px 20px ${th.accentShadow}`,
          }}
        >
          {t.heroCta}
          <ArrowRight size={18} className="bc-hero-arrow" />
        </button>
      </div>
    </section>
  );
}
