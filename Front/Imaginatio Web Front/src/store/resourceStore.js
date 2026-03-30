import { signal } from "@preact/signals"

// Estado global del agua
export const waterLevel = signal(0)

// Estado del mini juego
export const isWaterGameOpen = signal(false)

// (Opcional pero recomendado) función para actualizar
export function addWater(amount) {
  waterLevel.value = waterLevel.value + amount
}