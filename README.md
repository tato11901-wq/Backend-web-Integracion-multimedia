# Backend Plant API (Virtual Plants)

API en FastAPI para el control y progresión de plantas virtuales.

## Cómo ejecutar

1. Instalar dependencias
```bash
pip install -r requirements.txt
```

2. Ejecutar el servidor uvicorn:
```bash
uvicorn app.main:app --reload
```

3. Abrir la documentación de Swagger:
[http://localhost:8000/docs](http://localhost:8000/docs)

## Ejemplos de Requests y Responses (Usando CURL)

### 1. Crear Planta
```bash
curl -X 'POST' \
  'http://localhost:8000/plant/' \
  -H 'accept: application/json' \
  -d ''
```

**Response:**
```json
{
  "id": "e44d5619-3c8c-4f76-ae0e-26f6eb8b6cfd",
  "message": "Plant created successfully"
}
```

### 2. Consultar Planta
```bash
curl -X 'GET' \
  'http://localhost:8000/plant/e44d5619-3c8c-4f76-ae0e-26f6eb8b6cfd' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "id": "e44d5619-3c8c-4f76-ae0e-26f6eb8b6cfd",
  "stage": "seed",
  "water": 0.0,
  "sun": 0.0,
  "fertilizer": 0.0,
  "health": 100.0,
  "last_update": "2026-03-17T22:04:19Z",
  "last_interaction": "2026-03-17T22:04:19Z",
  "is_dead": false
}
```

### 3. Regar Planta (Acción `water`)
```bash
curl -X 'POST' \
  'http://localhost:8000/plant/e44d5619-3c8c-4f76-ae0e-26f6eb8b6cfd/water' \
  -H 'accept: application/json' \
  -d ''
```

**Response:**
```json
{
  "id": "e44d5619-3c8c-4f76-ae0e-26f6eb8b6cfd",
  "stage": "seed",
  "water": 20.0,
  "sun": 0.0,
  "fertilizer": 0.0,
  "health": 100.0,
  "last_update": "2026-03-17T22:05:00Z",
  "last_interaction": "2026-03-17T22:05:00Z",
  "is_dead": false
}
```
*(Nota: Nota como el `water` subió a 20.0, y luego de varios regados alcanzará el umbral para crecer hacia la próxima fase (bush))*
