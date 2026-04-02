import { useState } from "preact/hooks";
import { isInventoryOpen } from "../../store/resourceStore";
import fondoInventario from "../../assets/Recursos inventario/Fondo_Inventario.png";
import panelHudInventario from "../../assets/Recursos inventario/Panel_HUDInventario.png";
import panelPlantaEspacio from "../../assets/Recursos inventario/Panel_PlantaEspacio.png";

// Import HUD Assets
// left: btn_Estado
import btnEstado01 from "../../assets/Recursos inventario/btn_Estado_01.png";
import btnEstado02 from "../../assets/Recursos inventario/btn_Estado_02.png";
import btnEstado03 from "../../assets/Recursos inventario/btn_Estado_03.png";
import btnEstado04 from "../../assets/Recursos inventario/btn_Estado_04.png";

// Center: btn_Urgencia
import btnUrgencia01 from "../../assets/Recursos inventario/btn_Urgencia_01.png";
import btnUrgencia02 from "../../assets/Recursos inventario/btn_Urgencia_02.png";
import btnUrgencia03 from "../../assets/Recursos inventario/btn_Urgencia_03.png";

// Right: btn_Categoría
import btnCategoria01 from "../../assets/Recursos inventario/btn_Categoría_01.png";
import btnCategoria02 from "../../assets/Recursos inventario/btn_Categoría_02.png";
import btnCategoria03 from "../../assets/Recursos inventario/btn_Categoría_03.png";
import btnCategoria04 from "../../assets/Recursos inventario/btn_Categoría_04.png";
import btnCategoria05 from "../../assets/Recursos inventario/btn_Categoría_05.png";

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  if (!isInventoryOpen.value) return null;

  const estadoIcons = [btnEstado01, btnEstado02, btnEstado03, btnEstado04];
  const urgenciaIcons = [btnUrgencia01, btnUrgencia02, btnUrgencia03];
  const categoriaIcons = [btnCategoria01, btnCategoria02, btnCategoria03, btnCategoria04, btnCategoria05];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-auto backdrop-blur-sm">
      {/* Main Inventory Container */}
      <div className="relative w-[90%] max-w-4xl aspect-[16/9] flex flex-col items-center justify-start p-6 rounded-lg shadow-2xl overflow-hidden border-8 border-[#6b4226]">

        {/* Fondo_Inventario */}
        <div className="absolute inset-0 z-0">
          <img src={fondoInventario.src} alt="Fondo Inventario" className="w-full h-full object-fill opacity-90" />
        </div>

        {/* Panel_HUDInventario */}
        <div className="relative z-10 w-full mb-4 flex items-center justify-between px-8 py-2">
          <div className="absolute inset-x-0 top-0 bottom-0 z-0">
            <img src={panelHudInventario.src} alt="HUD Inventario" className="w-full h-full object-contain" />
          </div>

          {/* HUD Content - Positioned over the resource */}
          <div className="relative z-10 w-full flex items-center justify-between h-14 lg:h-16 px-4">
            {/* Left: btn_Estado */}
            <div className="flex gap-3 items-center h-full ml-4">
              {estadoIcons.map((icon, i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                  <img src={icon.src} alt={`Estado ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Center: btn_Urgencia */}
            <div className="flex gap-3 items-center h-full">
              {urgenciaIcons.map((icon, i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                  <img src={icon.src} alt={`Urgencia ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Right: btn_Categoria */}
            <div className="flex gap-3 items-center h-full mr-4">
              {categoriaIcons.map((icon, i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                  <img src={icon.src} alt={`Categoria ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Grid Slots - Scrollable Area */}
        <div className="relative z-10 w-full flex-1 overflow-y-auto px-4 pb-12 mt-2
                        scrollbar-thin scrollbar-thumb-[#6b4226] scrollbar-track-[#8d6e63]">
          <div className="grid grid-cols-4 gap-6 p-4">
            {[...Array(24)].map((_, index) => (
              <div
                key={index}
                onClick={() => setSelectedItem(index)}
                className="relative aspect-square flex flex-col items-center justify-center overflow-hidden transition-transform hover:scale-105 cursor-pointer"
              >
                {/* Panel_PlantaEspacio background */}
                <div className="absolute inset-0 z-0">
                  <img src={panelPlantaEspacio.src} alt="Slot Background" className="w-full h-full object-fill" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 pt-6">
                  {/* Plant Name Label */}
                  <span className="font-pixel text-white text-[15px] lg:text-lg absolute top-7 left-0 right-0 text-center">Nombre</span>

                  {/* If first two slots, show mock plants */}
                  {index < 2 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-2">
                      <span className="text-4xl lg:text-6xl mb-auto">🌿</span>
                      {/* Mock Stats/Badges */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/20 rounded px-1 py-0.5">
                        <div className="flex gap-1">
                          <span className="text-[10px]">☀️</span>
                          <span className="text-[10px]">🪴</span>
                        </div>
                        <div className="flex gap-1 bg-white/20 rounded-full px-1">
                          <span className="text-[10px]">💧</span>
                          <span className="text-[10px]">🔥</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-4xl lg:text-7xl text-green-800/40 font-bold mt-auto mb-auto">+</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item Popup Modal */}
        {selectedItem !== null && (
          <div className="absolute inset-0 z-30 bg-black/40 rounded-lg flex flex-col items-center justify-center">
            {/* Pop-up Container */}
            <div className="bg-[#e3e4e5] w-1/3 min-w-[300px] max-w-sm aspect-square rounded-[2rem] p-6 shadow-2xl flex flex-col items-center relative">
              <h2 className="text-3xl font-pixel text-black mb-8 mt-2">Nombre</h2>

              {/* Plant Image Mockup */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-12">
                <div className="w-24 h-24 bg-[#7a3910] absolute top-0 left-0"></div>
                <div className="w-24 h-24 bg-[#ab4e14] absolute bottom-0 right-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#f7c5a8] absolute right-2 top-2"></div>
                </div>
              </div>

              {/* Badges row inside popup */}
              <div className="absolute bottom-20 left-6 right-6 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-[#b4e600] border border-black flex items-center justify-center rounded">
                    <span className="text-2xl leading-none font-bold text-black">🔥</span>
                  </div>
                  <div className="w-10 h-10 bg-[#c6e6c6] border border-black flex items-center justify-center rounded">
                    <span className="text-2xl leading-none font-bold text-black">-</span>
                  </div>
                </div>
                <div className="flex gap-2 bg-[#888888] rounded-full px-4 py-2 items-center">
                  <span className="text-sm">🪴</span>
                  <div className="w-px h-4 bg-black/40 mx-0.5"></div>
                  <span className="text-sm">🪴</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-6">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                  className="bg-[#f0f0f0] px-6 py-2.5 rounded-full text-black font-pixel font-bold text-sm hover:bg-white w-32 text-center"
                >
                  Volver
                </button>
                <button
                  className="bg-[#f0f0f0] px-6 py-2.5 rounded-full text-black font-pixel font-bold text-sm hover:bg-white w-32 text-center"
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => isInventoryOpen.value = false}
          className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full border-4 border-[#4e342e] shadow-lg transition-transform active:scale-95 z-20"
        >
          X
        </button>
      </div>
    </div>
  );
}

