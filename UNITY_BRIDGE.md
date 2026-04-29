# 🌳 Imaginatio — Puente de Datos Web ↔ Unity (`.tree`)

> **Documento técnico** | Integración de datos entre la capa Web (Astro/Preact) y Unity 3D  
> Fecha: 2026-04-29 | Versión del esquema: **2**

---

## ¿Qué es el archivo `.tree`?

El archivo `.tree` es el **único punto de intercambio de datos** entre la aplicación web y Unity. Tiene extensión `.tree` pero su contenido interno es **JSON válido** — Unity lo lee parseándolo como JSON directamente.

Reemplaza el sistema anterior que separaba `ents` y `seeds` en estructuras distintas. Ahora **contiene toda la información del usuario y todas sus plantas**, sin filtros.

---

## Estructura del archivo

```json
{
  "version": 2,

  "usuario": {
    "id": "olivares_001",
    "nombre": "olivares_001",
    "nivel": 5,
    "xp": 1200
  },

  "recursos": {
    "agua":     { "cantidad": 12 },
    "sol":      { "cantidad": 5  },
    "composta": { "cantidad": 3  }
  },

  "plantas": [
    {
      "id": "aliso",
      "subid": "willy_aliso",
      "desbloqueada": true,

      "estado": {
        "fase":      "semilla",
        "salud":     "saludable",
        "hp_actual": 1200
      },

      "progreso": {
        "nivel": 2,
        "xp":    150
      },

      "visual_estado": {
        "skin":      "default",
        "variacion": "normal"
      },

      "uso": {
        "seleccionada": true,
        "en_combate":   false
      },

      "recursos_aplicados": {
        "agua":     1,
        "sol":      1,
        "composta": 1
      }
    }
  ],

  "semillas": [
    {
      "seed_id":     "seed_xyz_001",
      "species_id":  "pasto",
      "categoria":   "Base",
      "recibida_en": 1714000000000
    }
  ]
}
```

---

## División de responsabilidades

Cada campo del `.tree` tiene un propietario claro. **Ningún lado debe sobrescribir los campos del otro.**

### 🟢 Lo define y actualiza la Web

| Campo | Descripción |
|---|---|
| `usuario.id` | Identificador único del usuario |
| `usuario.nombre` | Username del jugador |
| `recursos.agua/sol/composta.cantidad` | Stock del inventario web |
| `planta.id` | ID interno de la planta (debe coincidir con Unity) |
| `planta.subid` | Nombre de instancia en Unity (ej: `"willy_aliso"`) |
| `planta.desbloqueada` | Si la planta está disponible para usar en 3D |
| `planta.estado.fase` | Fase de crecimiento: `semilla`, `arbusto`, `planta`, `ent` |
| `planta.visual_estado` | Skin y variación visual |
| `planta.recursos_aplicados` | Reflejo de los recursos aplicados en Web |

### 🔴 Lo define y actualiza Unity/3D

| Campo | Descripción |
|---|---|
| `usuario.nivel` | Nivel global del jugador en el juego |
| `usuario.xp` | Experiencia global acumulada |
| `planta.estado.salud` | Estado cualitativo: `saludable`, `dañado`, `critico`, `muerto` |
| `planta.estado.hp_actual` | HP numérico de la planta |
| `planta.progreso.nivel` | Nivel de la planta en 3D |
| `planta.progreso.xp` | XP de la planta en 3D |
| `planta.uso.seleccionada` | Si esta planta es la activa en 3D |
| `planta.uso.en_combate` | Si está en un combate activo |
| `semillas[]` | Semillas creadas desde 3D (se suman al inventario web) |

> ⚠️ **Regla crítica**: Unity **nunca debe modificar** `planta.estado.fase`, `planta.desbloqueada`, ni ningún campo de `recursos`. Solo escribe los campos listados en la columna 🔴.

---

## Flujo de datos

