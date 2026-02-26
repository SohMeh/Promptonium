"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeLimit: number;
  onExpire: () => void;
  isRunning: boolean;
}

export function Timer({ timeLimit, onExpire, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(timeLimit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep the ref in sync with the latest callback
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset remaining when timeLimit changes
  useEffect(() => {
    setRemaining(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          // Use setTimeout to avoid calling onExpire during render
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const fraction = remaining / timeLimit;
  const isPulsing = remaining <= 10 && remaining > 0 && isRunning;

  let colorClass = "text-green-600 dark:text-green-400";
  if (fraction <= 0.1) {
    colorClass = "text-red-600 dark:text-red-400";
  } else if (fraction <= 0.25) {
    colorClass = "text-yellow-600 dark:text-yellow-400";
  }

  return (
    <div
      className={`flex items-center gap-2 font-mono text-2xl font-bold ${colorClass} ${
        isPulsing ? "animate-pulse" : ""
      }`}
    >
      <Clock className="h-5 w-5" />
      <span>{display}</span>
    </div>
  );
}
