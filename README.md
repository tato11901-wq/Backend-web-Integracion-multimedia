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

---

## ⚙️ Backend (FastAPI)

API en FastAPI para el control y progresión de plantas virtuales, integrado con autenticación simple, inventarios de usuario y mecánicas de minijuegos con restricciones de tiempo real.

### 🚀 Cómo ejecutar el Backend

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Ejecutar el servidor uvicorn:**
```bash
# Estando en la raíz del backend:
fastapi dev app/main.py
# (Alternativa: uvicorn app.main:app --reload)
```

3. **Abrir la documentación interactiva de Swagger:**
[http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Módulos y Endpoints del Backend

A continuación se detalla el ciclo de vida del jugador y la planta en el servidor:

### 👤 1. Autenticación y Perfil
*   **`POST /auth/login`**: Punto de entrada. Envía un `{"username": "TuNombre"}` para registrar un nuevo jugador (si no existe) o iniciar sesión. El servidor te devolverá tu ID único (`User ID`).

### 🌱 2. Gestión de Plantas y Planta Activa
*   **`POST /plant/?owner_id={tu_user_id}`**: Crea una nueva semilla (seed). Si el usuario no tenía plantas previas, esta se convierte automáticamente en su mascota principal (planta activa).
*   **`GET /users/{tu_user_id}/active-plant`**: Recupera toda la información vital, estadísticas, ciclo y debuffs de tu planta actual en cuidado.
*   **`GET /users/{tu_user_id}/inventory`**: Muestra una lista (Array) con todas las plantas que te pertenecen.
*   **`PATCH /users/{tu_user_id}/active-plant`**: Permite cambiar la planta que estás cuidando actualmente. Recibe en el body `{"plant_id": "ID_NUEVA_PLANTA"}`.

### 🎮 3. Minijuegos y Ganancia de Recursos
Como no puedes alimentar a una planta del aire, primero debes reunir recursos jugando en el frontend.
*   **`POST /users/{tu_user_id}/minigame`**: Registra tu puntuación en un minijuego al finalizarlo. Recibe en el body un JSON con:
    *   `"game_type"`: (Puede ser `"water"`, `"sun"`, o `"compost"`).
    *   `"score"`: La cantidad de clicks o puntos que obtuviste.
    *   **Lógica automática:** El backend convierte tu `score` en unidades reales de recurso y las guarda en tu inventario.
    *   **Composta a Abono:** Si recoges 4 unidades de composta (`compost`), automáticamente se convierten en 1 unidad de abono (`fertilizer`).
    *   **Cooldowns ⏱️:** Cada juego exige una espera de **10 Minutos** reales para poder volverse a jugar repetidamente.

### 💖 4. Cuidados reales de la Mascota
Una vez tengas los recursos y tu planta activa identificada, puedes gastarlos usándolos en la planta.
*   **`POST /plant/{plant_id}/{action}`**: Aplica el cuidado.
    *   Puedes usar las acciones en la URL como: `/water` (gasta 1 agua), `/sun` (gasta 1 sol), `/prune` (gasta 1 abono).
    *   **Validación estricta:** Si tu inventario está en `0`, te devolverá Error 400.
    *   **Beneficio:** Evita que tu planta muera al reiniciar su contador de inactividad de 72h, le regenera salud y alimenta sus umbrales para que **evolucione a la siguiente fase** de crecimiento.
