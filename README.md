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

El estado global de cada minijuego se maneja con **Preact Signals** en `src/store/resourceStore.ts`.

#### 💧 Minijuego de Agua (`MiniGames/water.tsx`)

| Aspecto       | Detalle                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| **Objetivo**  | Hacer la mayor cantidad de clicks sobre la gota                                        |
| **Tiempo**    | 9 segundos (inicia al primer click)                                                    |
| **Resultado** | Cada click incrementa la barra de progreso. La recompensa depende del nivel alcanzado. |
| **Trigger**   | Click en el botón de**Agua** en el Dashboard                                           |
| **Señales**   | `isWaterGameOpen`, `waterInventory`                                                    |

#### 🌱 Minijuego de Composta (`MiniGames/compost.tsx`)

| Aspecto                 | Detalle                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| **Objetivo**            | Seleccionar solo los 3 objetos**orgánicos** entre 8 objetos mezclados |
| **Tiempo**              | 5 segundos                                                            |
| **Objetos orgánicos**   | 🍌 Banana, 🍎 Manzana, 🌿 Hoja                                        |
| **Objetos inorgánicos** | Lata, Vidrio, Basura, etc.                                            |
| **Resultado**           | Ganar = +1 composta / Perder = reintentar o cerrar                    |
| **Trigger**             | Click en el botón de**Composta** en el Dashboard                      |
| **Señales**             | `isCompostGameOpen`, `fertilizerInventory`                            |

**Mecánica:**

1. Se muestra una pantalla de inicio con instrucciones.
2. Al presionar "¡Empezar!", los 8 objetos se mezclan aleatoriamente.
3. El jugador selecciona/deselecciona objetos tocándolos.
4. Al acabarse el tiempo se evalúa: si seleccionó exactamente los orgánicos → gana.

#### ☀️ Minijuego de Sol (`MiniGames/sun.tsx`)

| Aspecto       | Detalle                                                         |
| ------------- | --------------------------------------------------------------- |
| **Objetivo**  | Hacer click en la caja para subir de "Tier" y obtener más soles |
| **Tiers**     | Bronce, Plata, Oro, Diamante, Solar                             |
| **Resultado** | A mayor Tier, mayor recompensa de Soles (ej: Solar = +5 Soles)  |
| **Trigger**   | Click en el botón de**Sol** en el Dashboard                     |
| **Señales**   | `isSunGameOpen`, `sunInventory`                                 |

**Mecánica:**

1. El jugador tiene 4 clicks para mejorar el tier de la caja.
2. Cada click tiene una probabilidad de subir el tier de la caja, indicado por una barra de progreso interactiva.
3. Se muestra retroalimentación visual (shake, badge) si se sube de tier, y las recompensas se otorgan con animaciones.

#### 🔧 Admin Debug Panel (`DebugPanel.tsx`)

Accesible para pruebas de desarrollo, permite manipular la salud, fase de evolución y progresos de cuidados de la planta. Incluye trampas para añadir recursos (Agua, Sol, Abono) y avanzar el tiempo (`Fast-Forward`) simulando el progreso del cooldown y la salud de la planta de forma local y en el backend de forma sincronizada.

#### 🌿 Sistema de Evolución y Animaciones

El frontend ahora soporta el ciclo de vida autónomo de la planta (Semilla, Brote, Planta y Ent). Se emplean spritesheets (`semilla_idle_spritesheet.png`, `fase2_idle_spritesheet.png`, etc.) y al interactuar con ella se activan animaciones (riego, evolución). Se muestran efectos de partículas si la planta entra en estado de peligro (Danger Particles) o crítico (Critical Particles) para advertir al jugador de que la salud está decayendo.

#### 📁 Estructura de archivos principal

```
src/
├── store/
│   ├── resourceStore.ts         # Signals globales (agua, composta, sol)
│   ├── plantStore.ts            # Signals de la planta (fases, salud, evolución)
│   └── apiClient.ts             # Cliente fetch al backend
├── components/
│   ├── dashboard/
│   │   ├── Plant.tsx            # Componente de la planta y animaciones
│   │   ├── DebugPanel.tsx       # Panel de debug / admin
│   │   ├── ProgressBar.tsx      # Barras de progreso de salud y cuidados
│   │   └── ...                  # Botones e UI del dashboard
│   └── MiniGames/               # Componentes modales de minijuegos
└── pages/
    └── index.astro              # Integración principal
```

---

## ⚙️ Backend (FastAPI) v2.0 (Secure Edition)

API en FastAPI para el control y progresión de plantas virtuales, con **integración segura autoritativa** para minijuegos y autenticación **JWT**.

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

### 🛠️ Módulos y Endpoints del Backend

### 🔐 1. Autenticación (JWT)

- **`POST /auth/login`**: Punto de entrada. Envía `{"username": "TuNombre"}`.
  - **Respuesta**: Devuelve un `token` JWT y los datos del usuario.
  - **Uso**: El cliente debe incluir este token en la cabecera `Authorization: Bearer <token>` para todas las peticiones protegidas.

### 🎮 2. Minijuegos (Backend-Authoritative)

El sistema valida y autoriza la puntuación en el backend:

1. **`POST /minigame/start`**: Inicia una sesión de juego. Valida el **Cooldown**. Genera un `session_token` único y establece el estado inicial del minijuego.
2. **`POST /minigame/end`** / **`POST /minigame/sun/click`**: Finaliza el juego o envía acciones para calcular las recompensas y verificar el comportamiento del usuario en el backend.

### 🌱 3. Gestión de Plantas

- **`GET /users/me/active-plant`**: Recupera tu planta activa, su salud, los progresos de cuidado y la fase de evolución actual en base a la última vez que el servidor actualizó la planta (decay overtime).
- **`GET /users/me/inventory`**: Lista de todas tus plantas.
- **`POST /debug/fast-forward`**: Avanza el reloj del backend para simular el paso del tiempo y decaimiento de salud.

### 💖 4. Cuidados de la Mascota

- **`POST /plant/{plant_id}/{action}`**: Aplica cuidados (`/water`, `/sun`, `/prune`). Consume recursos de tu inventario sincronizado y restaura la salud y barra de progreso.
