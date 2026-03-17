from pydantic import BaseModel
from datetime import datetime
from app.models.plant import PlantStage

class PlantResponse(BaseModel):
    """
    Schema para devolver la información de una planta a Unity/Frontend de forma limpia y tipada.
    """
    id: str
    stage: PlantStage
    water: float
    sun: float
    fertilizer: float
    health: float
    last_update: datetime
    last_interaction: datetime
    is_dead: bool

    class Config:
        from_attributes = True

class PlantCreateResponse(BaseModel):
    id: str
    message: str
