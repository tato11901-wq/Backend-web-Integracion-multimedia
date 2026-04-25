from fastapi import APIRouter, Depends
from schemas.plant import PlantResponse, PlantCreateResponse
from pydantic import BaseModel
from models.plant import ActionType
from services.plant_service import PlantService
from core.auth import get_current_user_id
from core.species_loader import SPECIES_CATALOG

router = APIRouter(prefix="/plant", tags=["plants"])

class CreatePlantRequest(BaseModel):
    species_id: str

@router.get("/species")
def get_species():
    """
    Obtiene el catálogo estático de especies estructurado en memoria.
    """
    return SPECIES_CATALOG

@router.post("/", response_model=PlantCreateResponse)
def create_plant(request: CreatePlantRequest, owner_id: str = Depends(get_current_user_id)):
    """
    Crea una nueva planta partiendo de la fase de semilla (seed).
    """
    plant = PlantService.create_plant(owner_id=owner_id, species_id=request.species_id)
    return PlantCreateResponse(id=plant.id, message="Plant created successfully")

@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(plant_id: str, owner_id: str = Depends(get_current_user_id)):
    """
    Obtiene el estado actual de una planta.
    Internamente calcula y descuenta las propiedades según el tiempo inactivo.
    """
    plant = PlantService.get_plant(plant_id, owner_id)
    return plant

@router.post("/{plant_id}/{action}", response_model=PlantResponse)
def apply_action(plant_id: str, action: ActionType, owner_id: str = Depends(get_current_user_id)):
    """
    Aplica una acción a la planta usando recursos del inventario.
    Acciones válidas: water, sun, prune.
    Esto interactúa con la planta, reseteando la cuenta regresiva.
    """
    plant = PlantService.handle_action(plant_id, owner_id, action)
    return plant

@router.post("/{plant_id}/evolve", response_model=PlantResponse)
def evolve_action(plant_id: str, owner_id: str = Depends(get_current_user_id)):
    """
    Intenta evolucionar la planta si se cumplen sus requisitos basados en la especie.
    Resetea los recursos a 0 si es exitosa.
    """
    plant = PlantService.evolve_plant(plant_id, owner_id)
    return plant

class RenamePlantRequest(BaseModel):
    name: str

@router.patch("/{plant_id}/rename", response_model=PlantResponse)
def rename_plant(plant_id: str, body: RenamePlantRequest, owner_id: str = Depends(get_current_user_id)):
    """
    Cambia el nombre de una planta.
    """
    plant = PlantService.rename_plant(plant_id, owner_id, body.name)
    return plant

@router.delete("/{plant_id}")
def delete_plant(plant_id: str, owner_id: str = Depends(get_current_user_id)):
    """
    Elimina permanentemente una planta muerta del inventario.
    """
    PlantService.delete_plant(plant_id, owner_id)
    return {"message": "Planta eliminada exitosamente"}
