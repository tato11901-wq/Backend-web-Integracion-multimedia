# Proyecto Imaginatio - Contexto General

Este documento sirve como guía técnica y de diseño para el desarrollo del simulador de plantas "Imaginatio".

## 🛠 Arquitectura Tecnológica
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: Astro + Preact + TailwindCSS
- **Estado Global**: NanoStores (`plantStore.ts`, `resourceStore.ts`)
- **Comunicación**: REST API con sincronización periódica de estado.

## 🌿 Sistema de Ciclo de Vida de la Planta

### 1. Fases de Crecimiento
Las fases están sincronizadas entre Backend y Frontend usando los siguientes identificadores:
- `seed` (Semilla)
- `small_bush` (Arbusto Pequeño)
- `large_bush` (Arbusto Grande)
- `ent` (Fase Final / Ent)

### 2. Recursos y Mecánicas de Cuidado
- **Agua (Water)** y **Sol (Sun)**:
    - Decaimiento: **1 unidad cada 10 minutos** (6 unidades por hora).
    - Límite: Determinado por la fase actual en `species.json`.
- **Abono (Fertilizer)**:
    - No decae con el tiempo.
    - Se acumula y se consume al evolucionar la planta.
    - Al usarlo, otorga un bonus de +1 en agua y sol.
- **Salud (Health)**:
    - Es un valor derivado (0-100%).
    - Se calcula como el porcentaje de cumplimiento del recurso más crítico.
    - **Regla de Visualización**: La salud se basa en unidades redondeadas hacia arriba (`Math.ceil`). Si visualmente la planta tiene 3/3 de agua, su salud será 100%, aunque internamente el valor sea 2.5.

### 3. Fase Especial: Ent
- Al alcanzar la fase `ent`, la planta se vuelve **autosuficiente**.
- Los recursos (Agua, Sol, Abono) y la Salud se fijan al **máximo permanentemente**.
- Es inmune al decaimiento temporal.

## 🎨 Diseño y UI
- **Estética**: Diseño premium con micro-animaciones, texturas naturales y bordes definidos.
- **Barras de Progreso**:
    - Muestran números planos (enteros) usando `Math.ceil`.
    - El ancho visual de la barra está sincronizado con el número entero mostrado.
    - Texto: Blanco con borde negro (`-webkit-text-stroke`) para máxima legibilidad.

## ⚙️ Desarrollo y Depuración
- **Admin Panel**: Accesible mediante `Alt + Click` o `Shift + Click` en el saco de abono en `GameArea.tsx`.
- **Modo Debug**: Permite ver decimales exactos (4 decimales), avanzar el tiempo y resetear la planta.
- **Sincronización**: La función `syncPlantState` en el frontend es crítica para mantener la paridad con el backend tras el login o reconexión.

## 📁 Archivos Clave
- `back/core/plant_logic.py`: Motor de decaimiento y cálculo de salud.
- `back/core/species.json`: Catálogo maestro de requisitos por fase.
- `Front/.../src/store/plantStore.ts`: Lógica de cliente y predicción de estado.
- `Front/.../src/components/dashboard/ProgressBar.tsx`: Componente visual de barras.

---
*Última actualización: Refactorización de decaimiento fijo y sincronización de salud visual.*
