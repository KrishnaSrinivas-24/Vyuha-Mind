import React, { useState } from 'react';

export default function A2UIControls() {
  const [activeTab, setActiveTab] = useState('price');

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex border-b border-white/10 mb-4">
        {['price', 'feature'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-emerald-400 text-emerald-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {activeTab === 'price' && (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Base Price ($)</label>
            <input type="range" min="10" max="1000" className="w-full accent-emerald-500" />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>Low</span>
              <span>Premium</span>
            </div>
          </div>
        )}
      </div>

      <button className="w-full py-3 mt-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded text-emerald-400 font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
        Inject Parameter
      </button>
    </div>
  );
}
