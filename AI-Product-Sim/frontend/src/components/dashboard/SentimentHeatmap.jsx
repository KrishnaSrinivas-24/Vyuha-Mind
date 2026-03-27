import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';

function getHeatColor(value) {
  if (value >= 75) return { bg: 'rgba(16,185,129,0.20)', text: '#10b981' };
  if (value >= 55) return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
  if (value >= 35) return { bg: 'rgba(245,158,11,0.08)', text: '#fcd34d' };
  return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
}

export function SentimentHeatmap() {
  const { state } = useSimulation();
  const data = state.sentimentHeatmap;
  if (!data || data.length === 0) return null;

  const segments = Object.keys(data[0]).filter(k => k !== 'city');

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <h2 className="text-[13px] font-bold text-text-main mb-3 tracking-tight">Sentiment Heatmap</h2>
      <div className="flex-1 overflow-auto custom-scroll">
        <table className="w-full text-[11px]">
          <thead>
            <tr>
              <th className="text-left text-text-muted font-medium pb-2 pr-3 sticky top-0 bg-surface">City</th>
              {segments.map(s => (
                <th key={s} className="text-center text-text-muted font-medium pb-2 px-1 sticky top-0 bg-surface whitespace-nowrap">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.city}>
                <td className="text-text-muted font-medium py-1.5 pr-3 whitespace-nowrap">{row.city}</td>
                {segments.map(s => {
                  const val = row[s];
                  const color = getHeatColor(val);
                  return (
                    <td key={s} className="text-center py-1.5 px-1">
                      <span
                        className="inline-block w-9 py-0.5 rounded font-mono font-semibold text-[10px] transition-all duration-700"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        {val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
