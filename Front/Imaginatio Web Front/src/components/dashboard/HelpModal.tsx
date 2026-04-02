import { isHelpModalOpen } from "../../store/resourceStore";

export default function HelpModal() {
  if (!isHelpModalOpen.value) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
      onClick={() => isHelpModalOpen.value = false}
    >
      <div
        className="bg-[#e3e4e5] w-[90%] max-w-3xl lg:max-w-4xl h-[85vh] max-h-[800px] rounded-[2rem] p-6 lg:p-8 shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => isHelpModalOpen.value = false}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold rounded-full border-2 border-slate-400 text-slate-500 hover:bg-slate-300 transition-colors z-20"
          title="Cerrar"
        >
          X
        </button>

        <h2 className="text-4xl lg:text-5xl font-pixel text-black text-center mb-6 mt-2 flex-shrink-0">
          Ayuda
        </h2>

        {/* Scrollable Content Area (Slider / Scrollbar) */}
        <div className="flex-1 w-full overflow-y-auto pr-2 pl-2 lg:px-8 pb-8 
                        scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200">

          <div className="flex flex-col gap-8 lg:gap-10">
            {/* Section 1 */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start w-full bg-white/40 p-6 rounded-2xl shadow-sm">
              <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gray-400 rounded-xl flex-shrink-0 shadow-inner"></div>
              <div className="flex flex-col gap-4 flex-1 w-full justify-center lg:mt-4">
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-3/4 bg-slate-400 rounded-full"></div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start w-full bg-white/40 p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-4 items-center justify-center w-48 lg:w-56 flex-shrink-0">
                <div className="w-full h-20 lg:h-24 bg-gray-400 rounded-xl shadow-inner"></div>
                <div className="w-full h-20 lg:h-24 bg-gray-400 rounded-xl shadow-inner"></div>
              </div>
              <div className="flex flex-col gap-4 flex-1 w-full justify-center lg:mt-4">
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start w-full bg-white/40 p-6 rounded-2xl shadow-sm">
              <div className="w-48 h-32 lg:w-56 bg-gray-400 rounded-xl flex-shrink-0 shadow-inner"></div>
              <div className="flex flex-col gap-4 flex-1 w-full justify-center lg:mt-4">
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-full bg-slate-400 rounded-full"></div>
                <div className="h-3 w-2/3 bg-slate-400 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
