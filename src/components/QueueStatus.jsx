const QueueStatus = ({ barbers }) => (
  <section>
    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
      <Clock className="text-yellow-500" />
      สถานะคิวปัจจุบัน
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {barbers.map(barber => (
        <div key={barber.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5 flex flex-col h-full">
          {/* หัวข้อช่าง */}
          <div className="flex justify-between items-start mb-4 border-b border-neutral-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center text-xl shadow-inner">
                🧑🏻‍🦱
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                {barber.currentCustomer ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>กำลังให้บริการ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>ว่างพร้อมตัด
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* รายละเอียดลูกค้าปัจจุบัน */}
          <div className="flex-grow">
            {barber.currentCustomer ? (
              <div className="mb-4">
                <p className="text-sm text-neutral-400 mb-1">กำลังตัดผม:</p>
                <div className="bg-neutral-900 rounded-lg p-3 flex items-center gap-3 border-l-4 border-yellow-500">
                  <User size={18} className="text-yellow-600" />
                  <span className="font-medium text-white">{barber.currentCustomer.name}</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 text-center py-4 text-neutral-500">ไม่มีลูกค้ากำลังตัด</div>
            )}

            {/* รายชื่อคิวรอ */}
            {barber.queue.length > 0 && (
              <div>
                <p className="text-sm text-neutral-400 mb-2">คิวรอถัดไป ({barber.queue.length})</p>
                <div className="space-y-2">
                  {barber.queue.map((q, index) => (
                    <div key={q.id} className="bg-neutral-900/50 rounded-lg p-3 text-sm flex flex-col gap-1 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="bg-neutral-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">{index + 1}</span>
                        <span className="font-medium text-neutral-200">{q.name}</span>
                      </div>
                      <div className="pl-7 text-xs text-yellow-600/80 flex items-center gap-1">
                        <Info size={12}/> {getEstimatedTime(index)}
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
);