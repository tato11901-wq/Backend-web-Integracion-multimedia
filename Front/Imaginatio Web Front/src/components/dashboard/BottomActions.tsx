import btnIluminar from '../../assets/Recursos web media/btn_iluminar.png';
import btnRegar from '../../assets/Recursos web media/btn_regar.png';
import btnAbonar from '../../assets/Recursos web media/btn_abonar.png';

const btnImages: Record<string, ImageMetadata> = {
  Iluminar: btnIluminar,
  Regar: btnRegar,
  Abonar: btnAbonar,
};

export default function BottomActions() {
  const actions = [
    { label: 'Iluminar', badge: 1 },
    { label: 'Regar', badge: 6 },
    { label: 'Abonar', badge: 0 }
  ];

  return (
    <>
      {/* Left block: Iluminar and Regar */}
      <div className="absolute left-6 top-[16rem] lg:top-[16rem] w-50 flex justify-center gap-4 z-30 pointer-events-auto">
        {actions.slice(0, 2).map(act => (
          <div key={act.label} className="relative transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90">
            <button className="w-20 h-24 lg:w-24 lg:h-28 flex flex-col items-center justify-center p-0 overflow-hidden">
              <img src={btnImages[act.label].src} alt={`Btn ${act.label}`} className="w-full h-full object-contain" />
            </button>
            {/* Cantidad de recurso sobre el cuadro rojo del botón */}
            <span className="absolute top-0 right-0 w-5 h-5 lg:w-6 lg:h-6 flex items-center text-white font-bold text-[10px] lg:text-xs z-10 pointer-events-none">
              {act.badge}
            </span>
            {/* Label sobre la parte inferior verde */}
            <span className="absolute bottom-3 left-0 w-full text-center text-white font-bold text-[8px] lg:text-[10px] z-10 pointer-events-none drop-shadow-md">
              {act.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right block: Abonar */}
      <div className="absolute right-6 top-[16rem] lg:top-[16rem] w-50 flex justify-center z-30 pointer-events-auto">
        {actions.slice(2).map(act => (
          <div key={act.label} className="relative transition-all duration-150 ease-in-out hover:opacity-60 active:scale-90">
            <button className="w-20 h-24 lg:w-24 lg:h-28 flex flex-col items-center justify-center p-0 overflow-hidden">
              <img src={btnImages[act.label].src} alt={`Btn ${act.label}`} className="w-full h-full object-contain" />
            </button>
            {/* Cantidad de recurso sobre el cuadro rojo del botón */}
            <span className="absolute top-0 right-0 w-5 h-5 lg:w-6 lg:h-6 flex items-center text-white font-bold text-[10px] lg:text-xs z-10 pointer-events-none">
              {act.badge}
            </span>
            {/* Label sobre la parte inferior verde */}
            <span className="absolute bottom-3 left-0 w-full text-center text-white font-bold text-[8px] lg:text-[10px] z-10 pointer-events-none drop-shadow-md">
              {act.label}
            </span>
          </div>
        ))}
      </div>

      {/* User label bottom left fixed */}
      <div className="absolute left-8 -bottom-2 text-slate-700 text-xs lg:text-sm font-bold z-30 pointer-events-auto bg-white/50 px-2 py-1 rounded">
        Bienvenido: Andres
      </div>
    </>
  );
}

