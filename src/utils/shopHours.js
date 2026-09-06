// src/utils/shopHours.js
// Logic เวลาทำการร้าน Bravo Cut — เปิด 10:00 น. ปิด 21:00 น. ทุกวัน

export const OPEN_HOUR       = 10;  // เปิด 10:00
export const CLOSE_HOUR      = 21;  // ปิด  21:00
export const LAST_BOOK_HOUR  = 20;  // ช่วง near-close เริ่ม 20:30
export const LAST_BOOK_MIN   = 30;
export const AVG_CUT_MIN     = 40;  // เฉลี่ย 40 นาทีต่อคิว

/**
 * ร้านเปิดให้บริการอยู่ไหม ณ ขณะนี้
 * เปิด 10:00–21:00 ทุกวัน
 */
export function isShopOpen(now = new Date()) {
  const total = now.getHours() * 60 + now.getMinutes();
  return total >= OPEN_HOUR * 60 && total < CLOSE_HOUR * 60;
}

/**
 * ผ่านเวลาปิดร้านไปแล้วหรือยัง (≥ 21:00)
 * ถ้า true → คิวจะถูกจองเป็นวันถัดไป
 * ก่อน 10:00 ไม่ถือว่าปิด → ยังจองวันนี้ได้ เพราะร้านจะเปิดในวันนี้อยู่ดี
 */
export function isAfterClose(now = new Date()) {
  return now.getHours() >= CLOSE_HOUR;
}

/**
 * ใกล้ปิดหรือเปล่า (10:00–21:00 แต่ ≥ 20:30)
 * ถ้า true → ช่างที่มีคิวหรือกำลังตัดอยู่ถือว่า "รับไม่ทัน"
 */
export function isNearClose(now = new Date()) {
  const h = now.getHours();
  const m = now.getMinutes();
  return isShopOpen(now) && (h > LAST_BOOK_HOUR || (h === LAST_BOOK_HOUR && m >= LAST_BOOK_MIN));
}

/**
 * วันถัดไปที่ร้านเปิด (เปิดทุกวัน)
 * ใช้เฉพาะตอน isAfterClose() === true
 */
export function nextOpenDate(now = new Date()) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(OPEN_HOUR, 0, 0, 0);
  return next;
}

/**
 * format วันที่เป็นข้อความสั้น เช่น "จันทร์ 7 ก.ย."
 */
export function formatNextDay(date, locale = 'th-TH') {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
}

/**
 * ช่างนี้รับจองได้ไหม ณ ช่วง near-close
 * รับได้ก็ต่อเมื่อ: ว่างอยู่ AND ไม่มีคิวรอ
 */
export function barberAcceptsNearClose(barber) {
  return !barber.currentCustomer && barber.queue.length === 0;
}
