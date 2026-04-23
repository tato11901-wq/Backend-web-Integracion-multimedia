import panelEstadoSol from '../../assets/Recursos web media/Panel_EstadoSol.png';
import panelEstadoAgua from '../../assets/Recursos web media/Panel_EstadoAgua.png';
import ProgressBar from './ProgressBar';
import { plantSunProgress, plantWaterProgress, plantPhase, EVOLUTION_REQUIREMENTS } from "../../store/plantStore";

export default function LeftSigns() {
  const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
  // Si reqs es null, estamos en fase 'ent' (máximo), así que podemos poner un max visual de 10 o el actual.
  const maxSun = reqs ? reqs.sun : Math.max(10, plantSunProgress.value);
  const maxWater = reqs ? reqs.water : Math.max(10, plantWaterProgress.value);

  return (
    <div className="absolute left-6 top-20 flex flex-col items-center z-0 gap-0">

      {/* Panel Estado Sol */}
      <div className="w-70 h-auto z-1 flex items-center justify-center relative -mt-25">
        <img src={panelEstadoSol.src} alt="Estado Sol" className="w-full h-full object-contain" />
        <ProgressBar current={plantSunProgress.value} max={maxSun} colorClass="bg-yellow-400" className="absolute bottom-[15%] left-[60%] -translate-x-1/2 w-[60%] h-7" />
      </div>

      {/* Panel Estado Agua */}
      <div className="w-70 h-auto z-0 flex flex-col items-center justify-center relative -mt-5">
        <img src={panelEstadoAgua.src} alt="Estado Agua" className="w-full h-full object-contain" />
        <ProgressBar current={plantWaterProgress.value} max={maxWater} colorClass="bg-blue-400" className="absolute bottom-[20%] left-[60%] -translate-x-1/2 w-[60%] h-7" />
      </div>

    </div>
  );
}
