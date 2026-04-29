import btnIluminar from '../../assets/Recursos web media/btn_iluminar.png';
import btnRegar from '../../assets/Recursos web media/btn_regar.png';
import btnAbonar from '../../assets/Recursos web media/btn_abonar.png';

import {
  waterInventory,
  sunInventory,
  fertilizerInventory,
  username
} from "../../store/resourceStore";

import {
  applyWater,
  applySun,
  applyFertilizer,
  isWatering,
  isFertilizing,
  isSunning,
  isEvolving,
  isEntActive
} from "../../store/plantStore";

const btnImages: Record<string, ImageMetadata> = {
  Iluminar: btnIluminar,
  Regar: btnRegar,
  Abonar: btnAbonar,
};

export default function BottomActions() {
  const isAnyAnimating = isWatering.value || isFertilizing.value || isSunning.value || isEvolving.value;

  const actions = [
    { label: 'Iluminar', badge: sunInventory.value, action: applySun },
    { label: 'Regar', badge: waterInventory.value, action: applyWater },
    { label: 'Abonar', badge: fertilizerInventory.value, action: applyFertilizer }
  ];

  return (
    <>
      {/* Left block: Iluminar and Regar */}
      <div className={`absolute left-6 top-[25rem] w-64 flex justify-center gap-6 z-30 pointer-events-auto ${isAnyAnimating ? 'opacity-50 pointer-events-none' : ''}`}>
        {actions.slice(0, 2).map(act => (
          <div key={act.label} className="relative transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90">
            <button
              onClick={act.action}
              disabled={isAnyAnimating}
              className="w-32 h-38 flex flex-col items-center justify-center p-0 overflow-hidden cursor-pointer disabled:cursor-not-allowed"
            >
              <img src={btnImages[act.label].src} alt={`Btn ${act.label}`} className="w-full h-full object-contain" />
            </button>
            {/* Cantidad de recurso sobre el cuadro rojo del botón */}
            <span className="absolute top-0 right-0 w-13 h-8 lg:w-13 lg:h-8 flex items-center justify-center text-white font-bold lg:text-lg z-10 pointer-events-none">
              {Math.floor(act.badge)}
            </span>
            {/* Label sobre la parte inferior verde */}
            <span className="absolute bottom-4 left-0 w-full text-center text-white font-bold text-[14px] z-10 pointer-events-none drop-shadow-md">
              {act.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right block: Abonar */}
      <div className={`absolute right-6 top-[25rem] w-64 flex justify-center z-30 pointer-events-auto ${isAnyAnimating ? 'opacity-50 pointer-events-none' : ''}`}>
        {actions.slice(2).map(act => (
          <div key={act.label} className="relative transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90">
            <button
              onClick={act.action}
              disabled={isAnyAnimating}
              className="w-32 h-38 flex flex-col items-center justify-center p-0 overflow-hidden cursor-pointer disabled:cursor-not-allowed"
            >
              <img src={btnImages[act.label].src} alt={`Btn ${act.label}`} className="w-full h-full object-contain" />
            </button>
            {/* Cantidad de recurso sobre el cuadro rojo del botón */}
            <span className="absolute top-0 right-0 w-13 h-8 lg:w-13 lg:h-8 flex items-center justify-center text-white font-bold lg:text-lg z-10 pointer-events-none">
              {act.badge}
            </span>
            {/* Label sobre la parte inferior verde */}
            <span className="absolute bottom-4 left-0 w-full text-center text-white font-bold text-[14px] z-10 pointer-events-none drop-shadow-md">
              {act.label}
            </span>
          </div>
        ))}
      </div>

      {/* Banner ENT activo */}
      {isEntActive.value && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 bg-emerald-900/90 border-2 border-emerald-400/60 text-emerald-200 text-xs font-bold px-4 py-2 rounded-xl shadow-lg text-center pointer-events-none whitespace-nowrap">
          🌳 ¡Ent activo! Los minijuegos están pausados.
        </div>
      )}

      {/* User label bottom left fixed */}
      <div className="absolute left-8 bottom-4 text-slate-700 text-xs lg:text-sm font-bold z-30 pointer-events-auto bg-white/50 px-2 py-1 rounded">
        Bienvenido: {username.value}
      </div>
    </>
  );
}
