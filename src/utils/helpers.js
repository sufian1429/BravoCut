
// ฟังก์ชันประกาศเสียง
const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// คำนวณเวลาที่ต้องรอ
const getEstimatedTime = (queueIndex) => {
  const avgMinutesPerCut = 40;
  const waitMinutes = (queueIndex + 1) * avgMinutesPerCut; 
  const estimateDate = new Date();
  estimateDate.setMinutes(estimateDate.getMinutes() + waitMinutes);
  const timeStr = estimateDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return `ประเมินเวลาได้ตัด: ${timeStr} น. (รอประมาณ ${waitMinutes} นาที)`;
};