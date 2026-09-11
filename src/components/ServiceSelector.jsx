import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { SERVICES, totalMinutes } from '../utils/services';

// ── ServiceSelector ──────────────────────────────────────────────────────
// ให้ลูกค้าเลือกบริการได้หลายอย่างพร้อมกัน (ตัดผม / ตัดหนวด / สระผม)
// ใช้ร่วมกันทั้งโหมด "เข้าคิวตอนนี้" และ "จองล่วงหน้า"

export default function ServiceSelector({ theme, t, selected, onChange }) {
  const th = theme;

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  const minutes = totalMinutes(selected);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide"
          style={{ color: th.pageText + '60' }}>
          {t.serviceLabel}
        </label>
        {minutes > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: th.accent }}>
            <Clock size={11} /> {t.durationLabel(minutes)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SERVICES.map(s => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all active:scale-95"
              style={{
                backgroundColor: active ? `${th.accent}18` : th.inputBg,
                border: active ? `1.5px solid ${th.accent}` : `1px solid ${th.inputBorder}`,
              }}
            >
              {active
                ? <CheckCircle2 size={17} style={{ color: th.accent }} className="shrink-0" />
                : <Circle size={17} style={{ color: th.pageText + '40' }} className="shrink-0" />}
              <span className="text-lg leading-none">{s.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate" style={{ color: th.pageText }}>
                  {t.serviceNames[s.id]}
                </div>
                <div className="text-[11px]" style={{ color: th.pageText + '55' }}>
                  {s.minutes} {t.minUnit}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
