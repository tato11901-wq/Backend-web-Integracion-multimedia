import { signal, computed } from "@preact/signals";

// ── Identidad del Usuario ──
export const userId = signal<string | null>(null);
export const username = signal<string>("");

// ── Inventarios (Sincronizados desde el Backend) ──
export const waterInventory = signal(0);
export const sunInventory = signal(0);
export const compostInventory = signal(0);
export const fertilizerInventory = signal(0);

// Aliases para compatibilidad con código antiguo mientras se refactoriza
export const waterLevel = waterInventory;
export const compostLevel = compostInventory;

// ── Cooldowns (Timestamps ISO del Backend) ──
export const waterCooldownEnds = signal<string | null>(null);
export const compostCooldownEnds = signal<string | null>(null);
export const sunCooldownEnds = signal<string | null>(null);

export const isWaterOnCooldown = computed(() => {
  if (!waterCooldownEnds.value) return false;
  return new Date(waterCooldownEnds.value) > new Date();
});

export const isCompostOnCooldown = computed(() => {
  if (!compostCooldownEnds.value) return false;
  return new Date(compostCooldownEnds.value) > new Date();
});

export const isSunOnCooldown = computed(() => {
  if (!sunCooldownEnds.value) return false;
  return new Date(sunCooldownEnds.value) > new Date();
});

// ── Estado de la UI ──
export const isWaterGameOpen = signal(false);
export const isCompostGameOpen = signal(false);
export const isSunGameOpen = signal(false);
export const isPlantInfoOpen = signal(false);
export const isInventoryOpen = signal(false);
export const isHelpModalOpen = signal(false);

/**
 * Sincroniza el estado global del cliente con los datos recibidos del servidor.
 * @param backendUser Objeto de usuario retornado por la API de FastAPI.
 */
export function syncUserState(backendUser: any) {
  userId.value = backendUser.id;
  username.value = backendUser.username;
  waterInventory.value = backendUser.water_inventory;
  sunInventory.value = backendUser.sun_inventory;
  compostInventory.value = backendUser.compost_inventory;
  fertilizerInventory.value = backendUser.fertilizer_inventory;
  
  // Sincronizar cooldowns si vienen en la respuesta
  if (backendUser.last_water_minigame) {
    const lastPlayed = new Date(backendUser.last_water_minigame);
    const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
    waterCooldownEnds.value = ends.toISOString();
  }
  
  if (backendUser.last_compost_minigame) {
    const lastPlayed = new Date(backendUser.last_compost_minigame);
    const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
    compostCooldownEnds.value = ends.toISOString();
  }

  if (backendUser.last_sun_minigame) {
    const lastPlayed = new Date(backendUser.last_sun_minigame);
    const ends = new Date(lastPlayed.getTime() + (10 * 60 + 5) * 1000);
    sunCooldownEnds.value = ends.toISOString();
  }
}
