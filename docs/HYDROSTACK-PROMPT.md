# HYDROSTACK — Contexto Completo de la Aplicación

## Descripción General

**HydroStack** es una plataforma web para diseñar, evaluar y documentar proyectos de tratamiento de agua, desde pequeña escala hasta plantas completas. Permite a ingenieros y profesionales del sector hídrico desarrollar proyectos técnicos de forma estructurada y rigurosa.

**Objetivo oficial**: "HydroStack es una plataforma para diseñar, evaluar y documentar proyectos de tratamiento de agua, desde pequeña escala hasta plantas completas."

---

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Vanilla CSS con variables CSS (NO usa TailwindCSS ni frameworks CSS)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Hosting**: Vercel
- **Repositorio**: https://github.com/Lucesdata/hydrostack

---

## Arquitectura de la Aplicación

### Estructura de Rutas

```
/                              → Landing page pública
/login                         → Inicio de sesión
/signup                        → Registro de usuarios

/dashboard                     → Listado de proyectos del usuario
/dashboard/new                 → Crear nuevo proyecto

/dashboard/projects/[id]       → Layout del proyecto (sidebar + contenido)
  ├── /general                 → Paso 1: Información General
  ├── /population              → Paso 2: Población y Censo
  ├── /floating-population     → Paso 3: Población Estacional
  ├── /source                  → Paso 4: Fuente de Agua
  ├── /consumption             → Paso 5: Consumo de Agua
  ├── /quality                 → Paso 6: Calidad del Agua
  ├── /caudales                → Paso 7: Caudales de Diseño
  ├── /tank                    → Paso 8: Almacenamiento
  ├── /conduccion              → Paso 9: Conducción
  ├── /desarenador             → Paso 10: Desarenador
  ├── /jar-test                → Paso 11: Ensayo de Jarras
  ├── /filtro-lento            → Paso 12: Filtro Lento de Arena
  ├── /compact-design          → Paso 13: Ingeniería Compacta
  ├── /costs                   → Paso 14: Costos (OpEx)
  ├── /viability               → Paso 15: Viabilidad y O&M
  ├── /tech-selection          → Paso 16: Selección de Tecnología
  └── /report                  → Informe Final (consolidación)
```

---

## Base de Datos (Supabase - PostgreSQL)

### Tabla Principal

**`projects`** — Entidad principal del proyecto
- `id` (UUID, PK)
- `user_id` (UUID, FK a auth.users)
- `name` (VARCHAR) — Nombre del proyecto
- `description` (TEXT) — Descripción
- `location` (VARCHAR) — Ubicación (ciudad, departamento)
- **`project_type`** (VARCHAR) — Tipo de proyecto (contexto, NO flujo)
- `status` (VARCHAR) — Estado: 'Borrador', 'En diseño', 'Completado', 'Archivado'
- `latitude` (FLOAT) — Coordenada GPS
- `longitude` (FLOAT) — Coordenada GPS
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tablas Secundarias (Relación 1:1 con `projects`)

Cada módulo técnico tiene su propia tabla:

1. `project_calculations` — Población, caudales, almacenamiento
2. `project_seasonal_data` — Población estacional (flotante)
3. `project_sources` — Caracterización de fuente hídrica
4. `project_consumption` — Dotaciones y consumos
5. `project_water_quality` — Parámetros fisicoquímicos y microbiológicos
6. `project_conduccion` — Diseño hidráulico de tuberías
7. `project_treatment` — Dimensionamiento de tratamiento
8. `project_desarenador` — Diseño de sedimentador
9. `project_jar_test` — Ensayos de coagulación
10. `project_filtros_lentos` — Diseño de filtros de arena
11. `project_compact_ptap` — Plantas compactas
12. `project_opex` — Costos operativos
13. `project_viability` — Evaluación de viabilidad
14. `project_tech_matrix` — Matriz multicriterio de selección

**Relación**: Todas las tablas secundarias tienen `project_id` (UUID, FK a `projects.id`)

---

## Estructura del Proyecto (Flujo de Trabajo)

El flujo se denomina **"Estructura del Proyecto"** y consta de **16 módulos técnicos + 1 informe final**, organizados conceptualmente en **7 bloques**:

### BLOQUE A — Contexto y Alcance del Proyecto
**Propósito**: Definir el marco general del proyecto

1. **Información General** (`/general`)
   - Nombre, descripción, ubicación, tipo de proyecto, estado
   - Coordenadas GPS
   - Componente: `GeneralInfoForm.tsx`

