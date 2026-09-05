const BookingForm = ({ barbers, onBook }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('any');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    
    // ส่งข้อมูลกลับไปให้ App.js จัดการ
    onBook({ name: customerName, phone: customerPhone, barberId: selectedBarber });
    
    // เคลียร์ฟอร์ม
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <section className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
        <UserPlus className="text-yellow-500" />
        จองคิวตัดผม
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <label className="block text-sm text-neutral-400 mb-1">ชื่อลูกค้า</label>
          <input 
            type="text" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="กรอกชื่อของคุณ..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm text-neutral-400 mb-1">เบอร์โทรศัพท์</label>
          <input 
            type="tel" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="08X-XXX-XXXX"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm text-neutral-400 mb-1">เลือกช่างตัดผม</label>
          <select 
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
          >
            <option value="any">✨ ช่างคนไหนก็ได้</option>
            {barbers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex items-end">
          <button 
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg p-3 transition-colors flex justify-center items-center gap-2"
          >
            จองคิว
          </button>
        </div>
      </form>
      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
        <Volume2 size={14} /> ระบบมีเสียงประกาศอัตโนมัติเมื่อกดจอง
      </div>
    </section>
  );
};