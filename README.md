# Integración App Web - Proyecto Multimedia

Este repositorio contiene la aplicación de mascotas virtuales e integración de minijuegos (Imaginatio / Plantagochi). Originalmente utilizaba un backend en FastAPI, pero actualmente funciona de manera **100% serverless** utilizando una base de datos simulada en el navegador (`localStorage`), con el Frontend construido en **Astro + Preact + Tailwind**.

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

#### 🎒 Inventario y Filtros (`Inventory.tsx`)

El inventario cuenta con un sistema de filtros avanzado que permite visualizar y clasificar las plantas guardadas por:
- **Estado**: Semilla, Brote, Arbusto, Ent.
- **Urgencia**: Estable, Alerta, Crítico.
- **Categoría**: Solar, Xerofito, Templado, Montaña, Hidro.
Además, las plantas muertas muestran un estado visual de lápida para facilitar su identificación y limpieza.

#### 🌟 Créditos (`CreditsModal.tsx`)

Una pantalla interactiva que muestra a los creadores del proyecto, con tarjetas responsivas que se expanden al pasar el cursor para revelar las fotos de los desarrolladores y diseñadores en alta calidad.

#### 📁 Estructura de archivos principal

```
src/
├── store/
│   ├── localDb.ts               # Base de datos simulada en localStorage
│   ├── resourceStore.ts         # Signals globales (agua, composta, sol)
│   ├── plantStore.ts            # Signals de la planta (fases, salud, evolución)
│   └── apiClient.ts             # Cliente API que redirige a localDb
├── components/
│   ├── dashboard/
│   │   ├── Plant.tsx            # Componente de la planta y animaciones
│   │   ├── Inventory.tsx        # Inventario avanzado con filtros
│   │   ├── CreditsModal.tsx     # Modal de créditos del equipo
│   │   ├── DebugPanel.tsx       # Panel de debug / admin
│   │   ├── ProgressBar.tsx      # Barras de progreso de salud y cuidados
│   │   └── ...                  # Botones e UI del dashboard
│   └── MiniGames/               # Componentes modales de minijuegos
└── pages/
    └── index.astro              # Integración principal
```

---

## ⚙️ Backend Simulado (Local Storage)

El proyecto originalmente contaba con una API en FastAPI para el control y progresión de las plantas virtuales. Sin embargo, para facilitar su uso y despliegue sin depender de servidores externos, se ha migrado a un **Backend Simulado Local** (`localDb.ts`) que opera de forma autónoma en el navegador.

### 🔐 Autenticación y Sesiones

- **Sistema Local:** El inicio de sesión crea o recupera un perfil de usuario utilizando `localStorage`.
- **Persistencia:** Los progresos, las plantas y el inventario persisten entre recargas de la página y sesiones, siempre y cuando se inicie sesión con el mismo nombre de usuario.

### 🎮 Minijuegos y Cooldowns

- El cliente de la API (`apiClient.ts`) emula los tiempos de respuesta de un servidor real.
- Los resultados de los minijuegos son validados y procesados directamente en la capa de datos local, sumando las recompensas al inventario.
- Se ha integrado un sistema de **Cooldowns** (tiempos de espera) para evitar que los jugadores abusen de los minijuegos, guardando los registros de tiempo de forma persistente.

### 🌱 Gestión del Tiempo y Decaimiento (Decay Overtime)

- El paso del tiempo se simula incluso cuando el usuario no está jugando.
- Al cargar la sesión, el sistema calcula la diferencia entre el último acceso y el tiempo actual, reduciendo automáticamente el agua y el sol de la planta, y disminuyendo su salud si llega a estado crítico.
- **Acciones:** Regar, Iluminar o Abonar la planta restará los recursos correspondientes del inventario global y actualizará los estados guardados en tiempo real.
