import panelEstadoAbono from '../../assets/Recursos web media/Panel_EstadoAbono.png';
import panelEstadoComposta from '../../assets/Recursos web media/Panel_EstadoComposta.png';
import { compostLevel, fertilizerInventory } from "../../store/resourceStore";

export default function RightSigns() {
  return (
    <div className="absolute right-6 top-20 flex flex-col items-center z-0 gap-0">

      {/* Panel Estado Abono */}
      <div className="w-70 h-auto z-1 flex flex-col items-center justify-center relative -mt-25">
        <img src={panelEstadoAbono.src} alt="Estado Abono" className="w-full h-full object-contain" />
      </div>

      {/* Panel Estado Composta */}
      <div className="w-55 h-auto z-0 flex flex-col items-center justify-center relative -mt-5">
        <img src={panelEstadoComposta.src} alt="Estado Composta" className="w-full h-full object-contain" />
        <span className="absolute top-[70%] left-[55%] -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">
          {compostLevel.value}/4
        </span>
      </div>

    </div>
  );
}
