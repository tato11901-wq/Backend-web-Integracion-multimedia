# Integración App Web - Proyecto Multimedia

Este repositorio contiene tanto el Backend (FastAPI) como el Frontend (Astro + Preact + Tailwind) para el sistema de mascotas virtuales e integración de minijuegos.

---

## 💻 Frontend (Astro + Preact)

La interfaz de usuario principal de las plantas y los minijuegos. Construida con **[Astro](https://astro.build)** para el enrutamiento y estructura modular de la página, y **[Preact](https://preactjs.com/)** para los componentes interactivos visuales (como los minijuegos) y el manejo fluido del estado (Signals), con los estilos gestionados mediante **Tailwind CSS**.

### 🚀 Cómo ejecutar el Frontend

1. **Navegar a la carpeta del Frontend:**
```bash
cd "Front/Imaginatio Web Front"
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abrir la página en el navegador:**
Visita la URL local proporcionada en la consola (por defecto `http://localhost:4321`).

### 🎮 Minijuegos del Frontend

Los minijuegos son componentes Preact que se renderizan como paneles overlay (modal fullscreen). Se activan al hacer click en su botón correspondiente en el dashboard y se cierran al completarlos o presionar la **X**.

El estado global de cada minijuego se maneja con **Preact Signals** en `src/store/resourceStore.js`.

#### 💧 Minijuego de Agua (`MiniGames/water.tsx`)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Hacer la mayor cantidad de clicks sobre el emoji 💧 |
| **Tiempo** | 9 segundos (inicia al primer click) |
| **Resultado** | Cada click = +1 recurso de agua |
| **Trigger** | Click en la **Regadera** o **Cartel de Agua** |
| **Señales** | `isWaterGameOpen`, `waterLevel`, `addWater()` |

#### 🌱 Minijuego de Composta (`MiniGames/compost.tsx`)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Seleccionar solo los 3 objetos **orgánicos** entre 8 objetos mezclados |
| **Tiempo** | 5 segundos |
| **Objetos orgánicos** | 🍌 Cáscara de plátano, 🍎 Corazón de manzana, 🥚 Cáscara de huevo |
| **Objetos inorgánicos** | 🥤 Vaso de plástico, 🔋 Pila, 📎 Clip metálico, 🛍️ Bolsa de plástico, 🥫 Lata |
| **Resultado** | Ganar = +1 composta / Perder = reintentar o cerrar |
| **Trigger** | Click en la **Bolsa de Composta** o **Cartel de Composta** |
| **Señales** | `isCompostGameOpen`, `compostLevel`, `addCompost()` |

**Mecánica:**
1. Se muestra una pantalla de inicio con instrucciones
2. Al presionar "¡Empezar!", los 8 objetos se mezclan aleatoriamente (Fisher-Yates shuffle) en una grilla 4×2
3. El jugador selecciona/deselecciona objetos tocándolos (toggle)
4. Al acabarse el tiempo se evalúa: si seleccionó exactamente los 3 orgánicos → gana

> **Nota:** Los emojis son placeholders temporales. Serán reemplazados por imágenes personalizadas en el arreglo `ALL_ITEMS` del componente.

#### 📁 Estructura de archivos de minijuegos

```
src/
├── store/
│   └── resourceStore.js        # Signals globales (water, compost)
├── components/
│   └── MiniGames/
│       ├── water.tsx            # Minijuego de agua
│       └── compost.tsx          # Minijuego de composta
└── pages/
    └── index.astro              # Renderiza ambos con client:load
```

---

## ⚙️ Backend (FastAPI) v2.0 (Secure Edition)

API en FastAPI para el control y progresión de plantas virtuales, ahora con **integración segura autoritativa** para minijuegos y autenticación **JWT**.

### 🚀 Cómo ejecutar el Backend

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Ejecutar el servidor uvicorn:**
```bash
cd back
uvicorn main:app --reload
```
### O ALTERNATIVA

1. **Instalar dependencias ALTERNATIVA:**
```bash
python -m pip install -r requirements.txt
```

2. **Ejecutar el servidor uvicorn ALTERNATIVA:**
```bash
cd back
python -m uvicorn main:app --reload
```

---

## 🛠️ Módulos y Endpoints del Backend

### 🔐 1. Autenticación (JWT)
*   **`POST /auth/login`**: Punto de entrada. Envía `{"username": "TuNombre"}`.
    *   **Respuesta**: Devuelve un `token` JWT y los datos del usuario.
    *   **Uso**: El cliente debe incluir este token en la cabecera `Authorization: Bearer <token>` para todas las peticiones protegidas.

### 🎮 2. Minijuegos (Backend-Authoritative)
El sistema ha sido refactorizado para evitar manipulaciones de puntuación. El flujo es:

1.  **`POST /minigame/start`**: Inicia una sesión de juego.
    *   Valida el **Cooldown** (10 min).
    *   Genera un `session_token` único y el layout de items (para compost).
2.  **`POST /minigame/end`**: Finaliza el juego y reclama recompensa.
    *   Calcula la **duración real** en el servidor (anti-skipping).
    *   Valida **Clicks por segundo** (agua) o **Selección correcta** (compost).
    *   Actualiza el inventario y devuelve el nuevo estado del usuario.

### 🌱 3. Gestión de Plantas
*   **`GET /users/me/active-plant`**: Recupera tu planta activa (usa el JWT para identificarte).
*   **`GET /users/me/inventory`**: Lista de todas tus plantas.
*   **`PATCH /users/me/active-plant`**: Cambia tu planta actual (`{"plant_id": "..."}`).

### 💖 4. Cuidados de la Mascota
*   **`POST /plant/{plant_id}/{action}`**: Aplica cuidados (`/water`, `/sun`, `/prune`).
    *   Consume recursos de tu inventario sincronizado.
