from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import plant_routes, auth_routes, user_routes, minigame_routes

app = FastAPI(
    title="Virtual Plant API",
    description="API para el manejo de plantas virtuales con mecánicas basadas en tiempo.",
    version="2.0.0" # Actualizado a v2 por integración segura
)

# Configuración de CORS para permitir peticiones desde el frontend (Astro)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos (ej: Vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluyendo los endpoints bajo sus correspondientes prefijos
app.include_router(plant_routes.router)
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(minigame_routes.router)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a la Virtual Plant API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }
