import { isInventoryOpen } from "../../store/resourceStore";
import fondoInventario from "../../assets/Recursos inventario/Fondo_Inventario.png";
import panelHudInventario from "../../assets/Recursos inventario/Panel_HUDInventario.png";

export default function Inventory() {
  if (!isInventoryOpen.value) return null;

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
            {/* Left: Plant Growth Stages */}
            <div className="flex gap-3 items-center h-full ml-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-[#4e342e]/30 rounded flex items-center justify-center">
                  <span className="text-[10px] grayscale brightness-125">🪴</span>
                </div>
              ))}
            </div>

            {/* Center: Bells / Notifications */}
            <div className="flex gap-3 items-center h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-[#4e342e]/30 rounded flex items-center justify-center">
                  <span className="text-[10px] grayscale brightness-125">🔔</span>
                </div>
              ))}
            </div>

            {/* Right: Environment Icons */}
            <div className="flex gap-3 items-center h-full mr-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-[#4e342e]/30 rounded flex items-center justify-center">
                  <span className="text-[10px] grayscale brightness-125">🌄</span>
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
              <div key={index} className="relative aspect-square bg-[#d7ccc8] border-8 border-[#8d6e63] rounded-xl shadow-lg flex flex-col items-center justify-center overflow-hidden transition-transform hover:scale-105">
                {/* Wood Grain Pattern in Slot */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 5px, transparent 5px, transparent 10px)' }}></div>

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
                  <span className="text-4xl lg:text-7xl text-green-600 font-bold opacity-40">+</span>
                )}
              </div>
            ))}
          </div>
        </div>

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
