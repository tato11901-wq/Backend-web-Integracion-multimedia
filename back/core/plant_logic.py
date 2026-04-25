from datetime import datetime
from models.plant import Plant, PlantStage
from core.species_loader import SPECIES_CATALOG

# Constantes de mecánicas
MAX_HEALTH = 100.0
DEATH_HOURS_THRESHOLD = 72.0
HEALTH_LOSS_PER_HOUR = 100.0 / 72.0  # ~1.38/h
RESOURCE_LOSS_PER_HOUR = 1.0 # No se usa directamente, ahora es proporcional

def get_requirements(plant: Plant):
    """Obtiene los requerimientos actuales de la planta según su especie y fase"""
    species_data = SPECIES_CATALOG.get(plant.species_id)
    if not species_data: return 10.0, 10.0, 10.0
    # Las llaves en species.json están en MAYÚSCULAS (SEED, SMALL_BUSH, etc)
    reqs = species_data.get("evolution_requirements", {}).get(plant.stage.value.upper())
    if not reqs: return 10.0, 10.0, 10.0 # Caso Ent o fase final
    return float(reqs.get("water", 1)), float(reqs.get("sun", 1)), float(reqs.get("fertilizer", 1))

def update_plant_state(plant: Plant, current_time: datetime, is_active: bool = True):
    """
    Actualiza el estado pasivo de la planta basado en el tiempo que ha pasado
    desde su última actualización. Si is_active es False, se pausan las mecánicas.
    """
    if plant.is_dead or plant.stage == PlantStage.ENT:
        plant.last_update = current_time
        return

    if not is_active:
        # La planta está inactiva: congelamos su tiempo para que no decaiga ni muera por inactividad
        plant.last_update = current_time
        plant.last_interaction = current_time
        return

    # 1. Verificar muerte por inactividad (72 horas)
    interaction_diff = current_time - plant.last_interaction
    if interaction_diff.total_seconds() / 3600.0 >= DEATH_HOURS_THRESHOLD:
        plant.is_dead = True
        plant.health = 0.0
        plant.last_update = current_time
        return

    # 2. Pérdida de recursos por el tiempo transcurrido
    calc_diff = current_time - plant.last_update
    hours_passed = calc_diff.total_seconds() / 3600.0

    if hours_passed > 0:
        # Decaimiento fijo: 1 unidad cada 10 minutos = 6 unidades por hora
        fixed_loss_per_hour = 6.0
        
        plant.water = max(0.0, plant.water - (fixed_loss_per_hour * hours_passed))
        plant.sun = max(0.0, plant.sun - (fixed_loss_per_hour * hours_passed))

        import math
        # La salud (0-100) se basa en las unidades visibles (redondeadas hacia arriba)
        req_w, req_s, _ = get_requirements(plant)
        display_w = math.ceil(plant.water)
        display_s = math.ceil(plant.sun)
        
        w_pct = (display_w / req_w * 100.0) if req_w > 0 else 100.0
        s_pct = (display_s / req_s * 100.0) if req_s > 0 else 100.0
        plant.health = min(100.0, min(w_pct, s_pct))

        if plant.water <= 0 or plant.sun <= 0:
            plant.is_dead = True
            plant.health = 0.0

    # Se resetea el last_update para el próximo cálculo en el futuro
    plant.last_update = current_time

def apply_water(plant: Plant):
    """Agrega 1 unidad de agua"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    req_w, _, _ = get_requirements(plant)
    plant.water = min(req_w, plant.water + 1.0)
    # Recalcular salud visual
    update_plant_state(plant, datetime.now(plant.last_update.tzinfo))

def collect_sun(plant: Plant):
    """Agrega 1 unidad de sol"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    _, req_s, _ = get_requirements(plant)
    plant.sun = min(req_s, plant.sun + 1.0)
    update_plant_state(plant, datetime.now(plant.last_update.tzinfo))

def apply_pruning(plant: Plant):
    """Añade fertilizante y restaura un poco de ambos recursos vitales"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    plant.fertilizer += 1.0
    req_w, req_s, _ = get_requirements(plant)
    plant.water = min(req_w, plant.water + 1.0)
    plant.sun = min(req_s, plant.sun + 1.0)
    update_plant_state(plant, datetime.now(plant.last_update.tzinfo))

def _heal_plant(plant: Plant, amount: float):
    plant.health = min(MAX_HEALTH, plant.health + amount)

def check_growth(plant: Plant) -> bool:
    """
    Verifica si la planta tiene los recursos para avanzar a la siguiente fase
    y la promociona restando los requisitos si es el caso. Retorna True si evolucionó.
    """
    if plant.is_dead or plant.stage == PlantStage.ENT:
        return False

    species_data = SPECIES_CATALOG.get(plant.species_id)
    if not species_data:
        return False
    
    reqs = species_data.get("evolution_requirements", {}).get(plant.stage.value.upper())
    if not reqs:
        return False

    req_water = reqs.get("water", 0)
    req_sun = reqs.get("sun", 0)
    req_fert = reqs.get("fertilizer", 0)

    if plant.water >= req_water and plant.sun >= req_sun and plant.fertilizer >= req_fert:
        # Definir la progresión explícitamente
        next_stage_map = {
            PlantStage.SEED: PlantStage.SMALL_BUSH,
            PlantStage.SMALL_BUSH: PlantStage.LARGE_BUSH,
            PlantStage.LARGE_BUSH: PlantStage.ENT
        }
        next_stage = next_stage_map.get(plant.stage)
        if next_stage:
            # Evolucionar a siguiente fase
            plant.stage = next_stage
            
            if next_stage == PlantStage.ENT:
                plant.water = 10.0
                plant.sun = 10.0
                plant.fertilizer = 10.0
                plant.health = 100.0
            else:
                # Mantener valores planos (ej: 6 unidades se mantienen aunque el nuevo req sea 10)
                pass
            
            plant.fertilizer = 0.0
            return True
    return False
