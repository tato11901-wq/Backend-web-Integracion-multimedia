/**
 * unityBridge.ts
 * ──────────────────────────────────────────────────────────────
 * Capa de intercambio de datos entre la aplicación Astro/Preact y Unity WebGL.
 *
 * RESPONSABILIDADES:
 *  - Mantener un JSON canónico en localStorage (imaginatio_unity_data).
 *  - Transformar datos del inventario web al modelo canónico (solo lectura).
 *  - Construir payloads filtrados listos para consumo por Unity.
 *  - Exponer stubs para la comunicación bidireccional (implementación futura).
 *
 * NO MODIFICA:
 *  - Lógica de plantas, evolución, recursos ni debug panel.
 *  - Ningún signal de plantStore ni resourceStore.
 * ──────────────────────────────────────────────────────────────
 */

import { userId, username } from "./resourceStore";

// ═══════════════════════════════════════════════════════
// TIPOS — JSON Canónico
// ═══════════════════════════════════════════════════════

export interface UnityUser {
  user_id: string;
  user_name: string;
}

export interface UnityEnt {
  ent_id: string;          // = plant.id
  user_id: string;         // = plant.owner_id
  name: string;            // = plant.name
  category: string;        // = species_data.classification (ej: "Solar", "Hidro")
  model: string;           // = plant.species_id (ej: "aliso", "pasto")
  scientific_name: string; // = species_data.scientific_name
  state: "healthy" | "critical" | "dead";
  phase: string;           // = plant.stage tal cual viene del backend
}

/**
 * Representación mínima de una semilla para sincronización con Unity.
 * Los campos son un REFLEJO de los datos recibidos — NO se recalculan ni construyen.
 * La lógica completa de seeds reside en el sistema existente de la aplicación.
 */
export interface UnitySeed {
  seed_id: string;   // ID opaco, proviene de Unity
  user_id: string;   // Asignado automáticamente desde el store al recibir
  category: string;  // Reflejo del dato recibido
  model: string;     // Reflejo del dato recibido
}

/** Estructura canónica almacenada en localStorage. */
export interface ImaginatioUnityData {
  version: number;   // Versionado para migraciones (actual: 1)
  user: UnityUser;
  ents: UnityEnt[];
  seeds: UnitySeed[];
}

/** Payload filtrado y listo para ser consumido por Unity. */
export interface UnityPayload {
  user_id: string;
  user_name: string;
  ents: UnityEnt[];  // Solo ents healthy en fase "ent"
}

// Tipo de los datos del backend tal como llegan del inventario.
// Compatible con PlantResponse del backend sin importar el schema completo.
export interface BackendPlant {
  id: string;
  owner_id?: string | null;
  name: string;
  species_id: string;
  stage: string;
  water: number;
  sun: number;
  fertilizer: number;
  health: number;
  is_dead: boolean;
  species_data?: {
    classification?: string;
    scientific_name?: string;
    [key: string]: any;
  } | null;
}

// ═══════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = "imaginatio_unity_data";
const CURRENT_VERSION = 1;

const DEFAULT_DATA: ImaginatioUnityData = {
  version: CURRENT_VERSION,
  user: { user_id: "", user_name: "" },
  ents: [],
  seeds: [],
};

// ═══════════════════════════════════════════════════════
// PERSISTENCIA
// ═══════════════════════════════════════════════════════

/**
 * Carga el JSON canónico desde localStorage.
 * Aplica migración básica si la versión no existe o es anterior.
 * Retorna la estructura por defecto si no hay datos guardados.
 */
export function loadUnityData(): ImaginatioUnityData {
  if (typeof window === "undefined") return { ...DEFAULT_DATA };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };

    const parsed = JSON.parse(raw);

    // Migración básica: normalizar si falta el campo version
    if (typeof parsed.version !== "number") {
      parsed.version = CURRENT_VERSION;
    }

    // Garantizar que todos los arrays existen (compatibilidad futura)
    return {
      version: parsed.version ?? CURRENT_VERSION,
      user: parsed.user ?? { user_id: "", user_name: "" },
      ents: Array.isArray(parsed.ents) ? parsed.ents : [],
      seeds: Array.isArray(parsed.seeds) ? parsed.seeds : [],
    };
  } catch (e) {
    console.warn("[UnityBridge] Error cargando JSON canónico, usando estructura vacía.", e);
    return { ...DEFAULT_DATA };
  }
}

/**
 * Guarda el JSON canónico en localStorage.
 */
export function saveUnityData(data: ImaginatioUnityData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[UnityBridge] Error guardando JSON canónico.", e);
  }
}

// ═══════════════════════════════════════════════════════
// CAPA DE MAPEO — Store → Canónico
// ═══════════════════════════════════════════════════════

/**
 * Transforma un array de plantas del backend al modelo canónico de UnityEnt[].
 *
 * Reglas:
 *  - NO redefinir estructuras internas del store.
 *  - NO duplicar lógica de salud, decaimiento o evolución.
 *  - SOLO transformar campos al formato requerido.
 */
