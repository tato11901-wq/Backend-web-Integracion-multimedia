from typing import Optional, Dict, List
import threading
from models.plant import Plant

class PlantRepository:
    """
    Repositorio en memoria para simular el acceso a base de datos.
    Permite independizar el resto de las capas de cómo y dónde se guardan los datos.
    Indexado por owner_id para velocidad.
    """
    def __init__(self):
        self._storage: Dict[str, Dict[str, Plant]] = {}
        self._lock = threading.Lock()

    def get_by_id(self, owner_id: str, plant_id: str) -> Optional[Plant]:
        with self._lock:
            user_plants = self._storage.get(owner_id, {})
            return user_plants.get(plant_id)

    def get_by_owner_id(self, owner_id: str) -> List[Plant]:
        with self._lock:
            user_plants = self._storage.get(owner_id, {})
            return list(user_plants.values())

    def save(self, plant: Plant) -> Plant:
        with self._lock:
            if plant.owner_id not in self._storage:
                self._storage[plant.owner_id] = {}
            self._storage[plant.owner_id][plant.id] = plant
        return plant

    def delete(self, owner_id: str, plant_id: str) -> bool:
        with self._lock:
            user_plants = self._storage.get(owner_id, {})
            if plant_id in user_plants:
                del user_plants[plant_id]
                return True
            return False

# Instancia global (singleton) para usar en nuestra iteración sin dependencia de inyección compleja
plant_repository = PlantRepository()