```
┌─────────────────────────────────────────────────────┐
│                    WEB (Astro/Preact)                │
│                                                     │
│  Acción del usuario                                 │
│  (regar, aplicar sol, evolucionar, etc.)            │
│           │                                         │
│           ▼                                         │
│   syncInventoryToTree()  ──────────────────────► localStorage
│   [auto-sync en cada acción]                   "imaginatio_tree_data"
└─────────────────────────────────────────────────────┘
                    │                ▲
                    │  Exportar      │  Importar
                    ▼                │
              archivo .tree     archivo .tree
              (descarga)        (botón "Sync desde 3D")
                    │                │
                    ▼                │
┌─────────────────────────────────────────────────────┐
│                     UNITY 3D                        │
│                                                     │
│  Lee el .tree → JSON.parse                          │
│  Usa: plantas[], usuario.nivel/xp, uso.*            │
│                                                     │
│  Modifica: salud, hp_actual, nivel, xp,             │
│            uso.seleccionada, uso.en_combate          │
│            semillas[] (nuevas)                      │
│                                                     │
│  Exporta el .tree modificado                        │
└─────────────────────────────────────────────────────┘
```

---

## Cómo Unity accede a los datos

### 1. Leer el archivo `.tree`

El `.tree` es JSON renombrado. Unity lo lee con cualquier librería de parsing JSON estándar:

```csharp
// C# / Unity
using System.IO;
using UnityEngine;

public class TreeBridge : MonoBehaviour
{
    [System.Serializable]
    public class TreeEstado
    {
        public string fase;
        public string salud;
        public int    hp_actual;
    }

    [System.Serializable]
    public class TreeProgreso
    {
        public int nivel;
        public int xp;
    }

    [System.Serializable]
    public class TreeUso
    {
        public bool seleccionada;
        public bool en_combate;
    }

    [System.Serializable]
    public class TreePlant
    {
        public string       id;
        public string       subid;
        public bool         desbloqueada;
        public TreeEstado   estado;
        public TreeProgreso progreso;
        public TreeUso      uso;
    }

    [System.Serializable]
    public class TreeUsuario
    {
        public string id;
        public string nombre;
        public int    nivel;
        public int    xp;
    }

    [System.Serializable]
    public class TreeSeed
    {
        public string seed_id;
        public string species_id;
        public string categoria;
        public long   recibida_en;
    }

    [System.Serializable]
    public class ImaginatioTreeData
    {
        public int          version;
        public TreeUsuario  usuario;
        public TreePlant[]  plantas;
        public TreeSeed[]   semillas;
    }

    public static ImaginatioTreeData LoadTree(string filePath)
    {
        string json = File.ReadAllText(filePath);
        return JsonUtility.FromJson<ImaginatioTreeData>(json);
    }

    public static void SaveTree(ImaginatioTreeData data, string filePath)
    {
        string json = JsonUtility.ToJson(data, prettyPrint: true);
        File.WriteAllText(filePath, json);
    }
}
```

> 💡 Si `JsonUtility` no soporta todos los campos, usar **Newtonsoft.Json** (disponible en Unity vía Package Manager como `com.unity.nuget.newtonsoft-json`).

### 2. Identificar plantas por `id` y `subid`

- **`id`**: identificador semántico de la especie (`"aliso"`, `"espino"`). Coincide con el nombre del prefab/modelo en Unity.
- **`subid`**: nombre de la instancia específica (`"willy_aliso"`). Usar para diferenciar múltiples instancias del mismo modelo.

```csharp
// Ejemplo: cargar solo plantas desbloqueadas
var plantasActivas = data.plantas
    .Where(p => p.desbloqueada)
    .ToArray();

// Instanciar el prefab correcto por id
foreach (var planta in plantasActivas)
{
    var prefab = Resources.Load<GameObject>($"Plants/{planta.id}");
    var instance = Instantiate(prefab);
    instance.name = planta.subid; // nombre único en escena
}
```

### 3. Escribir los campos de 3D y exportar

Unity solo debe modificar los campos que le corresponden y exportar el `.tree` completo de vuelta:

