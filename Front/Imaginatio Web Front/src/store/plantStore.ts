import { signal, effect, batch } from "@preact/signals";
import { waterInventory, sunInventory, fertilizerInventory, activePlantId } from "./resourceStore";
import { applyPlantAction, evolvePlantApi } from "./apiClient";

export type PlantPhase = "seed" | "small_bush" | "large_bush" | "ent";

export interface SpeciesRequirements {
  water: number;
  sun: number;
  fertilizer: number;
}

// Requisitos de evolución por especie y fase — se actualizan dinámicamente desde el backend
// Los valores por defecto corresponden al "pasto" (especie base)
let _evolutionRequirements: Record<PlantPhase, SpeciesRequirements | null> = {
  seed:        { water: 4, sun: 4, fertilizer: 4 },
  small_bush:  { water: 6, sun: 6, fertilizer: 6 },
  large_bush:  { water: 8, sun: 8, fertilizer: 8 },
  ent: null,
};

// Mapeo de las claves del backend (MAYÚSCULAS) a las del frontend (minúsculas)
const PHASE_KEY_MAP: Record<string, PlantPhase> = {
  SEED: "seed",
  SMALL_BUSH: "small_bush",
  LARGE_BUSH: "large_bush",
};

export function setEvolutionRequirementsFromSpecies(speciesData: any) {
  const reqs = speciesData?.evolution_requirements;
  if (!reqs) return;

  const newReqs: Record<PlantPhase, SpeciesRequirements | null> = {
    seed:       null,
    small_bush: null,
    large_bush: null,
    ent:        null,
  };

  for (const [key, val] of Object.entries(reqs)) {
    const phase = PHASE_KEY_MAP[key];
    if (phase && val && typeof val === "object") {
      newReqs[phase] = val as SpeciesRequirements;
    }
  }

  _evolutionRequirements = newReqs;
}

export function getEvolutionRequirements(): Record<PlantPhase, SpeciesRequirements | null> {
  return _evolutionRequirements;
}

// Para compatibilidad con los componentes existentes que importan EVOLUTION_REQUIREMENTS directamente,
// exportamos un objeto proxy reactivo.
export const EVOLUTION_REQUIREMENTS = new Proxy({} as Record<PlantPhase, SpeciesRequirements | null>, {
  get(_target, prop: string) {
    return _evolutionRequirements[prop as PlantPhase];
  }
});

export const MAX_HEALTH = 100;
export const CRITICAL_HEALTH_THRESHOLD = 20;

// Estado de la planta
export const plantPhase = signal<PlantPhase>("seed");
export const plantHealth = signal<number>(100);
export const plantWaterProgress = signal<number>(4); // Default pasto seed
export const plantSunProgress = signal<number>(4);   // Default pasto seed
export const plantFertilizerProgress = signal<number>(0);
export const plantSpeciesId = signal<string>("pasto"); // Especie activa

export const isDebugOpen = signal<boolean>(false);

// Signals de animación
export const waterAnimationTrigger = signal<number>(0);
export const fertilizerAnimationTrigger = signal<number>(0);
export const sunAnimationTrigger = signal<number>(0);
export const isWatering = signal<boolean>(false);
export const isFertilizing = signal<boolean>(false);
export const isSunning = signal<boolean>(false);
export const isEvolving = signal<boolean>(false);

// Para decaimiento
export const HEALTH_LOSS_PER_HOUR = 100.0 / 72.0;
export const plantLastUpdate = signal<number>(Date.now());

// --- Carga y Guardado (JSON / LocalStorage) ---

export function savePlantToJSON() {
  const state = {
    phase: plantPhase.value,
    health: plantHealth.value,
    waterProgress: plantWaterProgress.value,
    sunProgress: plantSunProgress.value,
    fertilizerProgress: plantFertilizerProgress.value,
    lastUpdate: plantLastUpdate.value,
    speciesId: plantSpeciesId.value,
  };
  localStorage.setItem("imaginatio_plant_state", JSON.stringify(state));
}

export function loadPlantFromJSON() {
  const data = localStorage.getItem("imaginatio_plant_state");
  if (data) {
    try {
      const state = JSON.parse(data);
      if (state.phase) plantPhase.value = state.phase;
      if (typeof state.health === "number") plantHealth.value = state.health;
      if (typeof state.waterProgress === "number") plantWaterProgress.value = state.waterProgress;
      if (typeof state.sunProgress === "number") plantSunProgress.value = state.sunProgress;
      if (typeof state.fertilizerProgress === "number") plantFertilizerProgress.value = state.fertilizerProgress;
      if (typeof state.lastUpdate === "number") plantLastUpdate.value = state.lastUpdate;
      if (state.speciesId) plantSpeciesId.value = state.speciesId;
    } catch (e) {
      console.error("Error parsing plant JSON state", e);
    }
  }
}

