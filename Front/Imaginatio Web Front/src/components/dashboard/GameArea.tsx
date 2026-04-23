import {
   isWaterGameOpen,
   isCompostGameOpen,
   isPlantInfoOpen,
   isSunGameOpen,
   isWaterOnCooldown,
   isCompostOnCooldown,
   isSunOnCooldown
} from "../../store/resourceStore";
import { isDebugOpen } from "../../store/plantStore";
import btnMinijuegoComposta from '../../assets/Recursos web media/btn_MinijuegoComposta.png';
import btnMinijuegoAgua from '../../assets/Recursos web media/btn_MinijuegoAgua.png';
import panelDescripcionPlanta from '../../assets/Recursos web media/Panel_DescripciónPlanta.png';
import solEscenario from '../../assets/Recursos web media/SolEscenario.png';
import Plant from './Plant';
import DebugPanel from './DebugPanel';

export default function GameArea() {
   const handleOpenWater = () => {
      if (isWaterOnCooldown.value) {
         alert("La regadera está vacía. Debes esperar a que se recupere el agua.");
         return;
      }
      isWaterGameOpen.value = true;
   };

   const handleOpenCompost = (e: MouseEvent) => {
      // Botón oculto (modo admin): Activación por combinación de teclas
      if (e.altKey || e.shiftKey) {
         isDebugOpen.value = true;
         return;
      }

      if (isCompostOnCooldown.value) {
         alert("No hay suficientes residuos orgánicos listos. Espera un poco más.");
         return;
      }
      isCompostGameOpen.value = true;
   };

   const handleOpenSun = () => {
      isSunGameOpen.value = true;
   };

   return (
      <>
         <div className="absolute inset-0 z-10 flex flex-col justify-end items-center pointer-events-none p-8">

            {/* Sun / Background Element - clickeable, sin cambio visual por cooldown */}
            <div
               onClick={handleOpenSun}
               className="absolute top-16 right-1/2 mr-35 w-48 h-48 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,150,0.5)] cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-110 active:scale-95"
            >
               <img src={solEscenario.src} alt="Sol - Minijuego de Soles" className="w-full h-full object-contain" />
            </div>

            {/* Main Center Plant Container */}
            <Plant />

            {/* Interactable Items (Compost & Watering can) */}
            <div className="absolute bottom-32 left-1/2 ml-56 flex items-end gap-6 pointer-events-auto">

               {/* Compost Bag - Triggers minigame */}
               <button
                  onClick={handleOpenCompost}
                  className={`w-20 h-auto flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-80 active:scale-90 ${isCompostOnCooldown.value ? "grayscale opacity-50 cursor-not-allowed" : ""}`}
               >
                  <img src={btnMinijuegoComposta.src} alt="Bolsa Composta" className="w-full h-full object-contain" />
               </button>

               {/* Watering Can - Triggers minigame */}
               <button
                  onClick={handleOpenWater}
                  className={`w-25 h-auto flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out hover:opacity-80 active:scale-90 ${isWaterOnCooldown.value ? "grayscale opacity-50 cursor-not-allowed" : ""}`}
               >
                  <img src={btnMinijuegoAgua.src} alt="Regadera" className="w-full h-full object-contain" />
               </button>

            </div>
         </div>

         {/* Plant Info Popup */}
         {isPlantInfoOpen.value && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto">
               <div className="relative w-[450px] h-[600px] lg:w-[650px] lg:h-[800px] flex flex-col items-center justify-start p-10 lg:p-14">
                  {/* Background Panel */}
                  <img src={panelDescripcionPlanta.src} alt="Panel Descripcion" className="absolute inset-0 w-full h-full object-fill -z-10" />

                  {/* Close button */}
                  <button
                     onClick={() => isPlantInfoOpen.value = false}
                     className="absolute top-6 right-6 w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-full border-2 border-red-700 shadow-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                     X
                  </button>

                  {/* Content */}
                  <h2 className="text-[#4e341b] text-2xl lg:text-4xl font-bold mb-6 mt-16 text-center drop-shadow-sm">Información de la Planta</h2>

                  <div className="flex-1 w-full overflow-y-auto px-6 mt-4 text-[#4e341b] text-base lg:text-xl font-medium leading-relaxed
                                  scrollbar-thin scrollbar-thumb-[#8B4513] scrollbar-track-[#f5e6c8]">
                     <p>
                        Aquí aparecerá la descripción detallada de la planta, sus características, consejos de cuidado, o curiosidades.
                        <br /><br />
                        Este texto puede ser mucho más largo y el contenedor permitirá hacer scroll hacia abajo para leerlo todo. El panel se acomoda respondiendo a la cantidad de texto que haya disponible.
                        <br /><br />
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget vehicula libero. Praesent cursus finibus tortor vel dapibus. Ut pretium orci vitae tortor auctor aliquet. Suspendisse ultrices lacus eget risus varius, bibendum sollicitudin libero lacinia.
                        <br /><br />
                        Sed non ipsum odio. Suspendisse dictum lacus justo, non fringilla felis tristique pretium. Donec rutrum lorem lorem, tincidunt mattis arcu luctus varius.
                        <br /><br />
                        (Fin del contenido...)
                     </p>
                  </div>
               </div>
            </div>
         )}

         <DebugPanel />
      </>
   );
}

