import { waterLevel, isWaterGameOpen, compostLevel, isCompostGameOpen } from "../../store/resourceStore";

export default function LeftSigns() {
  return (
    <div className="absolute left-4 top-24 lg:top-32 flex flex-col items-center z-20 gap-4">

      {/* Sun Sign Placeholder */}
      <div className="bg-slate-200 border-2 border-dashed border-slate-400 w-40 h-16 flex items-center justify-center relative">
         <span className="text-sm font-bold text-slate-500 text-center">[Img: Cartel Sol<br/>Barra: 30%]</span>
      </div>

      {/* Water Sign Placeholder */}
      <div className="bg-[#bde0fe] border-2 border-dashed border-[#0077b6] w-40 h-16 flex flex-col items-center justify-center relative cursor-pointer hover:bg-[#a2d2ff]" onClick={() => isWaterGameOpen.value = true}>
         <span className="text-sm font-bold text-[#0077b6] text-center">[Img: Cartel Agua]</span>
         <span className="text-xs font-mono font-bold text-[#0077b6]">Nivel: {waterLevel.value}</span>
      </div>

      {/* Compost Sign Placeholder */}
      <div className="bg-[#f5e6c8] border-2 border-dashed border-[#8B4513] w-40 h-16 flex flex-col items-center justify-center relative cursor-pointer hover:bg-[#edd9b3]" onClick={() => isCompostGameOpen.value = true}>
         <span className="text-sm font-bold text-[#8B4513] text-center">[Img: Cartel Composta]</span>
         <span className="text-xs font-mono font-bold text-[#8B4513]">Nivel: {compostLevel.value}</span>
      </div>

    </div>
  );
}
