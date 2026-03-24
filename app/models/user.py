import uuid
from typing import Optional
from datetime import datetime

class User:
    """
    Representación interna (Modelo) de un Usuario.
    """
    def __init__(self, username: str, user_id: str = None):
        self.id = user_id or str(uuid.uuid4())
        self.username = username
        self.water_inventory = 0
        self.sun_inventory = 0
        self.compost_inventory = 0
        self.fertilizer_inventory = 0
        self.active_plant_id: Optional[str] = None
        
        # Cooldowns para minijuegos
        self.last_water_minigame: Optional[datetime] = None
        self.last_sun_minigame: Optional[datetime] = None
        self.last_compost_minigame: Optional[datetime] = None