export function syncPlantState(backendPlant: any) {
  if (backendPlant) {
    batch(() => {
      if (backendPlant.stage) plantPhase.value = backendPlant.stage;
      if (typeof backendPlant.health === "number") plantHealth.value = backendPlant.health;
      if (typeof backendPlant.water === "number") plantWaterProgress.value = backendPlant.water;
      if (typeof backendPlant.sun === "number") plantSunProgress.value = backendPlant.sun;
      if (typeof backendPlant.fertilizer === "number") plantFertilizerProgress.value = backendPlant.fertilizer;
      if (backendPlant.last_update) {
        plantLastUpdate.value = new Date(backendPlant.last_update).getTime();
      }
      if (backendPlant.species_id) {
        plantSpeciesId.value = backendPlant.species_id;
      }
      // Si la respuesta incluye los datos de la especie (evolution_requirements), los cargamos
      if (backendPlant.species_data) {
        setEvolutionRequirementsFromSpecies(backendPlant.species_data);
      }
    });
  }
}

// Cargar estado inicial
if (typeof window !== "undefined") {
  loadPlantFromJSON();
}

// Autoguardado cuando cambian los valores
effect(() => {
  const _ = plantPhase.value;
  const __ = plantHealth.value;
  const ___ = plantWaterProgress.value;
  const ____ = plantSunProgress.value;
  const _____ = plantFertilizerProgress.value;
  const ______ = plantLastUpdate.value;
  const _______ = plantSpeciesId.value;

  if (typeof window !== "undefined") {
    savePlantToJSON();
  }
});

// --- Lógica de Decaimiento de Salud (en segundo plano) ---
export function updatePassiveHealth() {
  if (plantHealth.value <= 0 || plantPhase.value === "ent") return;

  const now = Date.now();
  const diffMs = now - plantLastUpdate.value;

  if (diffMs > 0) {
    const hoursPassed = diffMs / (1000 * 60 * 60);
    const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];

    if (reqs) {
      // Decaimiento fijo: 6 unidades por hora (1 cada 10 min)
      const resourceLost = hoursPassed * 6.0;
      plantWaterProgress.value = Math.max(0, plantWaterProgress.value - resourceLost);
      plantSunProgress.value = Math.max(0, plantSunProgress.value - resourceLost);
      
      // La salud visual es el porcentaje de cumplimiento del recurso más bajo (basado en unidades visibles)
      const displayW = Math.ceil(plantWaterProgress.value);
      const displayS = Math.ceil(plantSunProgress.value);
      const wPct = (displayW / reqs.water) * 100;
      const sPct = (displayS / reqs.sun) * 100;
      plantHealth.value = Math.min(100, Math.min(wPct, sPct));
      
      plantLastUpdate.value = now;

      if (plantWaterProgress.value <= 0 || plantSunProgress.value <= 0) {
        plantHealth.value = 0;
      }
    }
  }
}

// Iniciar timer de decaimiento
if (typeof window !== "undefined") {
  updatePassiveHealth();
  setInterval(() => {
    updatePassiveHealth();
  }, 60000);
}

// --- Acciones del Jugador ---

export function isCritical() {
  return plantHealth.value <= CRITICAL_HEALTH_THRESHOLD;
}

export function checkEvolution() {
  const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
  if (!reqs) return; // Ya es Ent

  if (
    Math.ceil(plantWaterProgress.value) >= reqs.water &&
    Math.ceil(plantSunProgress.value) >= reqs.sun &&
    Math.ceil(plantFertilizerProgress.value) >= reqs.fertilizer
  ) {
    evolvePlant();
  }
}

export function evolvePlant() {
  let delay = 0;
  if (isWatering.value) delay = 1450;
  if (isSunning.value) delay = 1800;
  if (isFertilizing.value) delay = 1300;

  setTimeout(() => {
    isEvolving.value = true;
    if (plantPhase.value === "seed") {
      plantPhase.value = "small_bush";
    } else if (plantPhase.value === "small_bush") {
      plantPhase.value = "large_bush";
    } else if (plantPhase.value === "large_bush") {
      plantPhase.value = "ent";
    }

    // Notificar al backend en segundo plano
    if (activePlantId.value) {
      evolvePlantApi(activePlantId.value).catch(e => console.error("Error evolucionando:", e));
    }

    // Al evolucionar: maxear agua y sol a los requerimientos de la nueva fase
    if (plantPhase.value === "ent") {
      plantWaterProgress.value = 10;
      plantSunProgress.value = 10;
      plantFertilizerProgress.value = 10;
      plantHealth.value = 100;
    } else {
      const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
      if (reqs) {
        // Maxear agua y sol al nuevo máximo
        plantWaterProgress.value = reqs.water;
        plantSunProgress.value = reqs.sun;
        // Salud = 100% porque acabamos de maxear los recursos
        plantHealth.value = 100;
      }
      plantFertilizerProgress.value = 0;
    }

    // 2.15s es la duración de la animación de evolución
    setTimeout(() => (isEvolving.value = false), 2150);
  }, delay);
}

