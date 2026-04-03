from fastapi import APIRouter
from schemas.user import UserLogin, LoginResponse
from services.user_service import UserService
from core.auth import create_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(login_data: UserLogin):
    """
    Endpoint simple de login. 
    Dado un username, recupera al usuario existente o crea uno nuevo en el inventario.
    Devuelve un JWT firmado para que el cliente lo use en sus cabeceras.
    """
    user = UserService.login_or_register(username=login_data.username)
    token = create_token(user.id)
    
    return LoginResponse(
        user=user,
        token=token,
        message="Login successful"
    )
