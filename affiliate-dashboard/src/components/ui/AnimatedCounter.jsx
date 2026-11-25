import { useEffect, useState } from 'react';

/**
 * Smooth requestAnimationFrame counter supporting currency, percent, and integer formatting.
 */
export function AnimatedCounter({ value, format = 'integer', duration = 680 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = null;
    const startTime = performance.now();
    const target = Number(value) || 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value, duration]);

  if (format === 'currency') {
    return <span>₹{Math.round(displayValue).toLocaleString('en-IN')}</span>;
  }

  if (format === 'percent') {
    return <span>{displayValue.toFixed(1)}%</span>;
  }

  return <span>{Math.round(displayValue).toLocaleString('en-IN')}</span>;
}
