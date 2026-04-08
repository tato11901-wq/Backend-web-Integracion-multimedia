from fastapi import HTTPException
from models.user import User
from repositories.user_repository import user_repository

class UserService:
    @staticmethod
    def login_or_register(username: str) -> User:
        """
        Busca un usuario por username. Si no existe, lo crea.
        Si el usuario no tiene plantas, se le asigna la planta base 'pasto'.
        """
        user = user_repository.get_by_username(username)
        if not user:
            user = User(username=username)
            user_repository.save(user)
        
        # Verificar si el usuario tiene plantas
        from repositories.plant_repository import plant_repository
        user_plants = plant_repository.get_by_owner_id(user.id)
        
        if not user_plants:
            # Importación tardía para evitar circular dependency
            from services.plant_service import PlantService
            PlantService.create_plant(owner_id=user.id, species_id="pasto")
            # Recargar el objeto usuario por si acaso se actualizó el active_plant_id
            user = user_repository.get_by_id(user.id)
            
        return user

    @staticmethod
    def get_user(user_id: str) -> User:
        user = user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def process_minigame(user_id: str, result) -> User:
        user = UserService.get_user(user_id)
        from schemas.user import MinigameType
        import datetime

        now = datetime.datetime.now(datetime.timezone.utc)

        if result.game_type == MinigameType.WATER:
            if user.last_water_minigame and (now - user.last_water_minigame).total_seconds() < 600:
                raise HTTPException(status_code=400, detail="Debes esperar 10 minutos para volver a jugar por agua.")
            
            # Lógica minijuego de agua
            units = 0
            if result.score >= 50: units = 6
            elif result.score > 25: units = 4
            elif result.score == 25: units = 2
            
            user.water_inventory += units
            user.last_water_minigame = now
            
        elif result.game_type == MinigameType.SUN:
            if user.last_sun_minigame and (now - user.last_sun_minigame).total_seconds() < 600:
                raise HTTPException(status_code=400, detail="Debes esperar 10 minutos para volver a atrapar soles.")
            
            # Lógica sol (el cliente envía de 2 a 4 soles recolectados)
            units = min(result.score, 4) # Evitar trampas
            user.sun_inventory += units
            user.last_sun_minigame = now
            
        elif result.game_type == MinigameType.COMPOST:
            if user.last_compost_minigame and (now - user.last_compost_minigame).total_seconds() < 600:
                raise HTTPException(status_code=400, detail="Debes esperar 10 minutos para volver a hacer composta.")
            
            # Lógica composta
            units = min(result.score, 4)
            user.compost_inventory += units
            user.last_compost_minigame = now
            
            # Autoconversión: 4 compostas = 1 abono
            if user.compost_inventory >= 4:
                abonos_nuevos = user.compost_inventory // 4
                user.fertilizer_inventory += abonos_nuevos
                user.compost_inventory = user.compost_inventory % 4

        user_repository.save(user)
        return user

    @staticmethod
    def set_active_plant(user_id: str, plant_id: str) -> User:
        user = UserService.get_user(user_id)
        from repositories.plant_repository import plant_repository
        
        plant = plant_repository.get_by_id(user_id, plant_id)
        if not plant or plant.owner_id != user_id:
            raise HTTPException(status_code=400, detail="Planta no encontrada o no pertenece a este usuario")
            
        user.active_plant_id = plant_id
        user_repository.save(user)
        return user
