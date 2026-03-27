import { useEffect, useRef } from 'react';

export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const spanRef = useRef(null);
  const currentRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = value;
    function tick() {
      currentRef.current += (target - currentRef.current) * 0.12;
      if (Math.abs(target - currentRef.current) < 0.5 * Math.pow(10, -decimals)) {
        currentRef.current = target;
      }
      if (spanRef.current) {
        const formatted = decimals > 0
          ? currentRef.current.toFixed(decimals)
          : Math.round(currentRef.current).toLocaleString();
        spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
      if (currentRef.current !== target) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, prefix, suffix, decimals]);

  const initial = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  return <span ref={spanRef} className={className}>{prefix}{initial}{suffix}</span>;
}
