from datetime import datetime, timezone
from fastapi import HTTPException
from models.plant import Plant, ActionType
from core import plant_logic
from core.species_loader import SPECIES_CATALOG
from repositories.plant_repository import plant_repository
from repositories.user_repository import user_repository

class PlantService:
    @staticmethod
    def get_plant(plant_id: str, owner_id: str) -> Plant:
        """
        Obtiene una planta y actualiza sus variables por el paso del tiempo
        (sin reiniciar el contador de inactividad de interacción).
        """
        plant = plant_repository.get_by_id(owner_id, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        
        # Calcular el tiempo transcurrido pasivamente
        user = user_repository.get_by_id(owner_id)
        is_active = (user and user.active_plant_id == plant_id)
        current_time = datetime.now(timezone.utc)
        plant_logic.update_plant_state(plant, current_time, is_active)
        
        # Guardamos la planta para reflejar el decaimiento en memoria
        plant_repository.save(plant)
        
        # Adjuntar datos de especie para que el frontend los use directamente
        plant.species_data = SPECIES_CATALOG.get(plant.species_id)
        return plant
    
    @staticmethod
    def get_user_inventory(user_id: str) -> list[Plant]:
        """
        Obtiene el inventario de plantas de un usuario,
        actualizando el estado de cada una antes de devolverlas.
        """
        plants = plant_repository.get_by_owner_id(user_id)
        user = user_repository.get_by_id(user_id)
        active_plant_id = user.active_plant_id if user else None
        current_time = datetime.now(timezone.utc)
        for plant in plants:
            is_active = (plant.id == active_plant_id)
            plant_logic.update_plant_state(plant, current_time, is_active)
            plant_repository.save(plant)
            plant.species_data = SPECIES_CATALOG.get(plant.species_id)
        return plants
    
    @staticmethod
    def create_plant(owner_id: str, species_id: str) -> Plant:
        """Crea una nueva planta asignada a un usuario y la activa si no tiene una"""
        if species_id not in SPECIES_CATALOG:
            raise HTTPException(status_code=404, detail="Especie no existe en el catálogo")

        user = user_repository.get_by_id(owner_id)
        if not user:
            raise HTTPException(status_code=404, detail="Owner user not found")

        plant = Plant(owner_id=owner_id, species_id=species_id)
        
        # Inicializar al máximo según requerimientos de semilla
        species_data = SPECIES_CATALOG.get(species_id)
        if species_data:
            reqs = species_data.get("evolution_requirements", {}).get("SEED", {})
            plant.water = float(reqs.get("water", 3.0))
            plant.sun = float(reqs.get("sun", 3.0))
            plant.health = 100.0

        plant_repository.save(plant)
        
        # Asignar como activa si no tiene ninguna
        if not user.active_plant_id:
            user.active_plant_id = plant.id
            user_repository.save(user)
            
        return plant

    @staticmethod
    def handle_action(plant_id: str, owner_id: str, action: ActionType) -> Plant:
        """
        Calcula el paso del tiempo, y aplica una acción utilizando recursos del inventario del usuario.
        """
        plant = plant_repository.get_by_id(owner_id, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        current_time = datetime.now(timezone.utc)
        user = user_repository.get_by_id(owner_id)
        is_active = (user and user.active_plant_id == plant_id)
        
        # 1. Actualizar estado por tiempo para aplicar el debuff acumulado antes de la nueva acción
        plant_logic.update_plant_state(plant, current_time, is_active)
        
        # 2. Si murió durante este lapso, no permitimos acciones
        if plant.is_dead:
            plant_repository.save(plant)
            raise HTTPException(status_code=400, detail="Plant is dead and cannot be interacted with.")

        # Obtener el dueño para descontar de su inventario
        user = user_repository.get_by_id(plant.owner_id)
        if not user:
            raise HTTPException(status_code=400, detail="Plant has no valid owner.")

        # 3. Validar inventario y aplicar acción específica
        if action == ActionType.WATER:
            if user.water_inventory < 1:
                raise HTTPException(status_code=400, detail="Not enough water in inventory.")
            user.water_inventory -= 1
            plant_logic.apply_water(plant)
            
        elif action == ActionType.SUN:
            if user.sun_inventory < 1:
                raise HTTPException(status_code=400, detail="Not enough sun in inventory.")
            user.sun_inventory -= 1
            plant_logic.collect_sun(plant)
            
        elif action == ActionType.PRUNE:
            if user.fertilizer_inventory < 1:
                raise HTTPException(status_code=400, detail="Not enough fertilizer (abono) in inventory.")
            user.fertilizer_inventory -= 1
            plant_logic.apply_pruning(plant)

        user_repository.save(user)

        # 4. La interacción renueva el contador de inactividad de las mecánicas
        plant.last_interaction = current_time
        
        # 5. Persistir cambios
        return plant_repository.save(plant)

    @staticmethod
    def evolve_plant(plant_id: str, owner_id: str) -> Plant:
        """
        Intenta evolucionar a la planta.
        """
        plant = plant_repository.get_by_id(owner_id, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        if plant.is_dead:
            raise HTTPException(status_code=400, detail="Plant is dead and cannot evolve.")

        if plant.is_dead:
            raise HTTPException(status_code=400, detail="Plant is dead and cannot evolve.")

        current_time = datetime.now(timezone.utc)
        user = user_repository.get_by_id(owner_id)
        is_active = (user and user.active_plant_id == plant_id)
        plant_logic.update_plant_state(plant, current_time, is_active)

        if plant.is_dead:
            plant_repository.save(plant)
            raise HTTPException(status_code=400, detail="Plant is dead and cannot evolve.")

        success = plant_logic.check_growth(plant)
        if not success:
            raise HTTPException(status_code=400, detail="No cumple los requisitos para evolucionar")

        plant.last_interaction = current_time
        return plant_repository.save(plant)

    @staticmethod
    def rename_plant(plant_id: str, owner_id: str, new_name: str) -> Plant:
        """
        Cambia el nombre de una planta.
        """
        plant = plant_repository.get_by_id(owner_id, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        plant.name = new_name.strip()[:12]  # Limitar a 12 caracteres
        return plant_repository.save(plant)

    @staticmethod
    def delete_plant(plant_id: str, owner_id: str) -> bool:
        """
        Elimina una planta del inventario del usuario. La planta debe estar muerta.
        Si la planta eliminada era la planta activa, la desvincula del usuario.
        """
        plant = plant_repository.get_by_id(owner_id, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        if not plant.is_dead:
            raise HTTPException(status_code=400, detail="Solo se pueden eliminar plantas muertas.")

        # Obtener el usuario para verificar si esta era su planta activa
        user = user_repository.get_by_id(owner_id)
        if user and user.active_plant_id == plant_id:
            user.active_plant_id = None
            user_repository.save(user)

        return plant_repository.delete(owner_id, plant_id)
