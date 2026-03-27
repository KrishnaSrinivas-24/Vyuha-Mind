import { useEffect, useRef } from 'react';

export function ProbabilityGauge({ value = 72, size = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const lineWidth = 5;
    const startAngle = -Math.PI * 0.5;
    const fullArc = Math.PI * 2;

    function getColor(v) {
      if (v >= 60) return '#34D399';
      if (v >= 35) return '#FBBF24';
      return '#F87171';
    }

    function draw() {
      animRef.current += (value - animRef.current) * 0.08;
      const v = animRef.current;

      ctx.clearRect(0, 0, size, size);

      // Track ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, fullArc);
      ctx.strokeStyle = 'rgba(140,140,200,0.08)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Value arc
      const sweep = (v / 100) * fullArc;
      const color = getColor(v);

      // Glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth + 6;
      ctx.globalAlpha = 0.12;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Main arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Value text
      ctx.font = `600 ${size * 0.3}px Inter, sans-serif`;
      ctx.fillStyle = '#ECECF1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(v)}`, cx, cy - 2);

      // Label
      ctx.font = `500 ${size * 0.1}px Inter, sans-serif`;
      ctx.fillStyle = '#6B72A0';
      ctx.fillText('PoS', cx, cy + size * 0.17);

      if (Math.abs(value - animRef.current) > 0.1) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
