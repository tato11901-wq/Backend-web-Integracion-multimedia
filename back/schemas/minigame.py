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
    game_type: str  # "water" | "compost" | "sun"


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


# ─────────── Schemas exclusivos del minijuego de soles (caja) ───────────

class SunClickRequest(BaseModel):
    """Click individual en la caja de soles."""
    session_token: str


class SunClickResponse(BaseModel):
    """
    Estado devuelto tras cada click en la caja.
    Si finished=True, incluye reward, cooldown_ends_at y user.
    """
    click_number: int           # Número de click (1–4)
    tier_before: int            # Tier antes del click
    tier_after: int             # Tier después del click
    tier_up: bool               # Si subió de tier en este click
    clicks_remaining: int       # Clicks que quedan
    finished: bool              # True si es el último click
    reward: Optional[int] = None                    # Solo si finished=True
    cooldown_ends_at: Optional[str] = None          # Solo si finished=True
    user: Optional[UserResponse] = None             # Solo si finished=True
