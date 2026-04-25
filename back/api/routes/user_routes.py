from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.auth import get_current_user_id
from schemas.user import UserResponse, ActivePlantUpdate, DebugTimeRequest
from schemas.plant import PlantResponse
from repositories.plant_repository import plant_repository
from services.user_service import UserService
from services.plant_service import PlantService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Obtiene toda la información (inventario, sesión) de tu propio usuario 
    extraído de forma segura del JWT.
    """
    user = UserService.get_user(user_id)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: str):
    """
    DEPRECADO: Obtener usuario por ID (uso interno o diagnóstico).
    """
    user = UserService.get_user(user_id)
    return user

# El endpoint /{user_id}/minigame ha sido movido y refactorizado a /minigame/start y /minigame/end
# para mayor seguridad con manejo por sesiones y tokens únicos.

@router.get("/me/inventory", response_model=List[PlantResponse])
def get_my_inventory(user_id: str = Depends(get_current_user_id)):
    """
    Obtiene todas las plantas que pertenecen al usuario autenticado.
    """
    plants = PlantService.get_user_inventory(user_id)
    return plants

@router.get("/me/active-plant", response_model=PlantResponse)
def get_my_active_plant(user_id: str = Depends(get_current_user_id)):
    """
    Obtiene toda la información (fase, barra de recursos, etc) de tu planta actualmente activa.
    """
    user = UserService.get_user(user_id)
    if not user.active_plant_id:
        raise HTTPException(status_code=404, detail="El usuario no tiene ninguna planta activa.")
    
    plant = PlantService.get_plant(user.active_plant_id, user_id)
    return plant

@router.patch("/me/active-plant", response_model=UserResponse)
def set_my_active_plant(update_data: ActivePlantUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Cambia cuál planta es la activa de forma segura.
    """
    user = UserService.set_active_plant(user_id, update_data.plant_id)
    return user

@router.post("/me/debug/fast-forward", response_model=UserResponse)
def fast_forward_time(req: DebugTimeRequest, user_id: str = Depends(get_current_user_id)):
    """
    DEBUG: Adelanta el tiempo de los cooldowns de los minijuegos.
    """
    from datetime import timedelta
    from repositories.user_repository import user_repository
    
    user = user_repository.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    delta = timedelta(hours=req.hours)
    
    if user.last_water_minigame:
        user.last_water_minigame -= delta
    if user.last_compost_minigame:
        user.last_compost_minigame -= delta
    if user.last_sun_minigame:
        user.last_sun_minigame -= delta
        
    user_repository.save(user)
    return user

class DebugResourcesRequest(BaseModel):
    water: int = 0
    sun: int = 0
    fertilizer: int = 0

@router.post("/me/debug/add-resources", response_model=UserResponse)
def add_debug_resources(req: DebugResourcesRequest, user_id: str = Depends(get_current_user_id)):
    """
    DEBUG: Añade recursos directamente al inventario.
    """
    from repositories.user_repository import user_repository
    user = user_repository.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.water_inventory += req.water
    user.sun_inventory += req.sun
    user.fertilizer_inventory += req.fertilizer
    
    return user_repository.save(user)
