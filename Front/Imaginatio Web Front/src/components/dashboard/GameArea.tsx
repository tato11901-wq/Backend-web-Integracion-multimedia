import {
   isWaterGameOpen,
   isCompostGameOpen,
   isPlantInfoOpen,
   isWaterOnCooldown,
   isCompostOnCooldown
} from "../../store/resourceStore";
import btnMinijuegoComposta from '../../assets/Recursos web media/btn_MinijuegoComposta.png';
import btnMinijuegoAgua from '../../assets/Recursos web media/btn_MinijuegoAgua.png';
import panelDescripcionPlanta from '../../assets/Recursos web media/Panel_DescripciónPlanta.png';
import plantaSpriteSheet from '../../assets/Recursos planta/plantaSpriteSheet.png';
import solEscenario from '../../assets/Recursos web media/SolEscenario.png';
import { SpriteAnimator } from './SpriteAnimator';

export default function GameArea() {
   const handleOpenWater = () => {
      if (isWaterOnCooldown.value) {
         alert("La regadera está vacía. Debes esperar a que se recupere el agua.");
         return;
      }
      isWaterGameOpen.value = true;
   };

   const handleOpenCompost = () => {
      if (isCompostOnCooldown.value) {
         alert("No hay suficientes residuos orgánicos listos. Espera un poco más.");
         return;
      }
      isCompostGameOpen.value = true;
   };

   return (
      <>
         <div className="absolute inset-0 z-10 flex flex-col justify-end items-center pointer-events-none p-8">

            {/* Sun / Background Element */}
            <div className="absolute top-10 right-1/2 mr-36 lg:top-16 lg:mr-35 w-32 h-32 lg:w-48 lg:h-48 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,150,0.5)]">
               <img src={solEscenario.src} alt="Sol" className="w-full h-full object-contain" />
            </div>

            {/* Main Center Plant Container */}
            <div
               onClick={() => isPlantInfoOpen.value = true}
               className="relative mb-24 lg:mb-24 flex flex-col items-center pointer-events-auto cursor-pointer hover:scale-105 transition-transform duration-200"
            >
               {/* Plant Image (SpriteSheet) */}
               <div className="w-64 h-auto lg:w-80 lg:h-auto flex items-center justify-center z-20">
                  {/* Ajusta frameWidth, frameHeight y frameCount a los valores exactos, la altura es 510 */}
                  <SpriteAnimator
                     src={plantaSpriteSheet.src}
                     frameWidth={477} // 2863 ancho total / 6 cuadros aprox. Ajústalo a medida.
                     frameHeight={510} // Altura de la imagen completa
                     frameCount={6}    // Cantidad de fotogramas, ajústalo según tu imagen
                     fps={12}
                     className="w-full h-full object-contain"
                  />
               </div>
            </div>

            {/* Interactable Items (Compost & Watering can) */}
            <div className="absolute bottom-24 lg:bottom-32 left-1/2 ml-36 lg:ml-56 flex items-end gap-6 pointer-events-auto">

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
               <div className="relative w-[320px] h-[450px] lg:w-[450px] lg:h-[550px] flex flex-col items-center justify-start p-8 lg:p-10">
                  {/* Background Panel */}
                  <img src={panelDescripcionPlanta.src} alt="Panel Descripcion" className="absolute inset-0 w-full h-full object-fill -z-10" />

                  {/* Close button */}
                  <button
                     onClick={() => isPlantInfoOpen.value = false}
                     className="absolute top-4 right-4 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-full border-2 border-red-700 shadow-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                     X
                  </button>

                  {/* Content */}
                  <h2 className="text-[#4e341b] text-xl lg:text-3xl font-bold mb-4 mt-15 text-center drop-shadow-sm">Información de la Planta</h2>

                  <div className="flex-1 w-full overflow-y-auto px-4 mt-2 text-[#4e341b] text-sm lg:text-base font-medium leading-relaxed
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
      </>
   );
}

