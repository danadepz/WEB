import { useEffect, useState } from 'react';

function diffParts(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown({ target }) {
  const [parts, setParts] = useState(() => (target ? diffParts(target) : null));

  useEffect(() => {
    if (!target) return undefined;
    setParts(diffParts(target));
    const id = window.setInterval(() => setParts(diffParts(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target || !parts) return null;
  const cells = [
    { v: parts.days, l: 'DAYS' },
    { v: parts.hours, l: 'HOURS' },
    { v: parts.minutes, l: 'MINUTES' },
    { v: parts.seconds, l: 'SECONDS' },
  ];
  return (
    <div className="countdown flex items-stretch gap-2" role="timer" aria-label="Match countdown">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-2">
          <div className="countdown-cell esports-card min-w-[64px] px-3 py-2 text-center">
            <p className="font-display text-xl font-black tabular-nums text-white">{String(c.v).padStart(2, '0')}</p>
            <p className="mt-0.5 text-[9px] font-bold tracking-[0.2em] text-slate-500">{c.l}</p>
          </div>
          {i < cells.length - 1 && <span className="font-display font-black text-slate-600">:</span>}
        </div>
      ))}
    </div>
  );
}
