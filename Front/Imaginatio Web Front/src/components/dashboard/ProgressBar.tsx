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
  // Valores para display (redondeados hacia arriba para números planos)
  const displayCurrent = Math.ceil(Math.max(0, Math.min(current, max)));
  const displayMax = Math.ceil(max);
  
  // El porcentaje visual ahora depende de los valores redondeados para que coincidan con el texto
  const percentage = displayMax > 0 ? (displayCurrent / displayMax) * 100 : 0;

  return (
    <div className={`${className} bg-[#1a2e0e] rounded-xl border-4 border-[#4e341b] overflow-hidden shadow-inner`}>
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out relative overflow-hidden`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
      </div>
      {/* Texto superpuesto para mostrar x/y opcional */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-base font-black text-white"
        style={{ WebkitTextStroke: '1px black', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        {displayCurrent}/{displayMax}
      </div>
    </div>
  );
}
