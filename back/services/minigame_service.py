import random
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from models.minigame_session import MinigameSession
from repositories.session_repository import session_repository
from repositories.user_repository import user_repository
from schemas.user import MinigameType

# ═══════════════════════════════════════════════════════
# CONFIGURACIÓN CENTRALIZADA — ÚNICA FUENTE DE VERDAD
# ═══════════════════════════════════════════════════════
MINIGAME_CONFIG = {
    "water": {
        "cooldown_seconds": 600,           # 10 minutos
        "game_duration_seconds": 5,        # El juego dura 5s
        "max_duration_tolerance_ms": 7000, # 5s + 2s margen de latencia
        "min_duration_ms": 2000,           # Mínimo 2s (anti-bot)
        "max_clicks": 60,                  # Máximo 60 clicks
        "max_clicks_per_second": 15,       # Anti-autoclicker: máx 15 cps
    },
    "compost": {
        "cooldown_seconds": 600,
        "game_duration_seconds": 3,        # 3 segundos
        "max_duration_tolerance_ms": 5000, # 3s + 2s margen
        "min_duration_ms": 1000,           # Mínimo 1s
        "total_items": 8,
        "organic_count": 3,                # 3 orgánicos
        "inorganic_count": 5,              # 5 inorgánicos
        # Pool de items posibles (el backend elige 8 al azar cada partida)
        "organic_pool": [
            {"id": 1, "name": "Cáscara de plátano", "emoji": "🍌"},
            {"id": 2, "name": "Corazón de manzana", "emoji": "🍎"},
            {"id": 3, "name": "Cáscara de huevo",  "emoji": "🥚"},
            {"id": 9, "name": "Hoja seca",          "emoji": "🍂"},
            {"id": 10, "name": "Flores marchitas",  "emoji": "🥀"},
        ],
        "inorganic_pool": [
            {"id": 4, "name": "Vaso de plástico",  "emoji": "🥤"},
            {"id": 5, "name": "Pila",               "emoji": "🔋"},
            {"id": 6, "name": "Clip metálico",      "emoji": "📎"},
            {"id": 7, "name": "Bolsa de plástico",  "emoji": "🛍️"},
            {"id": 8, "name": "Lata",               "emoji": "🥫"},
            {"id": 11, "name": "Vidrio roto",       "emoji": "🪟"},
        ],
    },
    "sun": {
        "cooldown_seconds": 600,           # 10 minutos
        "total_clicks": 4,                 # 4 clicks por partida
        # Probabilidades de subir de tier (tier actual → siguiente)
        # tier_up_probs[i] = probabilidad de subir estando en tier i
        # Índice 0 sin uso; tier 1→2=80%, 2→3=60%, 3→4=40%, 4→5=20%, 5→5=0%
        "tier_up_probs": [0, 0.80, 0.60, 0.40, 0.20, 0.0],
        "max_tier": 5,
    },
}

