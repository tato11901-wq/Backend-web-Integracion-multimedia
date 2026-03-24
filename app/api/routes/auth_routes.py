from fastapi import APIRouter
from app.schemas.user import UserLogin, LoginResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(login_data: UserLogin):
    """
    Endpoint simple de login. 
    Dado un username, recupera al usuario existente o crea uno nuevo en el inventario.
    """
    user = UserService.login_or_register(username=login_data.username)
    return LoginResponse(
        user=user,
        message="Login successful"
    )
