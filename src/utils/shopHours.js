// src/utils/shopHours.js
// Logic เวลาทำการร้าน Bravo Cut — เปิด 10:00 น. ปิด 21:00 น.

export const OPEN_HOUR  = 10;   // เปิด 10:00
export const CLOSE_HOUR = 21;   // ปิด  21:00
export const LAST_BOOK_HOUR = 20;  // หยุดรับจอง 20:30
export const LAST_BOOK_MIN  = 30;
export const AVG_CUT_MIN    = 40;  // ประมาณ 40 นาทีต่อคิว

/** ตอนนี้ร้านเปิดอยู่ไหม */
export function isShopOpen(now = new Date()) {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;
  return totalMin >= OPEN_HOUR * 60 && totalMin < CLOSE_HOUR * 60;
}

/**
 * ใกล้ปิดหรือเปล่า (≥ 20:30)
 * ถ้า true → ช่างที่มีคิวหรือกำลังตัดอยู่ถือว่า "รับไม่ทัน"
 */
export function isNearClose(now = new Date()) {
  const h = now.getHours();
  const m = now.getMinutes();
  return h > LAST_BOOK_HOUR || (h === LAST_BOOK_HOUR && m >= LAST_BOOK_MIN);
}

/**
 * วันถัดไปที่ร้านเปิด (เปิดทุกวัน)
 * คืน Date ที่ตั้งเวลาเป็น 10:00 น.
 */
export function nextOpenDate(now = new Date()) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(OPEN_HOUR, 0, 0, 0);
  return next;
}

/**
 * format วันที่เป็นข้อความ เช่น "พรุ่งนี้ (พฤ 8 ม.ค.)"
 */
export function formatNextDay(date, locale = 'th-TH') {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * ช่างนี้รับจองได้ไหม ณ เวลา near-close
 * รับได้ก็ต่อเมื่อ: ว่างอยู่ AND ไม่มีคิวรอ
 */
export function barberAcceptsNearClose(barber) {
  return !barber.currentCustomer && barber.queue.length === 0;
}
