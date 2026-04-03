"""
Modelo de sesión temporal de minijuego.

Cada vez que un usuario inicia un minijuego, el backend crea una sesión
que registra el momento exacto de inicio (para calcular duración real)
y, para el minijuego de compost, el layout generado por el servidor.

Cuando se migre a base de datos, este modelo se convertirá en una tabla
con TTL o limpieza por cron job.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional


class MinigameSession:
    def __init__(self, user_id: str, game_type: str):
        self.token: str = str(uuid.uuid4())
        self.user_id: str = user_id
        self.game_type: str = game_type
        self.started_at: datetime = datetime.now(timezone.utc)
        self.ended: bool = False

        # Solo para compost: layout generado por el backend
        self.generated_layout: Optional[list[dict]] = None
        # IDs de los items orgánicos en ESTA partida específica
        self.organic_ids: Optional[list[int]] = None
