import { useSimulation } from '../../context/SimulationContext';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProductConfig({ isOpen, onClose }) {
  const { state, actions } = useSimulation();
  const [localConfig, setLocalConfig] = useState(state.productConfig);

  useEffect(() => {
    setLocalConfig(state.productConfig);
  }, [state.productConfig]);

  if (!isOpen) return null;

  const handleApply = () => {
    actions.updateProduct(localConfig);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-surface border-l border-border shadow-2xl z-50 animate-slide-in flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto custom-scroll">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-text-main">Product Configuration</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-raised transition-colors cursor-pointer">
              <X size={18} className="text-text-muted" />
            </button>
          </div>

          <p className="text-[12px] text-text-muted mb-6 leading-relaxed">
            Adjust your product parameters mid-simulation. Changes will affect agent evaluations on the next tick.
          </p>

          <div className="space-y-6">
            {/* Price */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-semibold text-text-faint tracking-wider uppercase">Price</label>
                <span className="text-[14px] font-mono font-bold text-text-main">₹{localConfig.price?.toLocaleString()}</span>
              </div>
              <input
                type="range" min="299" max="9999" step="100"
                value={localConfig.price || 1999}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Marketing Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-semibold text-text-faint tracking-wider uppercase">Marketing Budget</label>
                <span className="text-[14px] font-mono font-bold text-text-main">₹{((localConfig.marketingBudget || 50000) / 1000).toFixed(0)}k</span>
              </div>
              <input
                type="range" min="10000" max="500000" step="10000"
                value={localConfig.marketingBudget || 50000}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, marketingBudget: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-[11px] font-semibold text-text-faint tracking-wider uppercase block mb-2">Target Audience</label>
              <span className="text-[14px] text-text-main font-medium">{localConfig.targetAudience}</span>
            </div>

            {/* Features */}
            <div>
              <label className="text-[11px] font-semibold text-text-faint tracking-wider uppercase block mb-2">Features</label>
              <div className="flex flex-wrap gap-1.5">
                {(localConfig.features || []).map((f, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-surface-raised border border-border text-[11px] text-text-muted font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border bg-surface">
          <button onClick={handleApply} className="neo-btn bg-primary hover:bg-primary-light text-white w-full py-3 text-[14px] glow-primary">
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
}
