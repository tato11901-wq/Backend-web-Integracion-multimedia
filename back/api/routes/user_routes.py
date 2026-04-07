from typing import List
from fastapi import APIRouter, Depends, HTTPException
from core.auth import get_current_user_id
from schemas.user import UserResponse, ActivePlantUpdate
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
    
    plant = plant_repository.get_by_id(user_id, user.active_plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="La planta activa no existe o fue eliminada.")
    return plant

@router.patch("/me/active-plant", response_model=UserResponse)
def set_my_active_plant(update_data: ActivePlantUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Cambia cuál planta es la activa de forma segura.
    """
    user = UserService.set_active_plant(user_id, update_data.plant_id)
    return user
