import { isWaterGameOpen } from "../../store/resourceStore";

export default function GameArea() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end items-center pointer-events-none p-8">
      
      {/* Sun / Light Cursor representation */}
      <div className="absolute top-32 left-32 w-24 h-24 bg-yellow-200/50 border-2 border-dashed border-yellow-500 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer">
         <span className="text-yellow-700 font-bold text-xs">[Click: Luz]</span>
      </div>

      {/* Main Center Plant Container */}
      <div className="relative mb-24 lg:mb-32 flex flex-col items-center pointer-events-auto cursor-pointer">
         {/* Plant Mock Placeholder */}
         <div className="w-48 h-48 bg-green-200/50 border-4 border-dashed border-green-600 flex items-center justify-center z-10">
            <span className="text-green-800 font-bold text-center">[Img: Planta<br/>Sprite]</span>
         </div>

         {/* Terracotta Pot Placeholder */}
         <div className="w-48 h-32 bg-orange-200/50 border-4 border-dashed border-orange-600 flex items-center justify-center -mt-8 z-20">
            <span className="text-orange-800 font-bold text-center">[Img: Maceta]</span>
         </div>
      </div>

      {/* Interactable Items (Compost & Watering can) */}
      <div className="absolute bottom-24 lg:bottom-32 left-1/2 ml-24 lg:ml-32 flex items-end gap-6 pointer-events-auto">
         
         {/* Compost Bag Placeholder */}
         <div className="w-20 h-24 bg-brown-200/50 border-4 border-dashed border-yellow-800 flex items-center justify-center cursor-pointer hover:bg-yellow-200/50 transition-colors">
            <span className="text-yellow-900 font-bold text-xs text-center">[Img:<br/>Bolsa<br/>Composta]</span>
         </div>

         {/* Watering Can Placeholder - Triggers minigame */}
         <button 
           onClick={() => isWaterGameOpen.value = true}
           className="w-24 h-20 bg-blue-200/50 border-4 border-dashed border-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-300/50 transition-colors"
         >
            <span className="text-blue-900 font-bold text-xs text-center">[Img: Regadera]<br/>(Click: Abrir)</span>
         </button>

      </div>
      
    </div>
  );
}
