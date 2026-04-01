import panelEstadoSol from '../../assets/Recursos web media/Panel_EstadoSol.png';
import panelEstadoAgua from '../../assets/Recursos web media/Panel_EstadoAgua.png';
import { waterLevel, isWaterGameOpen } from "../../store/resourceStore";

export default function LeftSigns() {
  return (
    <div className="absolute left-6 top-16 lg:top-20 flex flex-col items-center z-0 gap-0">

      {/* Panel Estado Sol */}
      <div className="w-50 h-auto z-1 flex items-center justify-center relative -mt-25">
        <img src={panelEstadoSol.src} alt="Estado Sol" className="w-full h-full object-contain" />
      </div>

      {/* Panel Estado Agua */}
      <div className="w-50 h-auto z-0 flex flex-col items-center justify-center relative -mt-5">
        <img src={panelEstadoAgua.src} alt="Estado Agua" className="w-full h-full object-contain" />
      </div>

    </div>
  );
}