export function mapStoreToCanonical(plants: BackendPlant[]): UnityEnt[] {
  return plants.map((plant) => ({
    ent_id: plant.id,
    user_id: plant.owner_id ?? userId.value ?? "",
    name: plant.name,
    category: plant.species_data?.classification ?? "unknown",
    model: plant.species_id,
    scientific_name: plant.species_data?.scientific_name ?? "",
    state: plant.is_dead
      ? "dead"
      : plant.health <= 20
        ? "critical"
        : "healthy",
    phase: plant.stage,
  }));
}

/**
 * (Opcional) Reflejo inverso del canónico — solo lectura.
 * No muta ningún signal del store.
 * Retorna los ents del JSON canónico tal cual, sin transformación adicional.
 */
export function mapCanonicalToStore(data: ImaginatioUnityData): UnityEnt[] {
  return data.ents;
}

// ═══════════════════════════════════════════════════════
// SINCRONIZACIÓN
// ═══════════════════════════════════════════════════════

/**
 * Sincroniza el inventario actual de la web con el JSON canónico en localStorage.
 * Llama internamente a mapStoreToCanonical — no muta ningún signal.
 *
 * Estrategia: merge (los ents existentes se reemplazan por ID, se eliminan los
 * que ya no están en el inventario, se añaden los nuevos).
 */
export function syncInventoryToUnityData(plants: BackendPlant[]): void {
  const data = loadUnityData();

  // Actualizar campo user desde el store
  data.user = {
    user_id: userId.value ?? data.user.user_id,
    user_name: username.value || data.user.user_name,
  };

  // Mapear y reemplazar ents (merge por ID)
  const mapped = mapStoreToCanonical(plants);
  const existingIds = new Set(mapped.map((e) => e.ent_id));

  // Conservar seeds (no se tocan en esta sincronización)
  // Reemplazar ents con el estado actualizado del inventario
  data.ents = mapped;

  saveUnityData(data);
}

// ═══════════════════════════════════════════════════════
// CONSTRUCCIÓN DE PAYLOAD PARA UNITY
// ═══════════════════════════════════════════════════════

/**
 * Construye el payload filtrado y listo para ser enviado a Unity.
 *
 * Filtros aplicados:
 *  - state === "healthy"
 *  - phase === "ent"
 */
export function buildUnityPayload(data: ImaginatioUnityData): UnityPayload {
  const validEnts = data.ents.filter(
    (ent) => ent.state === "healthy" && ent.phase === "ent"
  );

  return {
    user_id: data.user.user_id,
    user_name: data.user.user_name,
    ents: validEnts,
  };
}

// ═══════════════════════════════════════════════════════
// CICLO DE VIDA
// ═══════════════════════════════════════════════════════

/**
 * Inicializa el JSON canónico con los datos del usuario tras el login.
 * Llamar una vez al completarse la autenticación.
 */
export function initUnityBridge(): void {
  const data = loadUnityData();

  data.user = {
    user_id: userId.value ?? data.user.user_id,
    user_name: username.value || data.user.user_name,
  };

  saveUnityData(data);
}

// ═══════════════════════════════════════════════════════
// STUBS — Comunicación con Unity (fase futura, NO implementados)
// ═══════════════════════════════════════════════════════

/**
 * STUB — Recepción de datos desde Unity.
 *
 * En la fase de integración real, esta función:
 *  1. Parseará el JSON recibido desde Unity.
 *  2. Validará su forma (new_seeds: string[]).
 *  3. Reflejará seeds recibidas en seeds[] sin duplicados.
 *  4. Asignará user_id automáticamente desde el store.
 *  5. Guardará en localStorage.
 *
 * Las seeds NO se construyen aquí — se delega al sistema existente de seeds.
 *
 * @example (Unity → JS)
 * // Unity llama: gameInstance.SendMessage no aplica en esta dirección.
 * // Unity expone la función global que JS registra:
 * // window.OnUnityResult = onUnityResult;  ← activar en fase siguiente
 */
export function onUnityResult(json: string): void {
  // TODO (fase de integración): parsear json, validar shape { new_seeds: string[] },
  // reflejar seeds recibidas en seeds[] sin duplicados, guardar en localStorage.
  // Las seeds NO se construyen aquí — se delega al sistema existente de seeds.
  console.warn("[UnityBridge] onUnityResult: pendiente de implementación.", json);
}

/*
 * ─────────────────────────────────────────────────────
 * FASE SIGUIENTE — Activar para comunicación real:
 *
 * // JS → Unity (envío):
 * unityInstance.SendMessage(
 *   "GameManager",
 *   "LoadFromJson",
 *   JSON.stringify(buildUnityPayload(loadUnityData()))
 * );
 *
 * // Unity → JS (recepción, exponer función global):
 * window.OnUnityResult = onUnityResult;
 * ─────────────────────────────────────────────────────
 */
