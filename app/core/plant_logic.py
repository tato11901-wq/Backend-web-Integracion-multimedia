from datetime import datetime
from app.models.plant import Plant, PlantStage

# Constantes de mecánicas
MAX_HEALTH = 100.0
DEATH_HOURS_THRESHOLD = 72.0
HEALTH_LOSS_PER_HOUR = 100.0 / 72.0  # ~1.38/h
RESOURCE_LOSS_PER_HOUR = 1.0

# Umbrales para avanzar de fase. Los recursos requeridos se consumirán al evolucionar.
STAGE_THRESHOLDS = {
    PlantStage.SEED: {"water": 50, "sun": 50, "fertilizer": 0, "next": PlantStage.BUSH},
    PlantStage.BUSH: {"water": 100, "sun": 100, "fertilizer": 50, "next": PlantStage.TREE},
    PlantStage.TREE: {"water": 200, "sun": 200, "fertilizer": 100, "next": PlantStage.ENT},
}

def update_plant_state(plant: Plant, current_time: datetime):
    """
    Actualiza el estado pasivo de la planta basado en el tiempo que ha pasado
    desde su última actualización, y verifica si murió por inactividad.
    """
    if plant.is_dead or plant.stage == PlantStage.ENT:
        plant.last_update = current_time
        return

    # 1. Verificar muerte por inactividad (72 horas)
    interaction_diff = current_time - plant.last_interaction
    if interaction_diff.total_seconds() / 3600.0 >= DEATH_HOURS_THRESHOLD:
        plant.is_dead = True
        plant.health = 0.0
        plant.last_update = current_time
        return

    # 2. Pérdida de recursos por el tiempo transcurrido desde el último cálculo
    calc_diff = current_time - plant.last_update
    hours_passed = calc_diff.total_seconds() / 3600.0

    if hours_passed > 0:
        plant.health = max(0.0, plant.health - (HEALTH_LOSS_PER_HOUR * hours_passed))
        plant.water = max(0.0, plant.water - (RESOURCE_LOSS_PER_HOUR * hours_passed))
        plant.sun = max(0.0, plant.sun - (RESOURCE_LOSS_PER_HOUR * hours_passed))

        if plant.health <= 0:
            plant.is_dead = True

    # Se resetea el last_update para el próximo cálculo en el futuro
    plant.last_update = current_time

def apply_water(plant: Plant):
    """Agrega recurso de agua y regenera salud"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    plant.water += 20.0
    _heal_plant(plant, 5.0)

def collect_sun(plant: Plant):
    """Agrega recurso de sol y regenera salud"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    plant.sun += 20.0
    _heal_plant(plant, 5.0)

def apply_pruning(plant: Plant):
    """Añade fertilizante y cura bastante a la planta"""
    if plant.is_dead or plant.stage == PlantStage.ENT: return
    plant.fertilizer += 10.0
    _heal_plant(plant, 20.0)

def _heal_plant(plant: Plant, amount: float):
    plant.health = min(MAX_HEALTH, plant.health + amount)

def check_growth(plant: Plant):
    """
    Verifica si la planta tiene los recursos para avanzar a la siguiente fase
    y la promociona restando los requisitos si es el caso.
    """
    if plant.is_dead or plant.stage == PlantStage.ENT:
        return

    thresholds = STAGE_THRESHOLDS.get(plant.stage)
    if not thresholds:
        return

    req_water = thresholds["water"]
    req_sun = thresholds["sun"]
    req_fert = thresholds["fertilizer"]

    if plant.water >= req_water and plant.sun >= req_sun and plant.fertilizer >= req_fert:
        # Evolucionar a siguiente fase y descontar recursos
        plant.stage = thresholds["next"]
        plant.water -= req_water
        plant.sun -= req_sun
        plant.fertilizer -= req_fert
        # Bonus completo de salud al crecer de fase
        plant.health = MAX_HEALTH
