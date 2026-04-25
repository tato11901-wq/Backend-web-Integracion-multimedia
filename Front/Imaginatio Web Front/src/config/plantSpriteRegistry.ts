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
import pasto_seed        from '../assets/Recursos planta/Sprites Pasto/semilla_idle_spritesheet.png';
import pasto_small_bush  from '../assets/Recursos planta/Sprites Pasto/fase2_idle_spritesheet.png';
import pasto_large_bush  from '../assets/Recursos planta/Sprites Pasto/fase3_idle_spritesheet.png';
import pasto_ent         from '../assets/Recursos planta/Sprites Pasto/end_idle_spritesheet.png';

// ─────────────────────────────────────────────
// NOGAL  (Imágenes estáticas)
// ─────────────────────────────────────────────
import nogal_seed        from '../assets/Recursos planta/Sprites Nogal/Azul.png';
import nogal_small_bush  from '../assets/Recursos planta/Sprites Nogal/Azul - copia.png';
import nogal_large_bush  from '../assets/Recursos planta/Sprites Nogal/Azul - copia (2).png';
import nogal_ent         from '../assets/Recursos planta/Sprites Nogal/Azul - copia (3).png';

// ─────────────────────────────────────────────
// CEDRO  (Imágenes estáticas)
// ─────────────────────────────────────────────
import cedro_seed        from '../assets/Recursos planta/Sprites Cedro/Verde.png';
import cedro_small_bush  from '../assets/Recursos planta/Sprites Cedro/Verde - copia.png';
import cedro_large_bush  from '../assets/Recursos planta/Sprites Cedro/Verde - copia (2).png';
import cedro_ent         from '../assets/Recursos planta/Sprites Cedro/Verde - copia (3).png';

// ─────────────────────────────────────────────
// Registro completo: speciesId → fase → SpriteConfig
// ─────────────────────────────────────────────
export const PLANT_SPRITE_REGISTRY: Record<string, Record<PlantPhase, SpriteConfig>> = {
  pasto: {
    seed:       { src: pasto_seed.src,       frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 2.5, hitbox: "w-32 h-32" },
    small_bush: { src: pasto_small_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 2.3, hitbox: "w-48 h-48" },
    large_bush: { src: pasto_large_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 2,   hitbox: "w-56 h-64" },
    ent:        { src: pasto_ent.src,        frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.2, hitbox: "w-64 h-80" },
  },
  nogal: {
    seed:       { src: nogal_seed.src,       frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-32 h-32" },
    small_bush: { src: nogal_small_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-48 h-48" },
    large_bush: { src: nogal_large_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-56 h-64" },
    ent:        { src: nogal_ent.src,        frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-64 h-80" },
  },
  cedro: {
    seed:       { src: cedro_seed.src,       frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-32 h-32" },
    small_bush: { src: cedro_small_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-48 h-48" },
    large_bush: { src: cedro_large_bush.src, frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-56 h-64" },
    ent:        { src: cedro_ent.src,        frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 1.0, hitbox: "w-64 h-80" },
  },

  // ── Para añadir una nueva especie, duplica el bloque de arriba ──
  // nueva_especie: {
  //   seed:       { src: nueva_seed.src,       frameWidth: 477, frameHeight: 510, frameCount: 18, scale: 2.5, hitbox: "w-32 h-32" },
  //   small_bush: { src: nueva_small_bush.src, ... },
  //   large_bush: { src: nueva_large_bush.src, ... },
  //   ent:        { src: nueva_ent.src,        ... },
  // },
};

/** Especie de fallback si la activa no tiene sprites registrados */
export const FALLBACK_SPECIES = "pasto";

/** Devuelve la config de un sprite dado speciesId y fase, con fallback garantizado */
export function getSpriteConfig(speciesId: string, phase: PlantPhase): SpriteConfig {
  const species = PLANT_SPRITE_REGISTRY[speciesId] ?? PLANT_SPRITE_REGISTRY[FALLBACK_SPECIES];
  return species[phase];
}
