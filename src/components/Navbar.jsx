import React from 'react';
import { Scissors } from 'lucide-react';

export default function Navbar({ viewMode, setViewMode }) {
  return (
    <nav className="bg-black border-b border-yellow-600/30 p-4 sticky top-0 z-10 shadow-lg shadow-yellow-900/10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-600 p-2 rounded-lg text-black">
            <Scissors size={24} />
          </div>
          <h1 className="text-2xl font-bold text-yellow-500 tracking-wider">BRAVO CUT</h1>
        </div>
        
        <div className="flex bg-neutral-800 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('customer')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${viewMode === 'customer' ? 'bg-yellow-600 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            โหมดลูกค้า
          </button>
          <button 
            onClick={() => setViewMode('barber')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${viewMode === 'barber' ? 'bg-yellow-600 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            โหมดช่าง/แอดมิน
          </button>
        </div>
      </div>
    </nav>
  );
}