```csharp
// Actualizar campos de 3D en una planta
var planta = data.plantas.FirstOrDefault(p => p.id == "aliso");
if (planta != null)
{
    planta.estado.salud     = "dañado";
    planta.estado.hp_actual = 850;
    planta.progreso.nivel   = 3;
    planta.progreso.xp      = 420;
    planta.uso.en_combate   = true;
}

// Agregar semilla nueva
var nuevaSemilla = new TreeSeed
{
    seed_id    = System.Guid.NewGuid().ToString(),
    species_id = "nogal",
    categoria  = "Templado",
    recibida_en = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
};
var listaActualizada = data.semillas.ToList();
listaActualizada.Add(nuevaSemilla);
data.semillas = listaActualizada.ToArray();

// Guardar el .tree modificado
TreeBridge.SaveTree(data, rutaDelArchivo);
```

---

## Cómo la Web actualiza el `.tree`

### Auto-sync en cada acción

El `.tree` se regenera automáticamente en `localStorage` (`imaginatio_tree_data`) cada vez que el usuario realiza una acción en la web:

| Acción web | Trigger de sync |
|---|---|
| Abre el inventario | `syncInventoryToTree()` |
| Riega / aplica sol / composta | Tras la acción en minijuego |
| Evoluciona una planta | Tras la evolución |
| Cambia de planta activa | Al seleccionar en inventario |
| Crea o elimina una planta | Al confirmar la operación |

La función clave es `syncInventoryToTree(plants)` en `unityBridge.ts`:
- Actualiza `usuario` desde el store reactivo
- Mapea todas las plantas sin filtro
- **Preserva los campos de 3D** (`salud`, `hp_actual`, `nivel`, `xp`, `uso.*`) que ya estaban guardados — no los pisa

### Botón "Sync desde 3D"

El botón pastilla verde 🟢 en la esquina inferior derecha del juego permite importar el `.tree` modificado por Unity:

1. El usuario selecciona el archivo `.tree` exportado por Unity
2. `loadTreeFile(file)` lo parsea como JSON
3. `applyTreeDataFrom3D(data)` aplica **solo los campos de 3D**:
   - `usuario.nivel` y `usuario.xp`
   - Por cada planta: `salud`, `hp_actual`, `progreso.nivel`, `progreso.xp`, `uso.*`
   - Agrega semillas nuevas (evita duplicados por `seed_id`)
4. El resultado se persiste en `localStorage`

> ℹ️ Los campos que Web administra (`fase`, `desbloqueada`, `recursos`, etc.) nunca son sobreescritos durante esta importación, incluso si están presentes en el archivo de Unity.

---

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `Front/.../store/unityBridge.ts` | Lógica de exportación/importación del `.tree`, tipos TypeScript |
| `Front/.../store/localDb.ts` | Modelo `LocalPlant` con campos `unity_*` opcionales + tipo `SpeciesEntry` |
| `Front/.../components/dashboard/GameArea.tsx` | Botón pastilla "Sync desde 3D" |
| `Front/.../components/dashboard/Inventory.tsx` | Display de datos 3D (nivel/XP en Ents, salud/HP en todas) |
| `Front/.../config/species.json` | Catálogo de especies con `unity_id` y `unity_subid_prefix` |
| `JsonPruebaProyecto.txt` | Documento de referencia del esquema con anotaciones `[WEB]`/`[3D]` |

---

## Dónde se guarda el `.tree`

### En la web (localStorage)

El `.tree` se persiste automáticamente en el `localStorage` del navegador bajo la clave:

```
imaginatio_tree_data
```

Puedes inspeccionarlo en cualquier momento desde las DevTools del navegador:

```
Application → Storage → Local Storage → [dominio] → imaginatio_tree_data
```

O desde la consola:

```js
JSON.parse(localStorage.getItem('imaginatio_tree_data'))
```

> ⚠️ Este dato **persiste entre sesiones** del navegador. Si el usuario limpia el almacenamiento del navegador, el `.tree` se pierde. Por eso el flujo de exportar/importar el archivo físico `.tree` es la forma recomendada de sincronizar con Unity.

### Como archivo físico (intercambio con Unity)