### BLOQUE B — Caracterización de Demanda
**Propósito**: Cuantificar población beneficiaria y demanda de agua

2. **Población y Censo** (`/population`)
   - Proyección demográfica (método geométrico/aritmético)
   - Población de diseño (horizonte 20-25 años)
   - Componente: `PopulationForm.tsx`

3. **Población Estacional** (`/floating-population`)
   - Ajuste por población flotante (turismo, estacionalidad)
   - Factor de mayoración de demanda
   - Componente: `FloatingPopulationForm.tsx`

5. **Consumo de Agua** (`/consumption`)
   - Dotaciones per cápita (RAS 2000)
   - Dotación neta, bruta (con pérdidas)
   - Componente: `ConsumptionForm.tsx`

### BLOQUE C — Caracterización de Fuente Hídrica
**Propósito**: Identificar y evaluar fuente de agua

4. **Fuente de Agua** (`/source`)
   - Tipo: superficial, subterránea, lluvia
   - Caudal disponible (L/s)
   - Componente: `SourceForm.tsx`

6. **Calidad del Agua** (`/quality`)
   - Parámetros fisicoquímicos (pH, turbiedad, color)
   - Parámetros microbiológicos (coliformes, E. coli)
   - Componente: `QualityForm.tsx`

### BLOQUE D — Diseño Hidráulico y Almacenamiento
**Propósito**: Calcular caudales y dimensionar infraestructura

7. **Caudales de Diseño** (`/caudales`)
   - Qmd (caudal medio diario)
   - QMD (caudal máximo diario)
   - QMH (caudal máximo horario)
   - Componente: `CaudalesForm.tsx`

8. **Almacenamiento** (`/tank`)
   - Volumen de regulación y reserva
   - Dimensionamiento geométrico del tanque
   - Componente: `TankForm.tsx`

9. **Conducción** (`/conduccion`)
   - Diseño de tuberías (Hazen-Williams)
   - Selección de diámetro y material
   - Componente: `ConduccionForm.tsx`

### BLOQUE E — Tratamiento Primario y Secundario
**Propósito**: Diseñar unidades de tratamiento

10. **Desarenador** (`/desarenador`)
    - Remoción de arenas y limos
    - Dimensionamiento de cámara de sedimentación
    - Componente: `DesarenadorForm.tsx`

11. **Ensayo de Jarras** (`/jar-test`)
    - Dosis óptima de coagulante
    - pH óptimo de coagulación
    - Componente: `JarTestForm.tsx`

12. **Filtro Lento de Arena** (`/filtro-lento`)
    - Filtración biológica y física
    - Área de filtro, tasa de filtración
    - Componente: `FiltroLentoForm.tsx`

13. **Ingeniería Compacta** (`/compact-design`)
    - Plantas compactas (coagulación-sedimentación-filtración)
    - Componente: `CompactDesignForm.tsx`

### BLOQUE F — Evaluación Técnica y Económica
**Propósito**: Estimar costos y evaluar viabilidad

14. **Costos (OpEx)** (`/costs`)
    - Químicos, energía, personal, mantenimiento
    - Costo mensual y por m³ tratado
    - Componente: `OpexForm.tsx`

15. **Viabilidad y O&M** (`/viability`)
    - Accesibilidad, disponibilidad de insumos
    - Capacidad operativa
    - Componente: `ViabilityForm.tsx`

16. **Selección de Tecnología** (`/tech-selection`)
    - Matriz multicriterio (AHP)
    - Comparación de alternativas
    - Componente: `TechSelectionMatrix.tsx`

### BLOQUE G — Documentación
**Propósito**: Consolidar información en documento técnico

📄 **Informe Final** (`/report`)
   - Memoria técnica completa
   - Consolidación de todos los módulos
   - Componente: `ProjectReport.tsx`

---

## Concepto Clave: Tipo de Proyecto como CONTEXTO (NO como flujo)

### Tipos de Proyecto Disponibles

```typescript
const projectTypes = [
    'Agua potable rural',
    'Agua potable urbano',
    'Potabilización privada',
    'Desalinización',
    'Tratamiento aguas residuales',
    'Tratamiento industrial'
];
```

### Concepto Técnico

El campo **`project_type`** es un **metadato descriptivo** que caracteriza el proyecto sin alterar su estructura:

