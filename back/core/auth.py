"""
Módulo de autenticación JWT para la Virtual Plant API.
Proporciona creación y verificación de tokens JWT para identificar
usuarios de forma segura sin confiar en datos del cliente.
"""

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# En producción: usar variable de entorno (os.environ["SECRET_KEY"])
SECRET_KEY = "imaginatio-2026-secret-key"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


def create_token(user_id: str) -> str:
    """Crea un JWT firmado con el user_id como subject."""
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    FastAPI Dependency — extrae user_id del JWT en el header Authorization.
    Uso: user_id: str = Depends(get_current_user_id)
    """
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido: sin subject")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Inicia sesión de nuevo.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
