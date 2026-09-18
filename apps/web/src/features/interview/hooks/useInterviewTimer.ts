import { useState, useEffect, useRef } from "react";

export function useInterviewTimer(startedAt?: string | null, isRunning: boolean = true) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const startTimestamp = startedAt ? new Date(startedAt).getTime() : Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(elapsed);
    };

    updateTimer();
    intervalRef.current = window.setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt, isRunning]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    elapsedSeconds,
    formattedTime,
    minutes,
    seconds,
  };
}
