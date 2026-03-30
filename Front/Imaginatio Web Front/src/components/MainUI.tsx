import { waterLevel, isWaterGameOpen } from "../store/resourceStore"

export default function MainUI() {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 class="text-4xl font-bold text-white mb-4">Dashboard</h1>
      
      <div class="p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 w-80 flex flex-col items-center text-center">
        <h2 class="text-xl font-semibold mb-4 text-blue-400">Inventario Global</h2>
        <div class="flex items-center gap-3 bg-slate-700/50 px-6 py-3 rounded-xl w-full justify-center">
          <span class="text-3xl text-blue-300">💧</span>
          <span class="text-white text-lg">Agua:</span>
          <span class="font-bold text-3xl text-white ml-2">{waterLevel}</span>
        </div>
      </div>

      <button 
        onClick={() => isWaterGameOpen.value = true}
        class="mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Recolectar Más Agua
      </button>
    </div>
  )
}
