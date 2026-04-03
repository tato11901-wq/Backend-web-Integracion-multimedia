from fastapi import APIRouter, Depends
from core.auth import get_current_user_id
from services.minigame_service import MinigameService, MINIGAME_CONFIG
from schemas.minigame import (
    MinigameStartRequest, 
    MinigameStartResponse, 
    MinigameEndRequest, 
    MinigameResponse
)

router = APIRouter(prefix="/minigame", tags=["minigames"])

@router.post("/start", response_model=MinigameStartResponse)
def start_minigame(
    body: MinigameStartRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Inicia una sesión de minijuego. 
    Verifica cooldown y devuelve un session_token.
    Para compost, devuelve también el layout de items generado por el servidor.
    """
    session = MinigameService.start_game(user_id, body.game_type)
    
    config = MINIGAME_CONFIG[session.game_type]
    
    response = {
        "session_token": session.token,
        "game_type": session.game_type,
        "duration_seconds": config["game_duration_seconds"],
    }
    
    # Para compost: enviar layout generado por el backend
    if session.generated_layout:
        # NO envía cuáles son orgánicos — solo id, name, emoji para renderizado
        response["items"] = [
            {"id": item["id"], "name": item["name"], "emoji": item["emoji"]}
            for item in session.generated_layout
        ]
        
    return response

@router.post("/end", response_model=MinigameResponse)
def end_minigame(
    body: MinigameEndRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Finaliza un minijuego y procesa la recompensa.
    El backend calcula la duración real desde que se inició (/start).
    """
    result = MinigameService.end_game(user_id, body.session_token, body)
    
    return MinigameResponse(
        reward=result["reward"],
        game_type=result["game_type"],
        cooldown_ends_at=result["cooldown_ends_at"].isoformat(),
        user=result["user"],
        message=f"¡Obtuviste {result['reward']} unidades!"
    )