- ✅ Se almacena en la tabla `projects`
- ✅ El usuario lo selecciona al crear el proyecto o en "Información General"
- ✅ Se muestra en el dashboard y en informes
- ❌ **NO controla rutas** (todos los tipos usan las mismas rutas)
- ❌ **NO duplica código** (un solo flujo universal)
- ❌ **NO restringe funcionalidad** (todos los módulos están disponibles)

### Principio de Diseño

**Un flujo único universal** que sirve para todos los tipos de proyecto, garantizando:

1. **Universalidad**: Aplica a rural, urbano, institucional, residencial, industrial
2. **Mantenibilidad**: Sin duplicación de código
3. **Flexibilidad**: El ingeniero decide qué módulos usar según criterio técnico
4. **Escalabilidad**: Agregar nuevos tipos NO requiere duplicar código

---

## Componentes Principales

### 1. `ProjectSidebar.tsx`
- Navegación lateral con los 16 pasos
- Resalta el módulo activo
- Incluye comentarios de clasificación interna por bloques
- NO muestra agrupación visual (lista secuencial 1-16)

### 2. Componentes de Formularios (20 archivos)

Patrón consistente:
```typescript
export default function ModuleForm({ projectId, initialData }) {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    
    const handleSubmit = async (e) => {
        // Guardar en Supabase en la tabla correspondiente
    };
    
    return <form>...</form>;
}
```

Ubicación: `/src/components/projects/`

### 3. `ProjectReport.tsx`
- Consolida datos de todas las tablas
- Genera documento técnico completo
- Formato imprimible/exportable

### 4. Layout del Proyecto
- Archivo: `/src/app/dashboard/projects/[id]/layout.tsx`
- Renderiza:
  - `ProjectSidebar` (navegación izquierda)
  - `children` (contenido del módulo)
  - `ProjectSummary` (panel derecho con resumen)

---

## Principios de Diseño del Sistema

### 1. Flujo Único Universal
- Un solo flujo de trabajo para todos los tipos de proyecto
- Evita duplicación de código
- Mantiene consistencia

### 2. Contexto como Metadata
- `project_type` es descriptivo, NO prescriptivo
- NO controla rutas ni módulos

### 3. Flexibilidad del Ingeniero
- Todos los módulos disponibles para todos los proyectos
- El usuario decide qué llenar según criterio técnico

### 4. Módulos Opcionales Conceptuales
- No todos los módulos aplican a todos los proyectos
- Ejemplo: Desarenador solo aplica si hay turbiedad alta
- El ingeniero puede dejar módulos vacíos o marcar "No Aplica"

### 5. Navegación Libre
- El usuario puede saltar entre módulos sin restricciones
- No hay secuencia obligatoria (aunque se recomienda orden lógico)

### 6. Persistencia Granular
- Cada módulo guarda en su propia tabla
- Evita pérdida de datos
- Facilita consultas específicas

---

## Flujo de Uso Típico

1. **Usuario se registra/inicia sesión** → Supabase Auth
2. **Accede al Dashboard** → Ve listado de sus proyectos
3. **Crea un nuevo proyecto** → Define nombre, tipo, ubicación
4. **Navega por los 16 módulos** → Va llenando información técnica:
   - Caracteriza demanda (población, consumo)
   - Caracteriza fuente (tipo, calidad)
   - Calcula caudales de diseño
   - Dimensiona almacenamiento y conducción
   - Diseña unidades de tratamiento (si aplica)
   - Evalúa costos y viabilidad
   - Selecciona tecnología óptima
5. **Genera informe final** → Documento técnico completo exportable

---

## Referencias Normativas

El sistema se basa en:
- **RAS 2000** (Colombia): Reglamento Técnico del Sector de Agua Potable
- **Resolución 2115 de 2007** (Colombia): Calidad del agua potable
- **OMS**: Guías para la calidad del agua de bebida
- **AWWA**: American Water Works Association — Standards

---

## Terminología Técnica Clave

- **Qmd**: Caudal medio diario (m³/día)
- **QMD**: Caudal máximo diario (L/s)
- **QMH**: Caudal máximo horario (L/s)
- **OpEx**: Operational Expenditure (Gastos Operativos)
- **PTAP**: Planta de Tratamiento de Agua Potable
- **O&M**: Operación y Mantenimiento
- **NTU**: Nephelometric Turbidity Units (Unidades de Turbiedad)
- **RAS**: Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico

---

