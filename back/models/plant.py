from datetime import datetime, timezone
from enum import Enum
import uuid

class PlantStage(str, Enum):
    SEED = "seed"
    SMALL_BUSH = "small_bush"
    LARGE_BUSH = "large_bush"
    ENT = "ent"

class ActionType(str, Enum):
    WATER = "water"
    SUN = "sun"
    PRUNE = "prune"

class Plant:
    """
    Representación interna (Modelo) de la planta.
    En una base de datos real, esto sería un modelo de SQLAlchemy u ORM similar.
    """
    def __init__(self, owner_id: str = None, plant_id: str = None, species_id: str = "aliso"):
        self.id = plant_id or str(uuid.uuid4())
        self.owner_id = owner_id
        self.species_id = species_id
        self.stage = PlantStage.SEED
        self.water = 0.0
        self.sun = 0.0
        self.fertilizer = 0.0
        self.health = 100.0
        now = datetime.now(timezone.utc)
        self.last_update = now
        self.last_interaction = now
        self.is_dead = False

