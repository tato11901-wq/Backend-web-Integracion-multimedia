from pydantic import BaseModel
from typing import Optional
from enum import Enum

class MinigameType(str, Enum):
    WATER = "water"
    SUN = "sun"
    COMPOST = "compost"

class MinigameResult(BaseModel):
    game_type: MinigameType
    score: int  # Clicks, soles recogidos o compostas recogidas

class DebugTimeRequest(BaseModel):
    hours: float

class UserLogin(BaseModel):
    username: str

class ActivePlantUpdate(BaseModel):
    plant_id: str

class UserResponse(BaseModel):
    id: str
    username: str
    water_inventory: int
    sun_inventory: int
    compost_inventory: int
    fertilizer_inventory: int
    active_plant_id: Optional[str] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    user: UserResponse
    token: str          # JWT para autenticación
    message: str
