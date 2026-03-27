import { useSimulation } from '../../context/SimulationContext';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

const SPEEDS = [1, 2, 5, 10];

export function SimulationControls() {
  const { state, actions } = useSimulation();
  const { running, speed, tick } = state;

  return (
    <div className="flex items-center gap-2">
      {/* Play/Pause */}
      <button
        onClick={running ? actions.pause : actions.start}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border hover:border-text-faint flex items-center justify-center transition-colors cursor-pointer"
        title={running ? 'Pause' : 'Play'}
      >
        {running
          ? <Pause size={14} className="text-text-main" />
          : <Play size={14} className="text-text-main ml-0.5" />
        }
      </button>

      {/* Step */}
      <button
        onClick={actions.step}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border hover:border-text-faint flex items-center justify-center transition-colors cursor-pointer"
        title="Step forward"
      >
        <SkipForward size={14} className="text-text-muted" />
      </button>

      {/* Reset */}
      <button
        onClick={actions.reset}
        className="w-8 h-8 rounded-lg bg-surface-raised border border-border hover:border-text-faint flex items-center justify-center transition-colors cursor-pointer"
        title="Reset"
      >
        <RotateCcw size={14} className="text-text-muted" />
      </button>

      <div className="h-5 w-px bg-border mx-1" />

      {/* Speed */}
      <div className="flex gap-0.5 rounded-lg bg-surface-raised p-0.5 border border-border">
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => actions.setSpeed(s)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              speed === s
                ? 'bg-primary/20 text-primary-light'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border mx-1" />

      {/* Day counter */}
      <span className="text-[12px] font-mono font-medium text-text-faint">
        Day {tick}
      </span>
    </div>
  );
}