class MinigameService:
    # ─────────── START: Crear sesión ───────────
    @staticmethod
    def start_game(user_id: str, game_type: str) -> MinigameSession:
        config = MINIGAME_CONFIG.get(game_type)
        if not config:
            raise HTTPException(400, "Tipo de minijuego inválido")

        user = user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "Usuario no encontrado")

        # 1. Verificar cooldown
        MinigameService._check_cooldown(user, game_type, config)

        # 2. Verificar que no tenga otra sesión activa para este juego (opcional pero recomendado)
        existing_session = session_repository.get_active_by_user(user_id)
        if existing_session and existing_session.game_type == game_type:
            # Podríamos invalidarla o simplemente dejar que expire.
            # Por ahora, dejamos que cree una nueva que sobreescribirá la anterior en lógica de store si fuera persistente.
            pass

        # 3. Crear sesión
        session = MinigameSession(user_id=user_id, game_type=game_type)

        # 4. Para compost: generar layout aleatorio SERVER-SIDE
        if game_type == "compost":
            organic_sample = random.sample(
                config["organic_pool"], config["organic_count"]
            )
            inorganic_sample = random.sample(
                config["inorganic_pool"], config["inorganic_count"]
            )
            all_items = organic_sample + inorganic_sample
            random.shuffle(all_items)
            session.generated_layout = all_items
            session.organic_ids = [item["id"] for item in organic_sample]

        # 5. Para soles (caja): inicializar tier y clicks
        if game_type == "sun":
            session.current_tier = 1
            session.clicks_remaining = config["total_clicks"]

        session_repository.save(session)
        return session

    # ─────────── SUN CLICK: Procesar un click individual de la caja ───────────
    @staticmethod
    def process_sun_click(user_id: str, session_token: str) -> dict:
        """
        Procesa un click individual en la caja de soles.
        Actualiza el tier según probabilidad y devuelve el estado actual.
        Si no quedan clicks, finaliza la sesión y otorga la recompensa.
        """
        session = session_repository.get_by_token(session_token)

        if not session:
            raise HTTPException(400, "Sesión no encontrada o expirada")
        if session.user_id != user_id:
            raise HTTPException(403, "Esta sesión no te pertenece")
        if session.ended:
            raise HTTPException(400, "Esta sesión ya fue procesada")
        if session.game_type != "sun":
            raise HTTPException(400, "Esta sesión no es de tipo 'sun'")
        if session.clicks_remaining <= 0:
            raise HTTPException(400, "No quedan clicks en esta sesión")

        config = MINIGAME_CONFIG["sun"]

        # Intentar subir de tier según probabilidad
        tier_before = session.current_tier
        prob = config["tier_up_probs"][session.current_tier]
        tier_up = random.random() < prob
        if tier_up and session.current_tier < config["max_tier"]:
            session.current_tier += 1

        session.clicks_remaining -= 1
        is_last_click = session.clicks_remaining == 0

        # Si es el último click: cerrar sesión y dar recompensa
        if is_last_click:
            session.ended = True
            now = datetime.now(timezone.utc)
            reward = session.current_tier  # Recompensa = tier alcanzado (1–5 soles)

            user = user_repository.get_by_id(user_id)
            user.sun_inventory += reward
            user.last_sun_minigame = now
            user_repository.save(user)
            session_repository.delete(session_token)

            cooldown_ends = now + timedelta(seconds=config["cooldown_seconds"])

            return {
                "click_number": config["total_clicks"] - 0,  # último click
                "tier_before": tier_before,
                "tier_after": session.current_tier,
                "tier_up": tier_up,
                "clicks_remaining": 0,
                "finished": True,
                "reward": reward,
                "cooldown_ends_at": cooldown_ends.isoformat(),
                "user": user,
            }

        # Click intermedio: guardar sesión actualizada y devolver estado
        session_repository.save(session)
        return {
            "click_number": config["total_clicks"] - session.clicks_remaining,
            "tier_before": tier_before,
            "tier_after": session.current_tier,
            "tier_up": tier_up,
            "clicks_remaining": session.clicks_remaining,
            "finished": False,
            "reward": None,
            "cooldown_ends_at": None,
            "user": None,
        }

    # ─────────── END: Procesar resultado ───────────
    @staticmethod
    def end_game(user_id: str, session_token: str, payload) -> dict:
        session = session_repository.get_by_token(session_token)

        # Validaciones de sesión
        if not session:
            raise HTTPException(400, "Sesión de juego no encontrada o expirada")
        if session.user_id != user_id:
            raise HTTPException(403, "Esta sesión no te pertenece")
        if session.ended:
            raise HTTPException(400, "Esta sesión ya fue procesada")

        session.ended = True
        config = MINIGAME_CONFIG[session.game_type]
        now = datetime.now(timezone.utc)

        # ══ DURACIÓN: calculada por el backend ══
        elapsed_ms = (now - session.started_at).total_seconds() * 1000

        if elapsed_ms < config["min_duration_ms"]:
            session_repository.delete(session_token)
            raise HTTPException(400, "Juego completado demasiado rápido (sospechoso)")

        # ══ CALCULAR RECOMPENSA según tipo ══
        user = user_repository.get_by_id(user_id)

        reward = 0
        if session.game_type == "water":
            reward = MinigameService._process_water(payload, config, elapsed_ms)
            user.water_inventory += reward
            user.last_water_minigame = now

        elif session.game_type == "compost":
            reward = MinigameService._process_compost(payload, session, config)
            user.compost_inventory += reward
            user.last_compost_minigame = now
            # Autoconversión: 4 composta → 1 abono
            if user.compost_inventory >= 4:
                new_fert = user.compost_inventory // 4
                user.fertilizer_inventory += new_fert
                user.compost_inventory %= 4

        user_repository.save(user)
        session_repository.delete(session_token)

        cooldown_ends = now + timedelta(seconds=config["cooldown_seconds"])

        return {
            "reward": reward,
            "game_type": session.game_type,
            "cooldown_ends_at": cooldown_ends,
            "user": user,
        }

    # ═══════════════════════════════════════════
    #  FUNCIONES PRIVADAS DE CÁLCULO Y VALIDACIÓN
    # ═══════════════════════════════════════════

    @staticmethod
    def _check_cooldown(user, game_type: str, config: dict):
        cooldown_field = {
            "water": "last_water_minigame",
            "compost": "last_compost_minigame",
            "sun": "last_sun_minigame",
        }.get(game_type)

        last_played = getattr(user, cooldown_field, None) if cooldown_field else None
        if last_played:
            # Asegurar que last_played tenga timezone para la resta
            if last_played.tzinfo is None:
                last_played = last_played.replace(tzinfo=timezone.utc)
                
            elapsed = (datetime.now(timezone.utc) - last_played).total_seconds()
            remaining = config["cooldown_seconds"] - elapsed
            if remaining > 0:
                mins = int(remaining // 60)
                secs = int(remaining % 60)
                raise HTTPException(
                    400,
                    f"Debes esperar {mins}m {secs}s para volver a jugar."
                )

    @staticmethod
    def _process_water(payload, config: dict, elapsed_ms: float) -> int:
        """Valida clicks y calcula recompensa de agua."""
        clicks = payload.clicks

        # Anti-cheat: cap de clicks
        if clicks is None or clicks < 0:
            raise HTTPException(400, "Datos de clicks inválidos")
        
        # Anti-autoclicker: verificar clicks/segundo
        elapsed_seconds = max(elapsed_ms / 1000, 0.1)
        cps = clicks / elapsed_seconds
        
        # Si sobrepasa el CPS máximo significativamente, es trampa
        if cps > config["max_clicks_per_second"]:
            raise HTTPException(
                400,
                f"Velocidad de clicks sospechosa ({cps:.1f} cps). Máximo permitido: {config['max_clicks_per_second']} cps. Intenta de nuevo sin usar trampas."
            )

        # Aplicar cap para el cálculo de recompensa
        clicks_capped = min(clicks, config["max_clicks"])

        # Tabla de recompensas (doc: líneas 199-203, ajustada a 60 max)
        if clicks_capped >= 60: return 6
        if clicks_capped > 25:  return 4
        if clicks_capped == 25: return 2
        return 0

    @staticmethod
    def _process_compost(payload, session: MinigameSession, config: dict) -> int:
        """Valida items seleccionados contra el layout GENERADO POR EL BACKEND."""
        selected_ids = payload.selected_items

        if selected_ids is None or not isinstance(selected_ids, list):
            raise HTTPException(400, "Datos de items seleccionados inválidos")

        # Validar que los IDs enviados son del layout generado
        valid_ids = [item["id"] for item in session.generated_layout]
        for sid in selected_ids:
            if sid not in valid_ids:
                raise HTTPException(400, f"Item {sid} no pertenece a esta partida")

        # Calcular: cuántos de los seleccionados son orgánicos
        correct = [sid for sid in selected_ids if sid in session.organic_ids]
        wrong   = [sid for sid in selected_ids if sid not in session.organic_ids]

        # Si seleccionó CUALQUIER basura → fallo, 0 recurso
        if wrong:
            return 0

        # Devuelve cantidad de orgánicos correctos (0 a 3)
        # Recuerda: se necesitan 4 composta para 1 abono → min 2 partidas
        return len(correct)
