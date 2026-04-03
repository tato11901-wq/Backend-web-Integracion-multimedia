"""
Schemas para los endpoints de minijuegos.
Definen el contrato de datos entre cliente y backend.

Principio: el cliente envía datos crudos verificables,
el backend calcula todo lo demás.
"""

from pydantic import BaseModel
from typing import Optional, List
from schemas.user import UserResponse


class MinigameStartRequest(BaseModel):
    """Solicitud para iniciar un minijuego."""
    game_type: str  # "water" | "compost"


class MinigameStartResponse(BaseModel):
    """Respuesta al iniciar un minijuego."""
    session_token: str
    game_type: str
    duration_seconds: int
    # Solo para compost: items generados por el backend (SIN campo organic)
    items: Optional[List[dict]] = None


class MinigameEndRequest(BaseModel):
    """
    Datos que el cliente envía al terminar un minijuego.
    NOTA: NO incluye duración — el backend la calcula.
    """
    session_token: str
    clicks: Optional[int] = None              # Solo para agua
    selected_items: Optional[List[int]] = None  # Solo para compost (IDs)


class MinigameResponse(BaseModel):
    """Respuesta final con recompensa y estado actualizado del usuario."""
    reward: int
    game_type: str
    cooldown_ends_at: str
    user: UserResponse
    message: str
