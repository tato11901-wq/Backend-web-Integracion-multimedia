from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import UserResponse, MinigameResult, ActivePlantUpdate
from app.schemas.plant import PlantResponse
from app.repositories.plant_repository import plant_repository
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    """
    Obtiene toda la información de un usuario, incluyendo su inventario
    y el ID de su planta activa.
    """
    user = UserService.get_user(user_id)
    return user

@router.post("/{user_id}/minigame", response_model=UserResponse)
def play_minigame(user_id: str, result: MinigameResult):
    """
    Procesa el resultado de un minijuego (water, sun, compost)
    y otorga recursos directamente al inventario del usuario.
    Si se recolecta suficiente composta, se convierte en abono (fertilizer).
    """
    user = UserService.process_minigame(user_id, result)
    return user

@router.get("/{user_id}/inventory", response_model=List[PlantResponse])
def get_user_inventory(user_id: str):
    """
    Obtiene todas las plantas que pertenecen a un usuario.
    """
    user = UserService.get_user(user_id)  # Valida que exista
    plants = plant_repository.get_by_owner_id(user_id)
    return plants

@router.get("/{user_id}/active-plant", response_model=PlantResponse)
def get_active_plant(user_id: str):
    """
    Obtiene toda la información (fase, barra de recursos, etc) de tu planta actualmente activa.
    """
    user = UserService.get_user(user_id)
    if not user.active_plant_id:
        raise HTTPException(status_code=404, detail="El usuario no tiene ninguna planta activa.")
    
    plant = plant_repository.get_by_id(user.active_plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="La planta activa no existe o fue eliminada.")
    return plant

@router.patch("/{user_id}/active-plant", response_model=UserResponse)
def set_active_plant(user_id: str, update_data: ActivePlantUpdate):
    """
    Cambia cuál planta de tu inventario es la que estás cuidando actualmente.
    """
    user = UserService.set_active_plant(user_id, update_data.plant_id)
    return user
