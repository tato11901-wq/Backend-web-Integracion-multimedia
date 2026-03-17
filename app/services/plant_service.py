from datetime import datetime, timezone
from fastapi import HTTPException
from app.models.plant import Plant, ActionType
from app.core import plant_logic
from app.repositories.plant_repository import plant_repository

class PlantService:
    @staticmethod
    def get_plant(plant_id: str) -> Plant:
        """
        Obtiene una planta y actualiza sus variables por el paso del tiempo
        (sin reiniciar el contador de inactividad de interacción).
        """
        plant = plant_repository.get_by_id(plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        
        # Calcular el tiempo transcurrido pasivamente
        current_time = datetime.now(timezone.utc)
        plant_logic.update_plant_state(plant, current_time)
        
        # Guardamos la planta para reflejar el decaimiento en memoria
        plant_repository.save(plant)
        return plant
    
    @staticmethod
    def create_plant() -> Plant:
        """Crea una nueva planta inicialmente"""
        plant = Plant()
        return plant_repository.save(plant)

    @staticmethod
    def handle_action(plant_id: str, action: ActionType) -> Plant:
        """
        Calcula el paso del tiempo, aplica una acción y verifica evoluciones.
        """
        plant = plant_repository.get_by_id(plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        current_time = datetime.now(timezone.utc)
        
        # 1. Actualizar estado por tiempo para aplicar el debuff acumulado antes de la nueva acción
        plant_logic.update_plant_state(plant, current_time)
        
        # 2. Si murió durante este lapso, no permitimos acciones
        if plant.is_dead:
            plant_repository.save(plant)
            raise HTTPException(status_code=400, detail="Plant is dead and cannot be interacted with.")

        # 3. Aplicar acción específica
        if action == ActionType.WATER:
            plant_logic.apply_water(plant)
        elif action == ActionType.SUN:
            plant_logic.collect_sun(plant)
        elif action == ActionType.PRUNE:
            plant_logic.apply_pruning(plant)

        # 4. Verificar si procede un cambio de fase
        plant_logic.check_growth(plant)

        # 5. La interacción renueva el contador de inactividad de las mecánicas
        plant.last_interaction = current_time
        
        # 6. Persistir cambios
        return plant_repository.save(plant)
