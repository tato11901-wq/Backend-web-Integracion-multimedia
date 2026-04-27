import speciesDataRaw from "../config/species.json";

// Type assertion because we know the structure of species.json
export const SPECIES_CATALOG = speciesDataRaw as Record<string, any>;

// ── Tipos ──
export interface LocalUser {
  id: string;
  username: string;
  water_inventory: number;
  sun_inventory: number;
  fertilizer_inventory: number;
  compost_inventory: number;
  active_plant_id: string | null;
  cooldowns: {
    water: number; // timestamp in ms when available again
    sun: number;
    compost: number;
  };
}

export interface LocalPlant {
  id: string;
  owner_id: string;
  name: string;
  species_id: string;
  stage: "seed" | "small_bush" | "large_bush" | "ent";
  water: number;
  sun: number;
  fertilizer: number;
  health: number;
  is_dead: boolean;
  last_update: number; // timestamp in ms
  last_interaction: number; // timestamp in ms
}

export interface LocalDbState {
  users: Record<string, LocalUser>; // key: username
  plants: Record<string, LocalPlant>; // key: plant_id
}

const STORAGE_KEY = "imaginatio_save";

// ── Core DB Logic ──

export function loadDb(): LocalDbState {
  if (typeof window === "undefined") {
    return { users: {}, plants: {} };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error parsing local DB", e);
    }
  }
  return { users: {}, plants: {} };
}

export function saveDb(state: LocalDbState) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// ── Plant Logic (Replicada del Backend) ──

const DEATH_HOURS_THRESHOLD = 72.0;
const FIXED_LOSS_PER_HOUR = 6.0;

function getRequirements(speciesId: string, stage: string) {
  const species = SPECIES_CATALOG[speciesId];
  if (!species) return { water: 10, sun: 10, fertilizer: 10 };
  const reqs = species.evolution_requirements?.[stage.toUpperCase()];
  if (!reqs) return { water: 10, sun: 10, fertilizer: 10 };
  return {
    water: Number(reqs.water || 1),
    sun: Number(reqs.sun || 1),
    fertilizer: Number(reqs.fertilizer || 1),
  };
}

/**
 * Actualiza el estado de la planta basado en el tiempo transcurrido.
 * Muta el objeto plant.
 */
function updatePlantState(plant: LocalPlant, isActive: boolean) {
  if (plant.is_dead || plant.stage === "ent") {
    plant.last_update = Date.now();
    return;
  }

  const now = Date.now();

  if (!isActive) {
    // Planta inactiva se "congela" en el tiempo
    plant.last_update = now;
    plant.last_interaction = now;
    return;
  }

  // 1. Muerte por inactividad
  const hoursSinceInteraction = (now - plant.last_interaction) / (1000 * 60 * 60);
  if (hoursSinceInteraction >= DEATH_HOURS_THRESHOLD) {
    plant.is_dead = true;
    plant.health = 0;
    plant.last_update = now;
    return;
  }

  // 2. Pérdida pasiva de recursos
  const hoursPassed = (now - plant.last_update) / (1000 * 60 * 60);
  if (hoursPassed > 0) {
    plant.water = Math.max(0, plant.water - FIXED_LOSS_PER_HOUR * hoursPassed);
    plant.sun = Math.max(0, plant.sun - FIXED_LOSS_PER_HOUR * hoursPassed);

    const reqs = getRequirements(plant.species_id, plant.stage);
    const displayW = Math.ceil(plant.water);
    const displayS = Math.ceil(plant.sun);

    const wPct = reqs.water > 0 ? (displayW / reqs.water) * 100 : 100;
    const sPct = reqs.sun > 0 ? (displayS / reqs.sun) * 100 : 100;

    plant.health = Math.min(100, Math.min(wPct, sPct));

    if (plant.water <= 0 || plant.sun <= 0) {
      plant.is_dead = true;
      plant.health = 0;
    }
  }

  plant.last_update = now;
}

export function checkGrowth(plant: LocalPlant): boolean {
  if (plant.is_dead || plant.stage === "ent") return false;

  const reqs = getRequirements(plant.species_id, plant.stage);
  
  if (
    Math.ceil(plant.water) >= reqs.water &&
    Math.ceil(plant.sun) >= reqs.sun &&
    Math.ceil(plant.fertilizer) >= reqs.fertilizer
  ) {
    const stageMap: Record<string, LocalPlant["stage"]> = {
      "seed": "small_bush",
      "small_bush": "large_bush",
      "large_bush": "ent"
    };

    const nextStage = stageMap[plant.stage];
    if (nextStage) {
      plant.stage = nextStage;
      if (nextStage === "ent") {
        plant.water = 10;
        plant.sun = 10;
        plant.fertilizer = 10;
        plant.health = 100;
      } else {
        // Maxear agua y sol a los nuevos requisitos de la fase superior
        const nextReqs = getRequirements(plant.species_id, nextStage);
        plant.water = nextReqs.water;
        plant.sun = nextReqs.sun;
        plant.health = 100;
      }
      plant.fertilizer = 0;
      return true;
    }
  }
  return false;
}

// ── API Functions ──

export function getOrCreateUser(username: string): LocalUser {
  const db = loadDb();
  if (db.users[username]) {
    return db.users[username];
  }
  
  const newUser: LocalUser = {
    id: username, // Usamos el username como ID para simplificar
    username,
    water_inventory: 0,
    sun_inventory: 0,
    fertilizer_inventory: 0,
    compost_inventory: 0,
    active_plant_id: null,
    cooldowns: { water: 0, sun: 0, compost: 0 }
  };
  
  db.users[username] = newUser;
  saveDb(db);
  
  // Crear una planta inicial para el nuevo usuario
  createPlantForUser(username, "pasto");
  
  // Recargar el usuario actualizado con su active_plant_id
  return loadDb().users[username];
}