## Estilo de Código

- **No usar TailwindCSS**: Todo el CSS es Vanilla con variables CSS
- **Variables CSS**: Definidas en archivo global (ej: `--color-primary`, `--radius-lg`)
- **TypeScript estricto**: Todos los archivos con tipado
- **Next.js App Router**: NO usar Pages Router
- **Server Components por defecto**: Client Components solo cuando se necesita interactividad
- **Supabase Client/Server**: Usar `createClient()` según contexto

---

## Estado Actual del Proyecto

### ✅ Implementado y Funcional

- ✅ Autenticación con Supabase Auth
- ✅ Dashboard con listado de proyectos
- ✅ CRUD de proyectos
- ✅ 16 módulos técnicos completos
- ✅ Persistencia en base de datos
- ✅ Navegación fluida entre módulos
- ✅ Generación de informe final
- ✅ Clasificación conceptual documentada
- ✅ Tipo de proyecto como contexto

### 🚧 Próximas Funcionalidades (NO implementadas)

- ⏳ Valores predeterminados por tipo de proyecto
- ⏳ Sistema de validaciones contextuales
- ⏳ Indicadores de progreso (% completitud)
- ⏳ Exportación de informes a PDF
- ⏳ Plantillas predefinidas por tipo de proyecto
- ⏳ Sistema de recomendación de tecnologías (IA)

---

## Arquitectura de Archivos Clave

```
hydrostack/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    → Listado de proyectos
│   │   │   ├── new/
│   │   │   │   └── page.tsx                → Crear proyecto
│   │   │   └── projects/
│   │   │       └── [id]/
│   │   │           ├── layout.tsx          → Layout con sidebar
│   │   │           ├── general/page.tsx    → Paso 1
│   │   │           ├── population/page.tsx → Paso 2
│   │   │           └── ... (resto de pasos)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── page.tsx                        → Landing page
│   ├── components/
│   │   ├── projects/
│   │   │   ├── GeneralInfoForm.tsx
│   │   │   ├── PopulationForm.tsx
│   │   │   ├── ... (20 componentes de formularios)
│   │   │   ├── ProjectReport.tsx
│   │   │   └── ProjectSummary.tsx
│   │   ├── ProjectSidebar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   └── utils/
│       └── supabase/
│           ├── client.ts                   → Supabase client-side
│           └── server.ts                   → Supabase server-side
├── docs/
│   ├── estructura-tecnica.md               → Documentación técnica completa
│   ├── PASO-3-RESUMEN.md                   → Resumen de cambios Paso 3
│   └── HYDROSTACK-PROMPT.md                → Este archivo
├── public/
├── .env.local                              → Variables de entorno (Supabase)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Comandos Principales

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Inicio en producción
npm start

# Linting
npm run lint
```

---

## Convenciones de Código

1. **Nombres de archivos**: PascalCase para componentes, kebab-case para rutas
2. **Componentes**: Un componente por archivo
3. **Estilos inline**: Usar objeto de estilos (NO className con TailwindCSS)
4. **Variables CSS**: Usar variables definidas (ej: `var(--color-primary)`)
5. **Tipado**: Todas las props y estados deben estar tipados
6. **Async/Await**: Preferir sobre .then().catch()
7. **Error handling**: Siempre manejar errores de Supabase

---

## Contexto para Nuevas Funcionalidades

Cuando implementes nuevas funcionalidades, recuerda:

1. ✅ **Mantener el flujo único universal** — NO crear rutas distintas por tipo de proyecto
2. ✅ **Respetar la arquitectura de bloques** — Nuevos módulos se insertan en el bloque correspondiente
3. ✅ **Persistencia granular** — Cada módulo tiene su tabla (o se agrega columna a tabla existente)
4. ✅ **Flexibilidad del usuario** — NO restringir módulos según tipo de proyecto
5. ✅ **Documentación técnica** — Actualizar `/docs/estructura-tecnica.md`
6. ✅ **Patrón de formularios** — Seguir el patrón consistente de los componentes existentes

---

## Ejemplo de Prompt para ChatGPT

**Uso**: Copia todo el contenido de este archivo y úsalo como contexto inicial al interactuar con ChatGPT sobre HydroStack.

**Ejemplo**:

```
[Pega el contenido completo de este archivo]

Ahora, ayúdame a implementar [funcionalidad específica] en HydroStack.
```

---

**Fin del Contexto de Aplicación — HydroStack**
