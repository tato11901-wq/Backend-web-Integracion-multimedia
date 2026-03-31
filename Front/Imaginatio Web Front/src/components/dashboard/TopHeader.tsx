export default function TopHeader() {
  return (
    <div className="flex flex-row justify-between items-start w-full px-6 pt-4 mb-4 lg:mb-6 z-10 relative">
      
      {/* Top Header Background Image Placeholder */}
      <div className="absolute top-4 left-0 w-full h-16 z-0 flex items-center justify-center">
         <div className="w-full h-full bg-slate-300/50 border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-600 text-sm font-bold">
            [Fondo Madera Top Bar]
         </div>
      </div>

      <div className="relative z-10 flex w-full justify-between items-center px-8 mt-1">
          {/* Planta 1 - Left Image */}
          <div className="w-40 h-10 lg:w-48 bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer">
            <span className="text-sm font-bold text-slate-500">[Img: Planta 1 Btn]</span>
          </div>

          {/* Center message Image */}
          <div className="w-[400px] h-12 bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center mx-4">
            <span className="text-sm font-bold text-slate-500">[Img: Cartel "¡¡¡Necesito sol!!!"]</span>
          </div>

          {/* Right buttons Images */}
          <div className="flex gap-4 shrink-0">
            <div className="w-12 h-12 bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer">
               <span className="text-xs font-bold text-slate-500 text-center">[Img:<br/>Menú]</span>
            </div>
            <div className="w-12 h-12 bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer">
               <span className="text-xs font-bold text-slate-500 text-center">[Img:<br/>Help]</span>
            </div>
          </div>
      </div>
    </div>
  );
}
