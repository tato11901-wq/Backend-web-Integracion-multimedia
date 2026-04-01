import panelEstadoAbono from '../../assets/Recursos web media/Panel_EstadoAbono.png';
import panelEstadoComposta from '../../assets/Recursos web media/Panel_EstadoComposta.png';
import { compostLevel, isCompostGameOpen } from "../../store/resourceStore";

export default function RightSigns() {
  return (
    <div className="absolute right-6 top-16 lg:top-20 flex flex-col items-center z-0 gap-0">

      {/* Panel Estado Abono */}
      <div className="w-50 h-auto z-1 flex flex-col items-center justify-center relative -mt-25">
        <img src={panelEstadoAbono.src} alt="Estado Abono" className="w-full h-full object-contain" />
      </div>

      {/* Panel Estado Composta */}
      <div className="w-45 h-auto z-0 flex flex-col items-center justify-center relative -mt-5">
        <img src={panelEstadoComposta.src} alt="Estado Composta" className="w-full h-full object-contain" />
      </div>

    </div>
  );
}
