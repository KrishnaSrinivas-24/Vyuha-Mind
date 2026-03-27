import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';

function getHeatColor(value) {
  if (value >= 75) return { bg: 'rgba(52,211,153,0.25)', text: '#34D399' };
  if (value >= 55) return { bg: 'rgba(251,191,36,0.2)', text: '#FBBF24' };
  if (value >= 35) return { bg: 'rgba(251,146,60,0.2)', text: '#FB923C' };
  return { bg: 'rgba(248,113,113,0.2)', text: '#F87171' };
}

export function SentimentHeatmap() {
  const { state } = useSimulation();
  const data = state.sentimentHeatmap;
  if (!data || data.length === 0) return null;

  const segments = Object.keys(data[0]).filter(k => k !== 'city');

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <h2 className="text-[13px] font-semibold text-text-primary mb-3">Sentiment Heatmap</h2>
      <div className="flex-1 overflow-auto custom-scroll">
        <table className="w-full text-[11px]">
          <thead>
            <tr>
              <th className="text-left text-text-muted font-medium pb-2 pr-3 sticky top-0 bg-bg-card">City</th>
              {segments.map(s => (
                <th key={s} className="text-center text-text-muted font-medium pb-2 px-1 sticky top-0 bg-bg-card whitespace-nowrap">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.city}>
                <td className="text-text-secondary font-medium py-1.5 pr-3 whitespace-nowrap">{row.city}</td>
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
