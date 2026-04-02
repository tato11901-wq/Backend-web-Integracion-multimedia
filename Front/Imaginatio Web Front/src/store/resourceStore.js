import { signal } from "@preact/signals"

// Estado global del agua
export const waterLevel = signal(0)

// Estado del mini juego
export const isWaterGameOpen = signal(false)

// (Opcional pero recomendado) función para actualizar
export function addWater(amount) {
  waterLevel.value = waterLevel.value + amount
}

// Estado global de la composta
export const compostLevel = signal(0)

// Estado del mini juego de composta
export const isCompostGameOpen = signal(false)

// Función para actualizar composta
export function addCompost(amount) {
  compostLevel.value = compostLevel.value + amount
}

// Estado del pop up de información de la planta
export const isPlantInfoOpen = signal(false)

// Estado del inventario
export const isInventoryOpen = signal(false)