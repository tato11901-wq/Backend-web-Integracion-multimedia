import { useState, useEffect } from "preact/hooks";
import {
  plantPhase,
  plantHealth,
  plantWaterProgress,
  plantSunProgress,
  plantFertilizerProgress,
  plantSpeciesId,
  plantUnitySubid,
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

import { fastForwardBackendTime, createPlant, fetchMyActivePlant, addDebugResourcesBackend } from "../../store/apiClient";
import { PLANT_SPRITE_REGISTRY } from "../../config/plantSpriteRegistry";
import { getFreshTreeData, downloadTreeFile } from "../../store/unityBridge";
import SPECIES_JSON from "../../config/species.json";

// Especies disponibles en el catálogo maestro
const AVAILABLE_SPECIES = Object.keys(SPECIES_JSON);
const SPECIES_LABELS: Record<string, string> = {
  pasto: "🌿 Pasto",
  nogal: "🌰 Nogal",
  cedro: "🌲 Cedro",
};

export default function DebugPanel() {
  const [creatingPlant, setCreatingPlant] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("pasto");
  const [selectedSubid, setSelectedSubid] = useState<string | null>(null);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [unityPreview, setUnityPreview] = useState<string | null>(null);
  const [plantSearch, setPlantSearch] = useState<string>("");

  useEffect(() => {
    setSelectedSubid(null);
  }, [selectedSpecies]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (unityPreview) {
          setUnityPreview(null);
        } else if (isDebugOpen.value) {
          isDebugOpen.value = false;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unityPreview]);

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
      await createPlant(selectedSpecies, selectedSubid || undefined);
      setCreateMsg(`✅ ${((SPECIES_JSON as any)[selectedSpecies]?.common_name) ?? selectedSpecies} creado.`);
      refreshInventory();
    } catch (e: any) {
      setCreateMsg(`❌ ${e.message ?? "Error al crear la planta."}`);
    } finally {
      setCreatingPlant(false);
    }
  };

  const handleAddResource = async (type: 'water' | 'sun' | 'fertilizer') => {
    try {
      const water = type === 'water' ? 5 : 0;
      const sun = type === 'sun' ? 5 : 0;
      const fertilizer = type === 'fertilizer' ? 5 : 0;
      const updatedUser = await addDebugResourcesBackend(water, sun, fertilizer);
      syncUserState(updatedUser);
    } catch (e) {
      console.error("Error añadiendo recursos en backend", e);
    }
  };

  return (
    <>
      {/* ── Panel principal ── */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
        <div className="bg-slate-900 border-4 border-red-600 text-white p-6 rounded-2xl w-[900px] max-w-[95%] max-h-[90%] overflow-y-auto shadow-2xl relative scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-slate-800">
          <button
            onClick={() => isDebugOpen.value = false}
            className="absolute top-2 right-4 text-red-500 font-bold text-2xl hover:text-red-400"
          >
            X
          </button>

          <h2 className="text-2xl font-black text-red-500 mb-6 uppercase tracking-wider border-b-2 border-red-900 pb-2">
            🛠 Admin Debug Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── Estado de Planta ── */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="text-base text-slate-400 uppercase font-bold mb-3">Estado de Planta</h3>
              <div className="grid grid-cols-2 gap-3 text-base">
                <span>Fase:</span> <span className="font-bold text-amber-400">{plantPhase.value}</span>
                <span>Especie:</span> <span className="font-bold text-purple-400">{(SPECIES_JSON as any)[plantSpeciesId.value]?.common_name || plantSpeciesId.value}</span>
                <span>Autor / Modelo:</span> <span className="font-bold text-pink-400">{plantUnitySubid.value || "Base / Generico"}</span>
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
              <input
                type="text"
                placeholder="Filtrar por ID de planta..."
                className="w-full px-3 py-2 mb-3 bg-slate-700 text-white border border-slate-600 rounded text-sm outline-none focus:ring-2 focus:ring-purple-500"
                value={plantSearch}
                onInput={(e) => setPlantSearch((e.target as HTMLInputElement).value)}
              />
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-800 scrollbar-track-slate-800 pr-2">
                {AVAILABLE_SPECIES.filter(sp => sp.toLowerCase().includes(plantSearch.toLowerCase())).map(sp => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSpecies(sp)}
                    title={sp}
                    className={`py-2 px-1 rounded font-bold text-[10px] truncate transition-all active:scale-95
                      ${selectedSpecies === sp
                        ? "bg-purple-600 text-white ring-2 ring-purple-400"
                        : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                  >
                    {((SPECIES_JSON as any)[sp]?.common_name) ?? sp}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreatePlant}
                disabled={creatingPlant}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 font-black py-2 rounded shadow-lg transition-transform active:scale-95"
              >
                {creatingPlant ? "Creando..." : `Crear ${((SPECIES_JSON as any)[selectedSpecies]?.common_name) ?? selectedSpecies}`}
              </button>
              {createMsg && (
                <p className="text-xs text-center mt-2 font-medium text-slate-300">{createMsg}</p>
              )}

              {/* Sub-selector de Autores/SubID */}
              {selectedSpecies && (SPECIES_JSON as any)[selectedSpecies]?.subids?.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Seleccionar Autor (Opcional)</span>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-slate-800">
                    <button
                      onClick={() => setSelectedSubid(null)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${!selectedSubid ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      Aleatorio
                    </button>
                    {(SPECIES_JSON as any)[selectedSpecies].subids.map((sub: string) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubid(sub)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${selectedSubid === sub ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-400"}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Trampas y Simuladores ── */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="text-base text-slate-400 uppercase font-bold mb-3">Trampas y Simuladores</h3>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => handleAddResource('water')}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-sm py-2 rounded font-bold transition-transform active:scale-95"
                >
                  +5 Agua
                </button>
                <button
                  onClick={() => handleAddResource('sun')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-sm py-2 rounded font-bold transition-transform active:scale-95"
                >
                  +5 Sol
                </button>
                <button
                  onClick={() => handleAddResource('fertilizer')}
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

            {/* ── Unity Bridge Inspector ── */}
            <div className="bg-slate-800 p-4 rounded-lg border border-violet-800">
              <h3 className="text-base text-violet-400 uppercase font-bold mb-3">🎮 Unity Bridge (.tree)</h3>
              <p className="text-[10px] text-slate-400 mb-3 italic">
                Muestra el archivo .tree v2 completo (todas las plantas sin filtro) que se intercambia con Unity.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const tree = getFreshTreeData();
                    setUnityPreview(JSON.stringify(tree, null, 2));
                  }}
                  className="flex-1 bg-violet-700 hover:bg-violet-600 text-sm font-bold py-2 rounded transition-transform active:scale-95"
                >
                  👁 Ver .tree
                </button>
                <button
                  onClick={() => downloadTreeFile()}
                  className="flex-1 bg-violet-900 hover:bg-violet-800 text-sm font-bold py-2 rounded transition-transform active:scale-95"
                >
                  ⬇️ Descargar .tree
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                {getFreshTreeData().plantas.length} planta(s) en .tree — {getFreshTreeData().semillas.length} semilla(s) de 3D
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modal de preview Unity JSON ── */}
      {unityPreview && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setUnityPreview(null)}
        >
          <div
            className="bg-slate-900 border-2 border-violet-500 rounded-2xl p-6 w-[700px] max-w-[95%] max-h-[80%] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-violet-400 font-black text-lg uppercase tracking-wider">🎮 Archivo .tree (v2)</h3>
              <button
                onClick={() => setUnityPreview(null)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
              {unityPreview}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
