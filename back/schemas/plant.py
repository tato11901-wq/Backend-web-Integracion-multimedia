from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from models.plant import PlantStage

class PlantResponse(BaseModel):
    """
    Schema para devolver la información de una planta al Frontend.
    Incluye species_id y species_data para que el frontend cargue los assets y
    requerimientos dinámicamente sin necesitar un segundo request.
    """
    id: str
    owner_id: Optional[str] = None
    name: str = "Mi Planta"
    species_id: str = "pasto"
    stage: PlantStage
    water: float
    sun: float
    fertilizer: float
    health: float
    last_update: datetime
    last_interaction: datetime
    is_dead: bool
    species_data: Optional[Dict[str, Any]] = None  # Datos completos de la especie

    class Config:
        from_attributes = True

class PlantCreateResponse(BaseModel):
    id: str
    message: str
