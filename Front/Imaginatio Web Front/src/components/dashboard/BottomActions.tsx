export default function BottomActions() {
  const actions = [
    { label: 'Iluminar', badge: 1 },
    { label: 'Regar', badge: 6 },
    { label: 'Abonar', badge: 0 }
  ];

  return (
    <div className="absolute w-full bottom-4 lg:bottom-8 flex flex-row justify-between items-end px-8 z-30 pointer-events-none">
       {/* Left block: Iluminar and Regar */}
       <div className="flex gap-4 pointer-events-auto">
          {actions.slice(0, 2).map(act => (
             <div key={act.label} className="relative">
               <button className="bg-slate-200 border-2 border-dashed border-slate-400 w-20 h-24 lg:w-24 lg:h-28 flex flex-col items-center justify-center p-2 text-center hover:bg-slate-300">
                  <span className="text-slate-500 font-bold text-xs">[Img: Btn<br/>{act.label}]</span>
               </button>
               {/* Badge */}
               <div className="absolute -top-3 -right-3 bg-red-200 border border-red-500 text-red-800 w-7 h-7 flex items-center justify-center font-bold text-xs z-10">
                 {act.badge}
               </div>
             </div>
          ))}
       </div>

       {/* Right block: Abonar */}
       <div className="flex gap-4 pointer-events-auto">
          {actions.slice(2).map(act => (
             <div key={act.label} className="relative">
               <button className="bg-slate-200 border-2 border-dashed border-slate-400 w-20 h-24 lg:w-24 lg:h-28 flex flex-col items-center justify-center p-2 text-center hover:bg-slate-300">
                  <span className="text-slate-500 font-bold text-xs">[Img: Btn<br/>{act.label}]</span>
               </button>
               {/* Badge */}
               <div className="absolute -top-3 -right-3 bg-red-200 border border-red-500 text-red-800 w-7 h-7 flex items-center justify-center font-bold text-xs z-10">
                 {act.badge}
               </div>
             </div>
          ))}
       </div>

       {/* User label bottom left fixed */}
       <div className="absolute left-8 -bottom-2 text-slate-700 text-xs lg:text-sm font-bold pointer-events-auto bg-white/50 px-2 py-1 rounded">
          Bienvenido: Andres
       </div>
    </div>
  );
}
