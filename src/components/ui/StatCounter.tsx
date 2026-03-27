// src/components/ui/StatCounter.tsx
import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function StatCounter({ value, suffix = '', prefix = '', duration = 2 }: StatCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <motion.div
      ref={ref}
      className="flex items-baseline font-display font-black"
    >
      {prefix && <span className="text-2xl mr-1 text-[var(--text-tertiary)]">{prefix}</span>}
      <motion.span>{display}</motion.span>
      {suffix && <span className="text-2xl ml-1 text-[var(--primary)]">{suffix}</span>}
    </motion.div>
  );
}
