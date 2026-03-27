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
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel animate-slide-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-text-primary">Product Configuration</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer">
              <X size={18} className="text-text-tertiary" />
            </button>
          </div>

          <p className="text-[12px] text-text-tertiary mb-6 leading-relaxed">
            Adjust your product parameters mid-simulation. Changes will affect agent evaluations on the next tick.
          </p>

          <div className="space-y-5">
            {/* Price */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-semibold text-text-tertiary tracking-wider uppercase">Price</label>
                <span className="text-[14px] font-mono font-bold text-text-primary">₹{localConfig.price?.toLocaleString()}</span>
              </div>
              <input
                type="range" min="299" max="9999" step="100"
                value={localConfig.price || 1999}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #7C3AED 0%, #3B82F6 ${((localConfig.price - 299) / 9700) * 100}%, rgba(140,140,200,0.08) ${((localConfig.price - 299) / 9700) * 100}%)`,
                }}
              />
            </div>

            {/* Marketing Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-semibold text-text-tertiary tracking-wider uppercase">Marketing Budget</label>
                <span className="text-[14px] font-mono font-bold text-text-primary">₹{((localConfig.marketingBudget || 50000) / 1000).toFixed(0)}k</span>
              </div>
              <input
                type="range" min="10000" max="500000" step="10000"
                value={localConfig.marketingBudget || 50000}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, marketingBudget: parseInt(e.target.value) }))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #7C3AED 0%, #3B82F6 ${(((localConfig.marketingBudget || 50000) - 10000) / 490000) * 100}%, rgba(140,140,200,0.08) ${(((localConfig.marketingBudget || 50000) - 10000) / 490000) * 100}%)`,
                }}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary tracking-wider uppercase block mb-2">Target Audience</label>
              <span className="text-[14px] text-text-primary font-medium">{localConfig.targetAudience}</span>
            </div>

            {/* Features */}
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary tracking-wider uppercase block mb-2">Features</label>
              <div className="flex flex-wrap gap-1.5">
                {(localConfig.features || []).map((f, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-accent-dim text-[11px] text-accent-bright font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleApply} className="gradient-btn w-full py-3 mt-8 text-[14px]">
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
}
