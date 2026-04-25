/**
 * plantSpriteRegistry.ts
 *
 * Registro centralizado de sprites por especie y fase.
 * Para añadir una especie nueva:
 *   1. Crea su carpeta en `src/assets/Recursos planta/Sprites <NombreEspecie>/`
 *   2. Añade sus 4 imágenes (seed, small_bush, large_bush, ent)
 *   3. Importa y registra la entrada aquí, sin tocar Plant.tsx
 */

import type { PlantPhase } from "../store/plantStore";

export interface SpriteConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number; // 1 = imagen estática, >1 = spritesheet animado
  scale: number;
  hitbox: string;
}

// ─────────────────────────────────────────────
// PASTO  (Spritesheets animados)
// ─────────────────────────────────────────────
import pasto_seed from '../assets/Recursos planta/Sprites Pasto/semilla_idle_spritesheet.png';
import pasto_small_bush from '../assets/Recursos planta/Sprites Pasto/fase2_idle_spritesheet.png';
import pasto_large_bush from '../assets/Recursos planta/Sprites Pasto/fase3_idle_spritesheet.png';
import pasto_ent from '../assets/Recursos planta/Sprites Pasto/end_idle_spritesheet.png';

// ─────────────────────────────────────────────
// NOGAL  (Imágenes estáticas)
// ─────────────────────────────────────────────
import nogal_seed from '../assets/Recursos planta/Sprites Nogal/Azul.png';
import nogal_small_bush from '../assets/Recursos planta/Sprites Nogal/Azul - copia.png';
import nogal_large_bush from '../assets/Recursos planta/Sprites Nogal/Azul - copia (2).png';
import nogal_ent from '../assets/Recursos planta/Sprites Nogal/Azul - copia (3).png';

// ─────────────────────────────────────────────
// CEDRO  (Imágenes estáticas)
// ─────────────────────────────────────────────
import cedro_seed from '../assets/Recursos planta/Sprites Cedro/Verde.png';
import cedro_small_bush from '../assets/Recursos planta/Sprites Cedro/Verde - copia.png';
import cedro_large_bush from '../assets/Recursos planta/Sprites Cedro/Verde - copia (2).png';
import cedro_ent from '../assets/Recursos planta/Sprites Cedro/Verde - copia (3).png';

// ─────────────────────────────────────────────
// PRUEBA (duraznillo)  (Spritesheets animados)
// ─────────────────────────────────────────────
import prueba_seed from '../assets/Recursos planta/Sprites prueba/prueba_asemilla_idle.png';
import prueba_small_bush from '../assets/Recursos planta/Sprites prueba/prueba_fase1_idle.png';
import prueba_large_bush from '../assets/Recursos planta/Sprites prueba/prueba_fase1_idle.png';
import prueba_ent from '../assets/Recursos planta/Sprites prueba/prueba_ent_idle.png';

// ─────────────────────────────────────────────
// Helper para crear configuraciones fácilmente
// ─────────────────────────────────────────────
function createPlantConfig(
  sources: { seed: string; small_bush: string; large_bush: string; ent: string },
  scales: number | { seed: number; small_bush: number; large_bush: number; ent: number } = 1.0,
  frameCount: number = 18,
  frameWidth: number = 477,
  frameHeight: number = 510
): Record<PlantPhase, SpriteConfig> {
  const s = typeof scales === "number" ? { seed: scales, small_bush: scales, large_bush: scales, ent: scales } : scales;
  const base = { frameWidth, frameHeight, frameCount };
  return {
    seed:       { ...base, src: sources.seed,       scale: s.seed,       hitbox: "w-32 h-32" },
    small_bush: { ...base, src: sources.small_bush, scale: s.small_bush, hitbox: "w-48 h-48" },
    large_bush: { ...base, src: sources.large_bush, scale: s.large_bush, hitbox: "w-56 h-64" },
    ent:        { ...base, src: sources.ent,        scale: s.ent,        hitbox: "w-64 h-80" },
  };
}

// ─────────────────────────────────────────────
// Registro completo: speciesId → fase → SpriteConfig
// ─────────────────────────────────────────────
export const PLANT_SPRITE_REGISTRY: Record<string, Record<PlantPhase, SpriteConfig>> = {
  pasto: createPlantConfig(
    { seed: pasto_seed.src, small_bush: pasto_small_bush.src, large_bush: pasto_large_bush.src, ent: pasto_ent.src },
    { seed: 2.5, small_bush: 2.3, large_bush: 2.0, ent: 1.2 }
  ),
  nogal: createPlantConfig(
    { seed: nogal_seed.src, small_bush: nogal_small_bush.src, large_bush: nogal_large_bush.src, ent: nogal_ent.src }
  ),
  cedro: createPlantConfig(
    { seed: cedro_seed.src, small_bush: cedro_small_bush.src, large_bush: cedro_large_bush.src, ent: cedro_ent.src }
  ),
  duraznillo: createPlantConfig(
    { seed: prueba_seed.src, small_bush: prueba_small_bush.src, large_bush: prueba_large_bush.src, ent: prueba_ent.src }
  ),

  // ── Para añadir una nueva especie: ──
  // nueva_especie: createPlantConfig(
  //   { seed: nueva_seed.src, small_bush: nueva_small_bush.src, large_bush: nueva_large_bush.src, ent: nueva_ent.src },
  //   1.0, // Escala (opcional, por defecto 1.0)
  //   1    // Número de frames (opcional, por defecto 18)
  // ),
};

/** Especie de fallback si la activa no tiene sprites registrados */
export const FALLBACK_SPECIES = "pasto";

/** Devuelve la config de un sprite dado speciesId y fase, con fallback garantizado */
export function getSpriteConfig(speciesId: string, phase: PlantPhase): SpriteConfig {
  const species = PLANT_SPRITE_REGISTRY[speciesId] ?? PLANT_SPRITE_REGISTRY[FALLBACK_SPECIES];
  return species[phase];
}