export function resetPlant() {
  plantPhase.value = "seed";
  // Usar los requerimientos de la especie activa
  const seedReqs = EVOLUTION_REQUIREMENTS["seed"];
  plantWaterProgress.value = seedReqs?.water ?? 4;
  plantSunProgress.value = seedReqs?.sun ?? 4;
  plantFertilizerProgress.value = 0;
  plantHealth.value = 100;
  plantLastUpdate.value = Date.now();
}

export function fastForwardTime(hours: number) {
  plantLastUpdate.value -= hours * 60 * 60 * 1000;
  updatePassiveHealth();
}

export function applyWater() {
  if (waterInventory.value < 1 || plantHealth.value <= 0 || isWatering.value) return;

  const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
  if (!reqs) return;

  // Bloquear si el display ya muestra el máximo
  if (Math.ceil(plantWaterProgress.value) >= reqs.water) return;

  // Descontar inventario
  waterInventory.value -= 1;
  waterAnimationTrigger.value += 1;

  isWatering.value = true;
  setTimeout(() => (isWatering.value = false), 1334);

  // El agua sube +1 unidad hasta el máximo requerido
  if (reqs) {
    plantWaterProgress.value = Math.min(reqs.water, plantWaterProgress.value + 1);
    
    // Actualizar salud visual (basado en unidades visibles)
    const displayW = Math.ceil(plantWaterProgress.value);
    const displayS = Math.ceil(plantSunProgress.value);
    const wPct = (displayW / reqs.water) * 100;
    const sPct = (displayS / reqs.sun) * 100;
    plantHealth.value = Math.min(100, Math.min(wPct, sPct));
  }

  // Notificar al backend en segundo plano
  if (activePlantId.value) {
    applyPlantAction(activePlantId.value, "water").catch(e => console.error(e));
  }

  checkEvolution();
}

export function applySun() {
  if (sunInventory.value < 1 || plantHealth.value <= 0 || isSunning.value) return;

  const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
  if (!reqs) return;

  // Bloquear si el display ya muestra el máximo
  if (Math.ceil(plantSunProgress.value) >= reqs.sun) return;

  sunInventory.value -= 1;
  sunAnimationTrigger.value += 1;

  isSunning.value = true;
  setTimeout(() => (isSunning.value = false), 1750);

  // El sol sube +1 unidad hasta el máximo requerido
  if (reqs) {
    plantSunProgress.value = Math.min(reqs.sun, plantSunProgress.value + 1);
    
    // Actualizar salud visual (basado en unidades visibles)
    const displayW = Math.ceil(plantWaterProgress.value);
    const displayS = Math.ceil(plantSunProgress.value);
    const wPct = (displayW / reqs.water) * 100;
    const sPct = (displayS / reqs.sun) * 100;
    plantHealth.value = Math.min(100, Math.min(wPct, sPct));
  }

  // Notificar al backend en segundo plano
  if (activePlantId.value) {
    applyPlantAction(activePlantId.value, "sun").catch(e => console.error(e));
  }

  checkEvolution();
}

export function applyFertilizer() {
  if (fertilizerInventory.value < 1 || plantHealth.value <= 0 || isFertilizing.value) return;

  const reqs = EVOLUTION_REQUIREMENTS[plantPhase.value];
  if (!reqs) return;

  // Bloquear si el display ya muestra el máximo
  if (reqs.fertilizer > 0 && Math.ceil(plantFertilizerProgress.value) >= reqs.fertilizer) return;

  fertilizerInventory.value -= 1;
  fertilizerAnimationTrigger.value += 1;

  isFertilizing.value = true;
  setTimeout(() => (isFertilizing.value = false), 1250);

  // El abono da +1 unidad de progreso
  if (reqs) {
    plantFertilizerProgress.value = Math.min(reqs.fertilizer, plantFertilizerProgress.value + 1);
  }

  // Notificar al backend en segundo plano
  if (activePlantId.value) {
    applyPlantAction(activePlantId.value, "prune").catch(e => console.error(e));
  }

  checkEvolution();
}
