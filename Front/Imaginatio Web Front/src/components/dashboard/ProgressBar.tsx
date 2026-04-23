import { h } from "preact";

interface ProgressBarProps {
  current: number;
  max: number;
  colorClass?: string; // e.g. "bg-yellow-400" for sun, "bg-blue-400" for water, "bg-amber-600" for fertilizer
  className?: string; // Allows overriding default position and size
}

export default function ProgressBar({ 
  current, 
  max, 
  colorClass = "bg-green-500",
  className = "absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[70%] h-5"
}: ProgressBarProps) {
  // Ensure the percentage doesn't exceed 100% or go below 0%
  const clampedCurrent = Math.max(0, Math.min(current, max));
  const percentage = max > 0 ? (clampedCurrent / max) * 100 : 0;

  return (
    <div className={`${className} bg-[#1a2e0e] rounded-xl border-4 border-[#4e341b] overflow-hidden shadow-inner`}>
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out relative overflow-hidden`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
      </div>
      {/* Texto superpuesto para mostrar x/y opcional */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        {Math.floor(clampedCurrent)}/{max}
      </div>
    </div>
  );
}
