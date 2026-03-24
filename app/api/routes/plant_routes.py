from fastapi import APIRouter
from app.schemas.plant import PlantResponse, PlantCreateResponse
from app.models.plant import ActionType
from app.services.plant_service import PlantService

router = APIRouter(prefix="/plant", tags=["plants"])

@router.post("/", response_model=PlantCreateResponse)
def create_plant(owner_id: str):
    """
    Crea una nueva planta partiendo de la fase de semilla (seed).
    """
    plant = PlantService.create_plant(owner_id=owner_id)
    return PlantCreateResponse(id=plant.id, message="Plant created successfully")

@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(plant_id: str):
    """
    Obtiene el estado actual de una planta.
    Internamente calcula y descuenta las propiedades según el tiempo inactivo.
    """
    plant = PlantService.get_plant(plant_id)
    return plant

@router.post("/{plant_id}/{action}", response_model=PlantResponse)
def apply_action(plant_id: str, action: ActionType):
    """
    Aplica una acción a la planta.
    Acciones válidas: water, sun, prune.
    Esto interactúa con la planta, reseteando la cuenta regresiva de 72 horas para morir.
    """
    plant = PlantService.handle_action(plant_id, action)
    return plant
