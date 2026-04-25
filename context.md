# Proyecto Imaginatio - Contexto General

Este documento sirve como guía técnica y de diseño para el desarrollo del simulador de plantas "Imaginatio".

## 🛠 Arquitectura Tecnológica
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: Astro + Preact + TailwindCSS
- **Estado Global**: NanoStores / Preact Signals (`plantStore.ts`, `resourceStore.ts`)
- **Comunicación**: REST API con sincronización bidireccional inmediata de acciones.

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
    - No decae con el tiempo. Consumido al evolucionar.
    - Se obtiene en minijuego de composta (4 composta = 1 abono).
- **Salud (Health)**:
    - Valor derivado del cumplimiento del recurso más crítico.
    - Sincronizado tras cada acción (`water`, `sun`, `prune`) mediante llamadas a la API.

### 3. Persistencia y Sincronización
- **Acciones**: Cada interacción (regar, abonar, evolucionar) dispara una petición asíncrona al backend para persistir el estado.
- **Evolución**: La ruta `/plant/{id}/evolve` en el backend valida requisitos y actualiza la fase permanentemente.
- **Batching**: Se utiliza `batch()` de `@preact/signals` para evitar flickering visual al cambiar de planta activa o sincronizar estados masivos.

## 🎨 Diseño y UI

### 1. Interfaz Dinámica
- **Mensajería HUD**: El panel superior (`TopHeader.tsx`) muestra mensajes en primera persona de la planta.
    - **Saludable**: Frases positivas y cariñosas.
    - **Necesidad Ligera**: Peticiones suaves de agua o sol (threshold <= 3).
    - **Alerta Crítica**: Texto con borde negro y relleno animado (pulso Rojo-Blanco) para urgencias (threshold <= 1).

### 2. Estética Visual
- **Sprites**: Registro centralizado en `plantSpriteRegistry.ts` que gestiona escalados y desplazamientos individuales por especie/fase.
- **Flicker-Free**: El componente `Plant.tsx` sincroniza instantáneamente el cambio de especie/fase al cambiar de planta activa, reservando el retraso de 1.5s únicamente para la animación de evolución natural.

## ⚙️ Desarrollo y Depuración
- **Admin Debug Panel**:
    - Permite añadir recursos directamente a la base de datos mediante el endpoint `/debug/add-resources`.
    - Adelantar el tiempo de cooldowns y simular decaimiento.
- **Rutas FastAPI**: El orden de las rutas es crítico. La ruta específica `/evolve` debe preceder a la ruta dinámica `/{action}` para evitar conflictos de validación de enums.

## 📁 Archivos Clave
- `back/api/routes/plant_routes.py`: Gestión de endpoints de interacción y evolución (Orden de rutas crítico).
- `back/services/minigame_service.py`: Configuración de recompensas y cooldowns (10 min estándar).
- `Front/src/store/plantStore.ts`: Núcleo de sincronización y lógica de cliente.
- `Front/src/components/dashboard/TopHeader.tsx`: Sistema de mensajería y alertas dinámicas.
- `Front/src/components/dashboard/Plant.tsx`: Renderizado principal con lógica de delay condicional.

---
*Última actualización: Implementación de mensajería HUD en primera persona, sistema de alertas críticas y optimización de sincronización atómica (batching).*
