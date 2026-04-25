import { useState } from "preact/hooks";
import { 
  plantPhase, 
  plantHealth, 
  plantWaterProgress, 
  plantSunProgress, 
  plantFertilizerProgress, 
  plantSpeciesId,
  isDebugOpen,
  evolvePlant,
  resetPlant,
  fastForwardTime,
  syncPlantState,
  setEvolutionRequirementsFromSpecies,
  CRITICAL_HEALTH_THRESHOLD
} from "../../store/plantStore";

import {
  waterInventory,
  sunInventory,
  fertilizerInventory,
  activePlantId,
  fastForwardCooldowns,
  syncUserState,
  refreshInventory
} from "../../store/resourceStore";

import { fastForwardBackendTime, createPlant, fetchMyActivePlant } from "../../store/apiClient";
import { PLANT_SPRITE_REGISTRY } from "../../config/plantSpriteRegistry";

// Especies con sprites disponibles en el registro
const AVAILABLE_SPECIES = Object.keys(PLANT_SPRITE_REGISTRY);
const SPECIES_LABELS: Record<string, string> = {
  pasto: "🌿 Pasto",
  nogal: "🌰 Nogal",
  cedro: "🌲 Cedro",
};

export default function DebugPanel() {
  const [creatingPlant, setCreatingPlant] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("pasto");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  if (!isDebugOpen.value) return null;

  const handleFastForward = async (hours: number) => {
    fastForwardTime(hours);
    fastForwardCooldowns(hours);
    try {
      const updatedUser = await fastForwardBackendTime(hours);
      syncUserState(updatedUser);
    } catch (e) {
      console.error("Error adelantando tiempo en backend", e);
    }
  };

  const handleCreatePlant = async () => {
    setCreatingPlant(true);
    setCreateMsg(null);
    try {
      await createPlant(selectedSpecies);
      setCreateMsg(`✅ ${SPECIES_LABELS[selectedSpecies] ?? selectedSpecies} creado.`);
      refreshInventory(); // Refrescar inventario para mostrar la nueva planta
    } catch (e: any) {
      setCreateMsg(`❌ ${e.message ?? "Error al crear la planta."}`);
    } finally {
      setCreatingPlant(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 border-4 border-red-600 text-white p-8 rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-slate-800">
        <button 
          onClick={() => isDebugOpen.value = false}
          className="absolute top-2 right-4 text-red-500 font-bold text-2xl hover:text-red-400"
        >
          X
        </button>
        
        <h2 className="text-2xl font-black text-red-500 mb-6 uppercase tracking-wider border-b-2 border-red-900 pb-2">
          🛠 Admin Debug Panel
        </h2>

        <div className="space-y-6">

          {/* ── Estado de Planta ── */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-base text-slate-400 uppercase font-bold mb-3">Estado de Planta</h3>
            <div className="grid grid-cols-2 gap-3 text-base">
              <span>Fase:</span> <span className="font-bold text-amber-400">{plantPhase.value}</span>
              <span>Especie:</span> <span className="font-bold text-purple-400">{plantSpeciesId.value}</span>
              <span>Salud:</span> 
              <span className={`font-bold ${plantHealth.value <= CRITICAL_HEALTH_THRESHOLD ? 'text-red-500' : 'text-green-400'}`}>
                {Math.round(plantHealth.value)} / 100
              </span>
              <span>Progreso Agua:</span> <span className="font-bold text-blue-400">{plantWaterProgress.value.toFixed(4)}</span>
              <span>Progreso Sol:</span> <span className="font-bold text-yellow-400">{plantSunProgress.value.toFixed(4)}</span>
              <span>Progreso Abono:</span> <span className="font-bold text-emerald-400">{plantFertilizerProgress.value.toFixed(4)}</span>
            </div>
            
            <div className="mt-4 flex gap-3">
               <button 
                  onClick={() => plantHealth.value = Math.max(0, plantHealth.value - 10)}
                  className="flex-1 bg-red-900/50 hover:bg-red-800 text-sm font-bold py-2 rounded transition-colors"
               >
                  Daño (-10)
               </button>
               <button 
                  onClick={() => plantHealth.value = Math.min(100, plantHealth.value + 10)}
                  className="flex-1 bg-green-900/50 hover:bg-green-800 text-sm font-bold py-2 rounded transition-colors"
               >
                  Cura (+10)
               </button>
            </div>
            
            <div className="mt-3 flex gap-3">
               <button 
                  onClick={() => evolvePlant()}
                  className="flex-1 bg-purple-700 hover:bg-purple-600 font-bold py-2 rounded shadow-lg transition-transform active:scale-95"
               >
                  Forzar Evolución
               </button>
               <button 
                  onClick={() => resetPlant()}
                  className="flex-1 bg-orange-700 hover:bg-orange-600 font-bold py-2 rounded shadow-lg transition-transform active:scale-95"
               >
                  Reiniciar Planta
               </button>
            </div>
          </div>

          {/* ── Crear Nueva Planta ── */}
          <div className="bg-slate-800 p-4 rounded-lg border border-purple-800">
            <h3 className="text-base text-purple-400 uppercase font-bold mb-3">🌱 Crear Nueva Planta</h3>
            <div className="flex gap-2 mb-3">
              {AVAILABLE_SPECIES.map(sp => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpecies(sp)}
                  className={`flex-1 py-2 rounded font-bold text-sm transition-all active:scale-95
                    ${selectedSpecies === sp
                      ? "bg-purple-600 text-white ring-2 ring-purple-400"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    }`}
                >
                  {SPECIES_LABELS[sp] ?? sp}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreatePlant}
              disabled={creatingPlant}
              className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 font-black py-2 rounded shadow-lg transition-transform active:scale-95"
            >
              {creatingPlant ? "Creando..." : `Crear ${SPECIES_LABELS[selectedSpecies] ?? selectedSpecies}`}
            </button>
            {createMsg && (
              <p className="text-xs text-center mt-2 font-medium text-slate-300">{createMsg}</p>
            )}
          </div>

          {/* ── Trampas y Simuladores ── */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-base text-slate-400 uppercase font-bold mb-3">Trampas y Simuladores</h3>
            <div className="flex gap-3 mb-3">
              <button 
                onClick={() => waterInventory.value += 5}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-sm py-2 rounded font-bold transition-transform active:scale-95"
              >
                +5 Agua
              </button>
              <button 
                onClick={() => sunInventory.value += 5}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-sm py-2 rounded font-bold transition-transform active:scale-95"
              >
                +5 Sol
              </button>
              <button 
                onClick={() => fertilizerInventory.value += 5}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-sm py-2 rounded font-bold transition-transform active:scale-95"
              >
                +5 Abono
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => handleFastForward(5 / 60)}
                className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded shadow transition-transform active:scale-95"
              >
                ⏩ +5 Minutos
              </button>
              <button 
                onClick={() => handleFastForward(10 / 60)}
                className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded shadow transition-transform active:scale-95"
              >
                ⏩ +10 Minutos
              </button>
              <button 
                onClick={() => handleFastForward(1)}
                className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded shadow transition-transform active:scale-95"
              >
                ⏩ +1 Hora
              </button>
              <button 
                onClick={() => handleFastForward(24)}
                className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded shadow transition-transform active:scale-95"
              >
                ⏩ +1 Día
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 italic">Avanzar tiempo afecta la salud y los cooldowns</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
