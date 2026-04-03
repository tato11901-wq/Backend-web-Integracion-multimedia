"""
Repositorio en memoria para sesiones de minijuegos.

Sigue el mismo patrón de repositorio que PlantRepository y UserRepository,
lo que permite reemplazar el storage en memoria por una base de datos real
(Redis, SQL con TTL, etc.) sin modificar la capa de servicios.

Incluye auto-limpieza de sesiones abandonadas (> 5 minutos).
"""

from datetime import datetime, timezone
from typing import Optional, Dict
from models.minigame_session import MinigameSession


class SessionRepository:
    """
    Almacenamiento temporal de sesiones activas de minijuegos.
    Las sesiones tienen un TTL implícito de 5 minutos.
    """

    SESSION_TTL_SECONDS = 300  # 5 minutos

    def __init__(self):
        self._storage: Dict[str, MinigameSession] = {}

    def save(self, session: MinigameSession) -> MinigameSession:
        self._cleanup()
        self._storage[session.token] = session
        return session

    def get_by_token(self, token: str) -> Optional[MinigameSession]:
        session = self._storage.get(token)
        if session and self._is_expired(session):
            del self._storage[token]
            return None
        return session

    def get_active_by_user(self, user_id: str) -> Optional[MinigameSession]:
        """Busca si el usuario tiene una sesión activa (no terminada)."""
        for session in self._storage.values():
            if (
                session.user_id == user_id
                and not session.ended
                and not self._is_expired(session)
            ):
                return session
        return None

    def delete(self, token: str) -> bool:
        if token in self._storage:
            del self._storage[token]
            return True
        return False

    def _is_expired(self, session: MinigameSession) -> bool:
        elapsed = (datetime.now(timezone.utc) - session.started_at).total_seconds()
        return elapsed > self.SESSION_TTL_SECONDS

    def _cleanup(self):
        """Elimina sesiones expiradas para evitar memory leaks."""
        now = datetime.now(timezone.utc)
        expired_tokens = [
            token
            for token, session in self._storage.items()
            if (now - session.started_at).total_seconds() > self.SESSION_TTL_SECONDS
        ]
        for token in expired_tokens:
            del self._storage[token]


# Instancia singleton (mismo patrón que los demás repositorios)
session_repository = SessionRepository()