export function getUser(username: string): LocalUser | null {
  return loadDb().users[username] || null;
}

export function saveUser(user: LocalUser) {
  const db = loadDb();
  db.users[user.username] = user;
  saveDb(db);
}

export function createPlantForUser(username: string, speciesId: string): LocalPlant {
  const db = loadDb();
  const user = db.users[username];
  if (!user) throw new Error("User not found");

  const reqs = getRequirements(speciesId, "seed");
  const plant: LocalPlant = {
    id: generateId(),
    owner_id: username,
    name: "Nueva Planta",
    species_id: speciesId,
    stage: "seed",
    water: reqs.water,
    sun: reqs.sun,
    fertilizer: 0,
    health: 100,
    is_dead: false,
    last_update: Date.now(),
    last_interaction: Date.now(),
  };

  db.plants[plant.id] = plant;
  
  if (!user.active_plant_id) {
    user.active_plant_id = plant.id;
  }
  
  saveDb(db);
  return plant;
}

export function getPlant(plantId: string, isActive: boolean = false): any {
  const db = loadDb();
  const plant = db.plants[plantId];
  if (plant) {
    updatePlantState(plant, isActive);
    saveDb(db); // Guardar estado actualizado
    return {
      ...plant,
      species_data: SPECIES_CATALOG[plant.species_id]
    };
  }
  return null;
}

export function getUserPlants(username: string): any[] {
  const db = loadDb();
  const user = db.users[username];
  if (!user) return [];
  
  const userPlants = Object.values(db.plants).filter(p => p.owner_id === username);
  userPlants.forEach(p => {
    updatePlantState(p, p.id === user.active_plant_id);
  });
  
  saveDb(db);
  return userPlants.map(p => ({
    ...p,
    species_data: SPECIES_CATALOG[p.species_id]
  }));
}

export function applyAction(plantId: string, username: string, action: "water" | "sun" | "prune") {
  const db = loadDb();
  const user = db.users[username];
  const plant = db.plants[plantId];
  
  if (!user || !plant) throw new Error("User or Plant not found");
  if (plant.is_dead) throw new Error("Plant is dead");

  updatePlantState(plant, plant.id === user.active_plant_id);

  if (action === "water") {
    if (user.water_inventory < 1) throw new Error("Not enough water");
    user.water_inventory--;
    const reqs = getRequirements(plant.species_id, plant.stage);
    plant.water = Math.min(reqs.water, plant.water + 1);
  } else if (action === "sun") {
    if (user.sun_inventory < 1) throw new Error("Not enough sun");
    user.sun_inventory--;
    const reqs = getRequirements(plant.species_id, plant.stage);
    plant.sun = Math.min(reqs.sun, plant.sun + 1);
  } else if (action === "prune") {
    if (user.fertilizer_inventory < 1) throw new Error("Not enough fertilizer");
    user.fertilizer_inventory--;
    plant.fertilizer += 1;
  }

  plant.last_interaction = Date.now();
  updatePlantState(plant, plant.id === user.active_plant_id); // Recalculate health
  
  saveDb(db);
  return { 
    user, 
    plant: {
      ...plant,
      species_data: SPECIES_CATALOG[plant.species_id]
    } 
  };
}

export function evolvePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  const user = db.users[username];
  
  if (!plant || !user) throw new Error("Not found");
  
  updatePlantState(plant, plant.id === user.active_plant_id);
  
  if (checkGrowth(plant)) {
    plant.last_interaction = Date.now();
    saveDb(db);
    return plant;
  }
  
  throw new Error("Requirements not met");
}

export function deletePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  const user = db.users[username];
  
  if (plant && plant.owner_id === username && plant.is_dead) {
    if (user && user.active_plant_id === plantId) {
      user.active_plant_id = null;
    }
    delete db.plants[plantId];
    saveDb(db);
  } else {
    throw new Error("Plant is not dead or not found");
  }
}

export function setActivePlantLocal(plantId: string, username: string) {
  const db = loadDb();
  const user = db.users[username];
  if (user && db.plants[plantId] && db.plants[plantId].owner_id === username) {
    user.active_plant_id = plantId;
    saveDb(db);
    return user;
  }
  throw new Error("Invalid plant or user");
}

export function renamePlantLocal(plantId: string, username: string, name: string) {
  const db = loadDb();
  const plant = db.plants[plantId];
  if (plant && plant.owner_id === username) {
    plant.name = name.slice(0, 12);
    saveDb(db);
    return plant;
  }
  throw new Error("Plant not found");
}

export function addDebugResources(username: string, w: number, s: number, f: number) {
  const db = loadDb();
  const user = db.users[username];
  if (user) {
    user.water_inventory += w;
    user.sun_inventory += s;
    user.fertilizer_inventory += f;
    saveDb(db);
    return user;
  }
  throw new Error("User not found");
}

export function fastForwardTimeLocal(username: string, hours: number) {
  const db = loadDb();
  const user = db.users[username];
  if (!user) return;

  const msToAdvance = hours * 60 * 60 * 1000;
  
  // Acelerar cooldowns
  if (user.cooldowns.water > Date.now()) user.cooldowns.water -= msToAdvance;
  if (user.cooldowns.sun > Date.now()) user.cooldowns.sun -= msToAdvance;
  if (user.cooldowns.compost > Date.now()) user.cooldowns.compost -= msToAdvance;

  // Envejecer plantas en el pasado para que updatePlantState las desgaste más
  Object.values(db.plants).filter(p => p.owner_id === username).forEach(p => {
    p.last_update -= msToAdvance;
    p.last_interaction -= msToAdvance;
    updatePlantState(p, p.id === user.active_plant_id);
  });

  saveDb(db);
  return user;
}
