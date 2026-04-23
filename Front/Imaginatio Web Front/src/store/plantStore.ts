import { signal, effect } from "@preact/signals";
import { waterInventory, sunInventory, fertilizerInventory } from "./resourceStore";

export type PlantPhase = "semilla" | "arbusto_pequeño" | "arbusto_grande" | "ent";

// Requisitos de evolución (Agua, Sol, Abono)
export const EVOLUTION_REQUIREMENTS: Record<PlantPhase, { water: number; sun: number; fertilizer: number } | null> = {
  semilla: { water: 3, sun: 3, fertilizer: 1 },
  arbusto_pequeño: { water: 5, sun: 5, fertilizer: 2 },
  arbusto_grande: { water: 7, sun: 7, fertilizer: 3 },
  ent: null, // Máximo nivel
};

export const MAX_HEALTH = 100;
export const CRITICAL_HEALTH_THRESHOLD = 20;

// Estado de la planta
export const plantPhase = signal<PlantPhase>("semilla");
export const plantHealth = signal<number>(100);
export const plantWaterProgress = signal<number>(0);
export const plantSunProgress = signal<number>(0);
export const plantFertilizerProgress = signal<number>(0);

export const isDebugOpen = signal<boolean>(false);

// Tiempos para decaimiento de salud exacto al backend (72 horas para morir)
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
    } catch (e) {
      console.error("Error parsing plant JSON state", e);
    }
  }
}

// Cargar estado inicial
if (typeof window !== "undefined") {
  loadPlantFromJSON();
}

// Autoguardado cuando cambian los valores
effect(() => {
  // Solo referenciamos los valores para que Preact Signals suscriba este efecto
  const _ = plantPhase.value;
  const __ = plantHealth.value;
  const ___ = plantWaterProgress.value;
  const ____ = plantSunProgress.value;
  const _____ = plantFertilizerProgress.value;
  const ______ = plantLastUpdate.value;
  
  if (typeof window !== "undefined") {
    savePlantToJSON();
  }
});

// --- Lógica de Decaimiento de Salud (en segundo plano) ---
// Calcula y aplica la misma fórmula del backend (100 de salud / 72 horas)
export function updatePassiveHealth() {
  if (plantHealth.value <= 0) return;

  const now = Date.now();
  const diffMs = now - plantLastUpdate.value;
  
  // Evitar procesamientos de tiempos negativos por desajustes del reloj
  if (diffMs > 0) {
    const hoursPassed = diffMs / (1000 * 60 * 60);
    const healthLost = HEALTH_LOSS_PER_HOUR * hoursPassed;
    
    // Si la salud se pierde, actualizamos
    if (healthLost > 0) {
      plantHealth.value = Math.max(0, plantHealth.value - healthLost);
      plantLastUpdate.value = now;
    }
  } else {
    // Si la última actualización es en el futuro (desajuste reloj), forzamos reinicio
    plantLastUpdate.value = now;
  }
}

// Actualizar salud tan pronto se carga para aplicar el decaimiento de tiempo offline
if (typeof window !== "undefined") {
  updatePassiveHealth();

  // Y luego actualizarla cada 1 minuto
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
    plantWaterProgress.value >= reqs.water &&
    plantSunProgress.value >= reqs.sun &&
    plantFertilizerProgress.value >= reqs.fertilizer
  ) {
    evolvePlant();
  }
}

export function evolvePlant() {
  if (plantPhase.value === "semilla") {
    plantPhase.value = "arbusto_pequeño";
  } else if (plantPhase.value === "arbusto_pequeño") {
    plantPhase.value = "arbusto_grande";
  } else if (plantPhase.value === "arbusto_grande") {
    plantPhase.value = "ent";
  }

  // Reiniciar progresos parciales
  plantWaterProgress.value = 0;
  plantSunProgress.value = 0;
  plantFertilizerProgress.value = 0;
  plantHealth.value = MAX_HEALTH;
}

export function resetPlant() {
  plantPhase.value = "semilla";
  plantHealth.value = MAX_HEALTH;
  plantWaterProgress.value = 0;
  plantSunProgress.value = 0;
  plantFertilizerProgress.value = 0;
  plantLastUpdate.value = Date.now();
}

export function fastForwardTime(hours: number) {
  // Simulamos que el tiempo pasó restando horas al lastUpdate
  plantLastUpdate.value -= hours * 60 * 60 * 1000;
  // Forzamos el cálculo de la salud
  updatePassiveHealth();
}

export function applyWater() {
  if (waterInventory.value < 1) {
    alert("No tienes agua en el inventario.");
    return;
  }
  
  if (plantHealth.value <= 0) {
    alert("La planta no tiene salud.");
    return;
  }

  // Descontar inventario
  waterInventory.value -= 1;

  // Recuperación básica de salud (el agua cura)
  plantHealth.value = Math.min(MAX_HEALTH, plantHealth.value + 15);

  // Si no está crítica, cuenta como progreso
  if (!isCritical()) {
    plantWaterProgress.value += 1;
    checkEvolution();
  } else {
    // Si estaba crítica, el agua se usó principalmente para recuperarla.
    console.log("Planta en estado crítico: El agua se ha usado para recuperarla, sin progreso evolutivo.");
  }
}

export function applySun() {
  if (sunInventory.value < 1) {
    alert("No tienes soles en el inventario.");
    return;
  }
  
  if (plantHealth.value <= 0) {
    alert("La planta no tiene salud.");
    return;
  }

  sunInventory.value -= 1;

  // El sol cura un poco también
  plantHealth.value = Math.min(MAX_HEALTH, plantHealth.value + 5);

  if (!isCritical()) {
    plantSunProgress.value += 1;
    checkEvolution();
  }
}

export function applyFertilizer() {
  if (fertilizerInventory.value < 1) {
    alert("No tienes abono en el inventario.");
    return;
  }

  if (plantHealth.value <= 0) {
    alert("La planta no tiene salud.");
    return;
  }

  fertilizerInventory.value -= 1;

  plantHealth.value = Math.min(MAX_HEALTH, plantHealth.value + 30);

  if (!isCritical()) {
    plantFertilizerProgress.value += 1;
    checkEvolution(); // El abono es el trigger final
  }
}
