# Estructura del Proyecto Frontend IMAGINATIO 2026

Actualizado para la versión "Pixel Art / Stardew Valley Aesthetic" de la interfaz de juego. Se ha aprovechado la estructura de Astro combinada con componentes React (`.tsx`) para modularizar y agilizar el desarrollo frontend.

> [!NOTE]
> Todos los componentes interactivos se desarrollan en React (dentro de la carpeta `components/`) y se importan en los archivos `.astro` (dentro de `pages/`) usando directivas como `client:load` para indicar hidratación en el navegador.

## 🗂 Árbol de Directorios Principal (Frontend)

```text
src/
├── components/           # Componentes UI (React)
│   ├── dashboard/        # Componentes particionados de la vista principal del juego
│   │   ├── TopHeader.tsx # Cabecera de madera superior (Nombre de Planta, Alerta, Menú)
│   │   ├── LeftSigns.tsx # Carteles colgantes izq (Medidores de Sol y Agua)
│   │   ├── RightSigns.tsx# Carteles colgantes der (Medidor de Abono)
│   │   ├── GameArea.tsx  # Zona central (Maceta, Planta, Composta, Regadera, Puntero de sol)
│   │   └── BottomActions.tsx # Botones fijos inferiores (Iluminar, Regar, Abonar)
│   ├── MainUI.tsx        # Contenedor padre que ensambla el fondo global y todos los módulos del `dashboard`
│   └── MiniGames/        # Logica y UI de los minijuegos (ej. `water.tsx`)
├── layouts/
│   └── Layout.astro      # Plantilla HTML base y hoja de estilos globales (`global.css`)
├── pages/
│   └── index.astro       # Punto de entrada de la aplicación. Muestra <MainUI /> y <Water />
└── store/
    └── resourceStore.js  # Estado global de la aplicación gestionado con Nano Stores / Preact Signals
```

## 🧩 Flujo de Componentes del Dashboard

Al entrar, la página principal (`index.astro`) solicita el renderizado de `MainUI`. Las piezas se ensamblan de la siguiente manera simulando elementos 2D en perspectiva paralela:

1. **`MainUI.tsx`**: Pone la capa 0 (el fondo inyectado con imágenes como el invernadero y pisos simulados).
2. **`TopHeader.tsx`**: Fija la barra en la parte superior. Emplea un efecto visual de "vigas y tablas de madera clavadas", muy recurrente en el *Pixel Art*.
3. **`LeftSigns.tsx` / `RightSigns.tsx`**: Crean un enmarcado orgánico para mostrar los recursos consumidos (Sol, Agua, Abono).
   > [!TIP]
   > Aquí en `LeftSigns.tsx` se conecta directamente la lectura al estado `waterLevel.value` provisto por `resourceStore.js`, posibilitando que cuando juegas al minijuego del agua, esta barra avance en tiempo real.
4. **`GameArea.tsx`**: Contiene la planta (lista para que se reemplace su PNG actual por los assets que construyan en Unity o aseprite). *La "Regadera o Jarra"* se sitúa en esta zona y su botón tiene la configuración `onClick={() => isWaterGameOpen.value = true}`, que invoca la aparición emergente del componente `<Water />`.
5. **`BottomActions.tsx`**: La capa superior (frente a la cámara del usuario) donde se disponen los "atajos rápidos" verdes.

## 💾 Gestión del Estado (Store)

Para evitar pasar variables en cascada ("prop drilling") a través de los múltiples archivos, estamos usando `resourceStore.js` con las utilidades de `@preact/signals`.

```javascript
// resourceStore.js
import { signal } from "@preact/signals"

export const waterLevel = signal(0)
export const isWaterGameOpen = signal(false)
```
Cualquier componente que importe estas señales puede reaccionar cuando sus valores se modifiquen. Un ejemplo es la subida del medidor de agua tras recolectar clics.

## 🎨 Convenciones de Estilo (Tailwind)

Se optó por no usar imágenes de madera pesadas temporalmente. En su reemplazo, los volúmenes, los clavos sobre madera, los postes y los "Stickers" se logran usando puramente propiedades embebidas en Tailwind, por ejemplo:
- `shadow-[0_4px_0_rgba(1,1,1,1)]`: Sombras sólidas y duras en CSS que imitan los bordes de bisel *Pixel Art*.
- Gradientes y colores terrosos estáticos (`#bc6c25`, `#d4a373`).
