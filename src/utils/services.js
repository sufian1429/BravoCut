// src/utils/services.js
// รายการบริการที่ลูกค้าเลือกได้ (เลือกได้หลายอย่างพร้อมกันในการจองครั้งเดียว)

export const SERVICES = [
  { id: 'haircut', icon: '✂️', minutes: 45 },
  { id: 'beard',   icon: '🪒', minutes: 30 },
  { id: 'wash',    icon: '🧴', minutes: 20 },
];

/**
 * รวมเวลาทั้งหมด (นาที) จาก id บริการที่เลือก
 */
export function totalMinutes(serviceIds = []) {
  return serviceIds.reduce((sum, id) => {
    const s = SERVICES.find(s => s.id === id);
    return sum + (s ? s.minutes : 0);
  }, 0);
}

export function getService(id) {
  return SERVICES.find(s => s.id === id) || null;
}

export const AVG_FALLBACK_MIN = 40; // ใช้เผื่อข้อมูลเก่าที่ยังไม่มี services ผูกอยู่

/** เวลาที่ลูกค้าคนนี้ใช้ (นาที) — คำนวณจาก services ถ้ามี ไม่งั้น fallback ค่าเฉลี่ยเดิม */
export function customerDuration(customer) {
  if (customer?.services?.length) return totalMinutes(customer.services);
  return AVG_FALLBACK_MIN;
}
