"use client";

import { useEffect, useState } from "react";

export default function CooldownTimer({
  seconds
}: {
  seconds: number;
}) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) return;

    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-500/20">
          <div className="text-red-400 text-lg font-bold">{time}</div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-red-300">Cooldown Active</p>
        <p className="text-xs text-red-300/70">You can try again in {time} second{time !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}