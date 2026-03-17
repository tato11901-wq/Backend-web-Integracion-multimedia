from typing import Optional, Dict
from app.models.plant import Plant

class PlantRepository:
    """
    Repositorio en memoria para simular el acceso a base de datos.
    Permite independizar el resto de las capas de cómo y dónde se guardan los datos.
    """
    def __init__(self):
        self._storage: Dict[str, Plant] = {}

    def get_by_id(self, plant_id: str) -> Optional[Plant]:
        return self._storage.get(plant_id)

    def save(self, plant: Plant) -> Plant:
        self._storage[plant.id] = plant
        return plant

    def delete(self, plant_id: str) -> bool:
        if plant_id in self._storage:
            del self._storage[plant_id]
            return True
        return False

# Instancia global (singleton) para usar en nuestra iteración sin dependencia de inyección compleja
plant_repository = PlantRepository()
