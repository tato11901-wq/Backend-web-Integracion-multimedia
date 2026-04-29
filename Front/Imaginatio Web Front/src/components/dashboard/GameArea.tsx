import {
   isWaterGameOpen,
   isCompostGameOpen,
   isPlantInfoOpen,
   isSunGameOpen,
   isWaterOnCooldown,
   isCompostOnCooldown,
   isSunOnCooldown,
   waterRemainingTime,
   compostRemainingTime,
   sunRemainingTime
} from "../../store/resourceStore";
import { isDebugOpen, isEntActive } from "../../store/plantStore";
import btnMinijuegoComposta from '../../assets/Recursos web media/btn_MinijuegoComposta.png';
import btnMinijuegoAgua from '../../assets/Recursos web media/btn_MinijuegoAgua.png';
import panelDescripcionPlanta from '../../assets/Recursos web media/Panel_DescripciónPlanta.png';
import solEscenario from '../../assets/Recursos web media/SolEscenario.png';
import Plant from './Plant';
import DebugPanel from './DebugPanel';

export default function GameArea() {
   const entLocked = isEntActive.value;

   const handleOpenWater = () => {
      if (entLocked || isWaterOnCooldown.value) return; 
      isWaterGameOpen.value = true;
   };

   const handleOpenCompost = (e: MouseEvent) => {
      // Botón oculto (modo admin): Activación por combinación de teclas
      if (e.altKey || e.shiftKey) {
         isDebugOpen.value = true;
         return;
      }

      if (entLocked || isCompostOnCooldown.value) return;
      isCompostGameOpen.value = true;
   };

   const handleOpenSun = () => {
      if (entLocked || isSunOnCooldown.value) return; 
      isSunGameOpen.value = true;
   };

   return (
      <>
         <div className="absolute inset-0 z-10 flex flex-col justify-end items-center pointer-events-none p-8">

            {/* Sol - bloqueado visualmente cuando hay Ent o Cooldown */}
            <div
               onClick={handleOpenSun}
               title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isSunOnCooldown.value ? `Esperando sol: ${sunRemainingTime.value}` : "Minijuego del Sol"}
               className={`absolute top-16 right-1/2 mr-35 w-48 h-48 flex items-center justify-center
                           drop-shadow-[0_0_15px_rgba(255,255,150,0.5)] pointer-events-auto
                           transition-all duration-200
                           ${(entLocked || isSunOnCooldown.value)
                              ? "opacity-40 grayscale cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 active:scale-95"
                           }`}
            >
               <img src={solEscenario.src} alt="Sol - Minijuego de Soles" className="w-full h-full object-contain" />
               {entLocked ? (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl select-none pointer-events-none">
                     🔒
                  </span>
               ) : isSunOnCooldown.value && (
                  <div className="absolute bottom-4 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-md border border-white/20">
                    {sunRemainingTime.value}
                  </div>
               )}
            </div>

            {/* Main Center Plant Container */}
            <Plant />

            {/* Interactable Items (Compost & Watering can) */}
            <div className="absolute bottom-32 left-1/2 ml-56 flex items-end gap-6 pointer-events-auto">

               {/* Compost Bag */}
               <button
                  onClick={handleOpenCompost}
                  title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isCompostOnCooldown.value ? `Esperando residuos: ${compostRemainingTime.value}` : "Minijuego de Composta"}
                  className={`relative w-20 h-auto flex items-center justify-center transition-all duration-150 ease-in-out
                              ${(entLocked || isCompostOnCooldown.value)
                                 ? "opacity-40 grayscale cursor-not-allowed"
                                 : "cursor-pointer hover:opacity-80 active:scale-90"
                              }`}
               >
                  <img src={btnMinijuegoComposta.src} alt="Bolsa Composta" className="w-full h-full object-contain" />
                  {entLocked ? (
                     <span className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none">
                        🔒
                     </span>
                  ) : isCompostOnCooldown.value && (
                    <div className="absolute -bottom-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap">
                      {compostRemainingTime.value}
                    </div>
                  )}
               </button>

               {/* Watering Can */}
               <button
                  onClick={handleOpenWater}
                  title={entLocked ? "🌳 Ent activo — minijuego bloqueado" : isWaterOnCooldown.value ? `Recuperando agua: ${waterRemainingTime.value}` : "Minijuego del Agua"}
                  className={`relative w-25 h-auto flex items-center justify-center transition-all duration-150 ease-in-out
                              ${(entLocked || isWaterOnCooldown.value)
                                 ? "opacity-40 grayscale cursor-not-allowed"
                                 : "cursor-pointer hover:opacity-80 active:scale-90"
                              }`}
               >
                  <img src={btnMinijuegoAgua.src} alt="Regadera" className="w-full h-full object-contain" />
                  {entLocked ? (
                     <span className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none">
                        🔒
                     </span>
                  ) : isWaterOnCooldown.value && (
                    <div className="absolute -bottom-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap">
                      {waterRemainingTime.value}
                    </div>
                  )}
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
