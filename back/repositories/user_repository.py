from typing import Optional, Dict
from app.models.user import User

class UserRepository:
    """
    Repositorio en memoria para simular base de datos de usuarios.
    """
    def __init__(self):
        self._storage: Dict[str, User] = {}

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self._storage.get(user_id)

    def get_by_username(self, username: str) -> Optional[User]:
        for user in self._storage.values():
            if user.username == username:
                return user
        return None

    def save(self, user: User) -> User:
        self._storage[user.id] = user
        return user

    def delete(self, user_id: str) -> bool:
        if user_id in self._storage:
            del self._storage[user_id]
            return True
        return False

user_repository = UserRepository()