El archivo se genera al presionar el botón **"Sync desde 3D"** y en el flujo inverso Unity lo devuelve modificado. La ubicación del archivo depende del lado:

| Lado | Ubicación del `.tree` |
|---|---|
| **Web** | `localStorage` clave `imaginatio_tree_data` (automático) |
| **Web → Unity** | Descarga en la carpeta de Descargas del usuario (via `downloadTreeFile()`) |
| **Unity** | Cualquier ruta del sistema de archivos donde Unity escriba su save |
| **Unity → Web** | El usuario lo selecciona con el botón pastilla (file picker) |

### En Unity (ruta sugerida)

Se recomienda guardar el `.tree` en la carpeta de datos persistentes de Unity para que sobreviva entre sesiones:

```csharp
// Ruta recomendada en Unity
string rutaTree = Path.Combine(
    Application.persistentDataPath,
    "imaginatio_save.tree"
);
```

En Windows esto resuelve a:
```
C:\Users\[usuario]\AppData\LocalLow\[Empresa]\[Proyecto]\imaginatio_save.tree
```

---

## Catálogo de especies (`species.json`) — variantes de modelo (`subids`)

Cada especie en `species.json` tiene un campo `subids: string[]` que lista las **variantes de modelo** disponibles para esa especie.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador de la especie (clave del objeto). Puede tener tildes. |
| `subids` | `string[]` | Variantes de modelo disponibles. Cada valor es el nombre exacto de la carpeta de spritesheets (Web) y del prefab (Unity). |

### ¿Qué es un `subid`?

Un `subid` identifica una **variante visual** de una especie. Por ejemplo, si el cajeto puede tener dos pieles distintas:

```json
"cajeto": {
  "id": "cajeto",
  "subids": ["cajeto", "cajeto_dorado"],
  ...
}
```

Esto significa que hay dos variantes:
- `cajeto` → carpeta `Recursos planta/cajeto/` en Web, prefab `cajeto` en Unity
- `cajeto_dorado` → carpeta `Recursos planta/cajeto_dorado/` en Web, prefab `cajeto_dorado` en Unity

### Flujo completo del `subid`

1. **Al crear una planta** (`createPlantForUser`): se elige aleatoriamente uno de los `subids` disponibles con `pickSubId(speciesId)`
2. **En el `.tree`**: el `subid` elegido se escribe en `planta.subid` — Unity lo recibe y carga ese prefab
3. **En Web**: `PLANT_SPRITE_REGISTRY` usa el `subid` como clave para cargar los sprites correctos
4. **Ambos lados usan los mismos nombres** — no hay traducción ni mapeo extra

### Para agregar una variante nueva

1. Crea la carpeta de spritesheets en `src/assets/Recursos planta/<subid>/`
2. Registra el subid en `PLANT_SPRITE_REGISTRY` en `plantSpriteRegistry.ts`
3. Añade el nuevo subid al array en `species.json`
4. Crea el prefab con el mismo nombre en Unity


## Visualización de datos de 3D en la UI web

La web muestra los datos de 3D en el **panel de detalle de planta** del inventario:

- **Todas las plantas**: badge de salud (`🌿 saludable`, `⚠️ dañado`, `🔥 critico`, `💀 muerto`) y HP si existen
- **Solo Ents** (`fase === "ent"`): sección "⚔️ Datos del Ent" con Nivel y XP
- **Badges de estado en combate**: "ACTIVO 3D" y "EN COMBATE" si los flags de Unity lo indican

> Estos datos son de **solo lectura** en la UI web — el usuario no puede modificarlos desde la aplicación.

---

## Notas de integración

- El archivo `.tree` debe tratarse como un **intercambio manual** en la fase actual: Unity exporta → usuario lo carga en Web con el botón pastilla.
- En una fase de integración futura con **Unity WebGL**, se puede automatizar leyendo/escribiendo directamente en `localStorage` usando `ExternalCall` / `JSLib`, accediendo a la clave `imaginatio_tree_data`.
- La versión actual del esquema es **`version: 2`**. El bridge web migra automáticamente datos en formato v1 al abrirlos.
