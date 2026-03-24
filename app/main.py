from fastapi import FastAPI
from app.api.routes import plant_routes, auth_routes, user_routes

app = FastAPI(
    title="Virtual Plant API",
    description="API para el manejo de plantas virtuales con mecánicas basadas en tiempo.",
    version="1.0.0"
)

# Incluyendo los endpoints bajo sus correspondientes prefijos
app.include_router(plant_routes.router)
app.include_router(auth_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a la Virtual Plant API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }
