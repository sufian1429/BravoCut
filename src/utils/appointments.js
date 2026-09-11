// src/utils/appointments.js
// ระบบจองเวลาล่วงหน้า (เลือกวันที่ + เวลา กับช่างที่ระบุ)
// ทำงานคู่กับระบบคิว walk-in เดิม โดยไม่ยุ่งกับ barbers[].queue

import { OPEN_HOUR, CLOSE_HOUR } from './shopHours';

const SLOT_STEP_MIN = 15; // ระยะห่างของเวลานัดที่เลือกได้ (นาที)
const MIN_LEAD_MIN  = 15; // ต้องจองล่วงหน้าอย่างน้อยกี่นาทีถ้าเป็นวันนี้

/** แปลง Date → key แบบ YYYY-MM-DD (ใช้ local time ไม่ใช่ UTC) */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** ช่วง [startMin, startMin+durationMin) ทับซ้อนกับนัด appt ไหม */
function overlaps(startMin, durationMin, appt) {
  const apptStart = hhmmToMinutes(appt.time);
  const apptEnd = apptStart + appt.durationMin;
  const newEnd = startMin + durationMin;
  return startMin < apptEnd && newEnd > apptStart;
}

/**
 * คืนรายการเวลา (HH:mm) ที่ช่างคนนี้ว่างในวันที่กำหนด สำหรับ duration นาทีที่ระบุ
 */
export function getAvailableSlots({ dateKey, barberId, durationMin, appointments, now = new Date() }) {
  if (!durationMin || durationMin <= 0) return [];
  const slots = [];
  const isToday = dateKey === toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const dayAppts = appointments.filter(a => a.barberId === barberId && a.dateKey === dateKey);

  for (let t = OPEN_HOUR * 60; t + durationMin <= CLOSE_HOUR * 60; t += SLOT_STEP_MIN) {
    if (isToday && t < nowMin + MIN_LEAD_MIN) continue;
    const conflict = dayAppts.some(a => overlaps(t, durationMin, a));
    if (!conflict) slots.push(minutesToHHMM(t));
  }
  return slots;
}

/** หาช่างที่ว่างเวลานี้ (ใช้ตอนลูกค้าเลือก "ช่างคนไหนก็ได้") — คืน barberId แรกที่ว่าง หรือ null */
export function findAnyAvailableBarber({ dateKey, time, durationMin, barberIds, appointments }) {
  const startMin = hhmmToMinutes(time);
  for (const barberId of barberIds) {
    const dayAppts = appointments.filter(a => a.barberId === barberId && a.dateKey === dateKey);
    const conflict = dayAppts.some(a => overlaps(startMin, durationMin, a));
    if (!conflict) return barberId;
  }
  return null;
}

/** เช็คซ้ำก่อนบันทึกจริงว่าช่วงเวลานี้ยังว่างอยู่ไหม (กันกรณีข้อมูลเปลี่ยนระหว่างเลือก) */
export function isSlotAvailable({ dateKey, time, barberId, durationMin, appointments }) {
  const startMin = hhmmToMinutes(time);
  const dayAppts = appointments.filter(a => a.barberId === barberId && a.dateKey === dateKey);
  return !dayAppts.some(a => overlaps(startMin, durationMin, a));
}

/** แปลง dateKey (YYYY-MM-DD) เป็นข้อความวันที่อ่านง่าย เช่น "อังคาร 15 ก.ย." — ข้ามวัน/เดือน/ปีได้ */
export function dateKeyToLabel(dateKey, locale = 'th-TH') {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** ตัวเลือกวันที่ (วันนี้ + N วันถัดไป) สำหรับให้ลูกค้าเลือก */
export function upcomingDateOptions(days = 7, now = new Date(), locale = 'th-TH') {
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    out.push({
      dateKey: toDateKey(d),
      label: d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
      isToday: i === 0,
    });
  }
  return out;
}
