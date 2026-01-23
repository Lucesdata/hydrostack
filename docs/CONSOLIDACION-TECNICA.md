# PLAN DE CONSOLIDACIÓN TÉCNICA — HydroStack

**Fecha**: 22 de enero de 2026  
**Arquitecto**: Software Senior — Sistemas Técnicos Críticos  
**Proyecto**: HydroStack  
**Objetivo**: Consolidación técnica antes de crecimiento  
**Prioridad**: Estabilidad → Claridad → Escalabilidad

---

## RESUMEN EJECUTIVO

Este documento define el plan de consolidación técnica de HydroStack, un sistema funcional y estable que requiere **documentación, limpieza y aseguramiento** antes de continuar su evolución.

**Alcance**: Este plan **NO incluye nuevas funcionalidades**, solo acciones de estabilización y claridad.

**Principios rectores**:
1. **Estabilidad primero**: No romper lo que funciona
2. **Claridad técnica**: Documentar lo que existe, no lo que podría existir
3. **Preparación escalable**: Identificar límites arquitectónicos

---

## PARTE 1: DOCUMENTACIÓN TÉCNICA REAL

### 1.1 Estado Actual de la Documentación

| Documento | Estado | Contenido | Calidad |
|-----------|--------|-----------|---------|
| `/README.md` | ✅ Existente | Overview del proyecto, instalación, estructura | Bueno |
| `/docs/estructura-tecnica.md` | ✅ Existente | Clasificación de módulos en bloques | Excelente |
| `/docs/HYDROSTACK-PROMPT.md` | ✅ Existente | Contexto completo para IA | Excelente |
| `/docs/PASO-3-RESUMEN.md` | ✅ Existente | Resumen de clasificación conceptual | Bueno |
| `/docs/PASO-4-ONBOARDING-PERFILES.md` | ✅ Existente | Diseño de onboarding (propuesta) | Excelente |
| `/docs/PASO-4-RESUMEN.md` | ✅ Existente | Resumen de onboarding | Bueno |
| `ARCHITECTURE.md` | ❌ Falta | Arquitectura general actual | — |
| `CONTRIBUTING.md` | ❌ Falta | Guía para contribuir | — |
| `SECURITY.md` | ❌ Falta | Política de seguridad | — |
| Comentarios en código | ⚠️ Parcial | Algunos archivos comentados | Variable |

---

### 1.2 Documentación Necesaria (Priorizada)

#### **Prioridad ALTA** (Crear inmediatamente)

##### 1. `ARCHITECTURE.md` — Arquitectura General del Sistema

**Contenido**:
```markdown
# Arquitectura de HydroStack

## Visión General
HydroStack es una plataforma web para diseño técnico de proyectos de tratamiento de agua.

## Stack Tecnológico
- Framework: Next.js 16 (App Router)
- Lenguaje: TypeScript 5
- Base de Datos: Supabase (PostgreSQL)
- Autenticación: Supabase Auth
- Estilos: Vanilla CSS con variables CSS

## Principios Arquitectónicos

### 1. Flujo Único Universal
- TODOS los proyectos (agua potable, aguas residuales, cualquier contexto) usan el MISMO flujo
- NO hay flujos paralelos ni rutas duplicadas
- Los 16 módulos técnicos son universales

### 2. Separación de Conceptos
- **Perfil de Usuario**: Preferencias generales (futuro)
- **Dominio**: Tipo de sistema (agua potable vs aguas residuales)
- **Contexto**: Escala del proyecto (rural, urbano, etc.)
- **Flujo Técnico**: Secuencia de 16 módulos (único y compartido)

### 3. Context over Configuration
- El `project_type` es CONTEXTO, no configuración
- NO altera el flujo, solo ajusta parámetros predeterminados
- El ingeniero tiene libertad total para usar todos los módulos

## Estructura de Directorios

```
hydrostack/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # Área privada
│   │   │   ├── projects/[id]/    # Proyecto específico (16 módulos)
│   │   │   └── new/              # Crear proyecto
│   │   ├── login/                # Inicio de sesión
│   │   ├── register/             # Registro
│   │   └── layout.tsx            # Layout raíz
│   ├── components/               # Componentes React
│   │   ├── projects/             # Formularios de módulos (20 archivos)
│   │   ├── ui/                   # Componentes UI básicos
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectSidebar.tsx
│   │   └── Providers.tsx
│   ├── context/                  # Contextos React
│   │   └── AuthContext.tsx       # Contexto de autenticación
│   └── utils/                    # Utilidades
│       └── supabase/             # Clientes Supabase
├── public/                       # Archivos estáticos
├── docs/                         # Documentación técnica
└── README.md
```

## Base de Datos (Supabase - PostgreSQL)

### Tabla Principal
- `projects`: Entidad principal del proyecto

### Tablas Secundarias (1:1 con projects)
- `project_calculations`: Cálculos de población y caudales
- `project_seasonal_data`: Población estacional
- `project_sources`: Caracterización de fuente
- `project_consumption`: Dotaciones y consumos
- `project_water_quality`: Parámetros de calidad
- `project_conduccion`: Diseño hidráulico
- `project_treatment`: Dimensionamiento de tratamiento
- `project_desarenador`: Sedimentador
- `project_jar_test`: Ensayos de coagulación
- `project_filtros_lentos`: Filtros de arena
- `project_compact_ptap`: Plantas compactas
- `project_opex`: Costos operativos
- `project_viability`: Evaluación de viabilidad
- `project_tech_matrix`: Matriz de selección tecnológica

## Flujo de la Aplicación

1. Usuario se autentica (Supabase Auth)
2. Accede al dashboard (`/dashboard`)
3. Crea un proyecto (`/dashboard/new`)
4. Navega por los 16 módulos técnicos (`/dashboard/projects/[id]/...`)
5. Genera informe final (`/dashboard/projects/[id]/report`)

## Límites Arquitectónicos (NO MODIFICAR)

### ❌ Prohibido

1. **NO crear flujos paralelos**: Un solo flujo sirve para todos los tipos
2. **NO duplicar módulos**: Los 16 módulos son únicos y compartidos
3. **NO condicionar rutas por tipo**: Rutas universales para todos
4. **NO ocultar módulos según contexto**: Todos siempre visibles
5. **NO mezclar dominios en una entidad**: Separar agua potable de aguas residuales

### ✅ Permitido

1. **Agregar campos a tablas existentes** (con migración segura)
2. **Agregar nuevos módulos** (si son universales o correctamente condicionales)
3. **Valores predeterminados según contexto** (sugerencias, NO restricciones)
4. **Nuevos tipos de contexto** (agregar a lista sin romper código)

## Patrones de Diseño

### Patrón de Formularios
Todos los formularios de módulos siguen el mismo patrón:

```typescript
export default function ModuleForm({ projectId, initialData }) {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { error } = await supabase
                .from('table_name')
                .upsert({ project_id: projectId, ...formData });
            
            if (error) throw error;
            // Success feedback
        } catch (err) {
            // Error handling
        } finally {
            setLoading(false);
        }
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

### Patrón de Páginas
```typescript
export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('project_id', id)
        .single();
    
    return (
        <div>
            <h1>Module Title</h1>
            <ModuleForm projectId={id} initialData={data} />
        </div>
    );
}
```

## Seguridad

- **Row Level Security (RLS)**: Habilitado en todas las tablas
- **Autenticación**: Supabase Auth con JWT
- **Políticas**: Usuario solo accede a sus propios proyectos

## Escalabilidad

### Puntos de Extensión Seguros
1. Agregar nuevo tipo de contexto (ej: "Hospitales")
2. Agregar nuevos campos a formularios existentes
3. Agregar validaciones contextuales (advertencias, no restricciones)

### Puntos Críticos (Requieren Análisis)
1. Cambiar estructura de base de datos (requiere migración)
2. Agregar módulos condicionales (puede fragmentar flujo)
3. Separar agua potable de aguas residuales (cambio mayor)

## Referencias
- Documentación técnica: `/docs/estructura-tecnica.md`
- Contexto para IA: `/docs/HYDROSTACK-PROMPT.md`
```

---

##### 2. `CONTRIBUTING.md` — Guía para Contribuir

**Contenido**:
```markdown
# Guía de Contribución — HydroStack

## Antes de Contribuir

HydroStack es un sistema técnico crítico para ingeniería hidráulica. **La estabilidad es prioritaria**.

### Principios de Contribución

1. **No romper lo que funciona**
2. **Documentar antes de codificar**
3. **Testing antes de merge**
4. **Código técnico, no artístico**

---

## Convenciones de Código

### TypeScript

- **Tipado estricto**: Todas las funciones y variables deben tener tipos explícitos
- **No usar `any`**: Usar tipos específicos o `unknown` con type guards
- **Interfaces sobre types**: Preferir `interface` para objetos

### Nomenclatura

```typescript
// Variables y funciones: camelCase
const projectId = "123";
function calculateFlowRate() {}

// Componentes React: PascalCase
export default function ProjectDashboard() {}

// Archivos de componentes: PascalCase
// ProjectSidebar.tsx
// CaudalesForm.tsx

// Rutas de archivos: kebab-case
// /dashboard/projects/[id]/jar-test/

// Constantes: UPPER_SNAKE_CASE
const MAX_POPULATION = 10000;

// Tablas de DB: snake_case
project_calculations
project_water_quality
```

### Estilos

- **NO usar TailwindCSS**: Solo Vanilla CSS
- **Usar variables CSS**: `var(--color-primary)` en lugar de colores hardcodeados
- **Estilos inline solo temporales**: Mover a CSS modules si es permanente

```typescript
// ❌ MAL
<div style={{ color: '#225483' }}>

// ✅ BIEN
<div style={{ color: 'var(--color-primary)' }}>
```

---

## Estructura de Commits

### Formato

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]

[notas opcionales]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código (sin cambiar comportamiento)
- `test`: Agregar o corregir tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
# Bueno
docs(architecture): add ARCHITECTURE.md with system overview
fix(population): correct geometric projection calculation
feat(report): add project summary section

# Malo
fix: stuff
update
changes to code
```

---

## Proceso de Desarrollo

### 1. Antes de Codificar

```bash
# Crear rama desde main
git checkout main
git pull origin main
git checkout -b feat/module-name
```

### 2. Durante el Desarrollo

```bash
# Commits frecuentes y atómicos
git add <archivos-relacionados>
git commit -m "tipo(ámbito): descripción"
```

### 3. Antes de Pull Request

```bash
# Linter
npm run lint

# Build
npm run build

# Testing manual
npm run dev
```

### 4. Pull Request

- **Título claro**: Descripción breve del cambio
- **Descripción detallada**: Qué cambia y por qué
- **Referencias**: Link a issues si aplica
- **Screenshots**: Si hay cambios visuales

---

## Áreas del Sistema

### 🔒 CRÍTICAS (Requieren revisión exhaustiva)

- `/src/app/dashboard/projects/[id]/layout.tsx` — Layout del proyecto
- `/src/components/ProjectSidebar.tsx` — Navegación principal
- `/src/context/AuthContext.tsx` — Autenticación
- `/src/utils/supabase/` — Clientes de base de datos
- `/middleware.ts` — Middleware de autenticación

### ⚠️ SENSIBLES (Requieren testing cuidadoso)

- Formularios de módulos (`/src/components/projects/`)
- Páginas de módulos (`/src/app/dashboard/projects/[id]/`)
- Cálculos técnicos (población, caudales, etc.)

### ✅ SEGURAS (testing estándar)

- Componentes UI (`/src/components/ui/`)
- Estilos CSS
- Documentación (`/docs/`)

---

## Reglas de Pull Request

### ✅ Se Acepta

1. Documentación técnica
2. Corrección de bugs con evidencia
3. Mejoras de claridad sin cambiar lógica
4. Tests adicionales
5. Optimizaciones con benchmark

### ❌ Se Rechaza

1. Cambios sin justificación técnica
2. Refactorizaciones "porque sí"
3. Introducción de nuevas dependencias sin aprobación
4. Cambios que rompen compatibilidad
5. Código sin documentar

---

## Testing

### Manual (Obligatorio)

1. Iniciar dev server: `npm run dev`
2. Probar flujo completo del cambio
3. Verificar en diferentes navegadores (Chrome, Firefox, Safari)
4. Revisar consola del navegador (sin errores)

### Build (Obligatorio antes de PR)

```bash
npm run build
npm start

# Verificar que la build funciona correctamente
```

---

## Contacto

Para dudas técnicas sobre arquitectura:
- Revisar `/docs/ARCHITECTURE.md`
- Revisar `/docs/estructura-tecnica.md`
- Revisar `/docs/HYDROSTACK-PROMPT.md`
```

---

##### 3. Actualizar `README.md`

**Acción**: Agregar sección de "Documentación Técnica" al README actual

```markdown
## 📚 Documentación Técnica

Para desarrolladores y contribuidores:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Arquitectura general del sistema
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Guía de contribución
- **[docs/estructura-tecnica.md](./docs/estructura-tecnica.md)** — Clasificación de módulos técnicos
- **[docs/HYDROSTACK-PROMPT.md](./docs/HYDROSTACK-PROMPT.md)** — Contexto completo para IA

## 🏗️ Principios Arquitectónicos

1. **Flujo Único Universal**: Un solo flujo para todos los tipos de proyecto
2. **Context over Configuration**: El tipo de proyecto es contexto, no configuración
3. **Separation of Concerns**: Perfil ≠ Dominio ≠ Contexto ≠ Flujo
```

---

#### **Prioridad MEDIA** (Crear cuando se requiera)

##### 4. `SECURITY.md` — Política de Seguridad

```markdown
# Política de Seguridad — HydroStack

## Versiones Soportadas

| Versión | Soportada |
|---------|-----------|
| 0.1.x   | ✅ Sí     |

## Reportar Vulnerabilidad

Si encuentras una vulnerabilidad de seguridad:

1. **NO abrir un issue público**
2. Contactar directamente al equipo de desarrollo
3. Incluir:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial

## Prácticas de Seguridad

- **Row Level Security (RLS)**: Habilitado en todas las tablas de Supabase
- **Autenticación**: JWT tokens gestionados por Supabase Auth
- **Variables de entorno**: Nunca commitear `.env.local`
- **Sanitización**: Inputs sanitizados antes de insertar en DB
```

---

##### 5. `CHANGELOG.md` — Registro de Cambios

```markdown
# Changelog

## [Sin Versión] - 2026-01-22

### Consolidación Técnica
- Documentación de arquitectura
- Guía de contribución
- Limpieza de código muerto
- Aseguramiento de estabilidad

## [0.1.0] - 2026-01-XX

### Funcionalidades Iniciales
- Dashboard de proyectos
- Flujo universal de 16 módulos técnicos
- Autenticación con Supabase
- Generación de informe final
```

---

### 1.3 Comentarios en Código

#### **Estado Actual**

- `ProjectSidebar.tsx`: ✅ Comentarios de clasificación por bloques (agregado recientemente)
- Componentes de formularios: ⚠️ Comentarios básicos o inexistentes
- Páginas de módulos: ⚠️ Sin comentarios descriptivos

#### **Acciones Necesarias**

**Patrón de Comentarios en Componentes**:

```typescript
/**
 * MÓDULO: [Nombre del Módulo]
 * BLOQUE: [A-G] — [Nombre del Bloque]
 * 
 * Función técnica:
 * - [Descripción breve de qué hace este módulo]
 * - [Qué datos captura]
 * - [Qué cálculos realiza si aplica]
 * 
 * Tabla de base de datos: [nombre_tabla]
 * 
 * Aplicabilidad:
 * - ✅ Agua potable: [Siempre / Condicional / Raro]
 * - ✅ Aguas residuales: [Siempre / Condicional / Raro]
 * 
 * @param projectId - UUID del proyecto
 * @param initialData - Datos existentes del módulo (si existen)
 */
export default function ModuleForm({ projectId, initialData }: Props) {
    // ...
}
```

**Ejemplo Aplicado**:

```typescript
/**
 * MÓDULO: Población y Censo
 * BLOQUE: B — Caracterización de Demanda
 * 
 * Función técnica:
 * - Proyección demográfica mediante método geométrico o aritmético
 * - Cálculo de población de diseño (horizonte 20-25 años)
 * - Base para dimensionamiento de caudales
 * 
 * Tabla de base de datos: project_calculations
 * 
 * Aplicabilidad:
 * - ✅ Agua potable: Siempre (esencial para dimensionar sistema)
 * - ✅ Aguas residuales: Siempre (esencial para dimensionar planta)
 * 
 * @param projectId - UUID del proyecto
 * @param initialData - Datos existentes de cálculos poblacionales
 */
export default function PopulationForm({ projectId, initialData }: Props) {
    // ...
}
```

---

## PARTE 2: LIMPIEZA TÉCNICA SEGURA

### 2.1 Código Muerto Identificado

#### **Archivos No Utilizados**

##### 1. Captura de pantalla en raíz del proyecto

**Archivo**: `/Captura de pantalla 2026-01-14 a la(s) 10.25.45 p.m. 1.png` (3.2 MB)

**Estado**: ❌ NO usado en el proyecto (verificado con grep)

**Acción**: **ELIMINAR**

```bash
# Eliminar archivo de screenshot
rm "Captura de pantalla 2026-01-14 a la(s) 10.25.45 p.m. 1.png"

# Commit
git add .
git commit -m "chore: remove unused screenshot from project root"
```

**Riesgo**: Cero (archivo no referenciado)

---

##### 2. SVGs default de Next.js sin uso

**Archivos en `/public/`**:
- `file.svg`
- `globe.svg`
- `next.svg`
- `vercel.svg`
- `window.svg`

**Estado**: ⚠️ Archivos default de Next.js, posiblemente no usados

**Verificación necesaria**:

```bash
# Buscar referencias en el código
grep -r "file.svg" src/
grep -r "globe.svg" src/
grep -r "next.svg" src/
grep -r "vercel.svg" src/
grep -r "window.svg" src/
```

**Acción**:
- Si NO están referenciados → **ELIMINAR**
- Si están referenciados → **CONSERVAR**

**Riesgo**: Bajo (archivos estáticos)

---

#### **Imports No Utilizados**

**Verificación automática**:

```bash
# Ejecutar linter
npm run lint

# Revisar warnings de imports no usados
```

**Acción**: Eliminar imports no usados identificados por el linter

**Riesgo**: Cero (detectado por TypeScript)

---

### 2.2 Renombrados Semánticos

#### **Candidatos a Renombrado**

##### 1. Variable `role` en registro

**Archivo**: `/src/app/register/page.tsx`

**Actual**:
```typescript
const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Comunidad'  // ← Semánticamente es "user_type", no "role"
});
```

**Propuesto**:
```typescript
const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'Comunidad'  // ← Más claro
});
```

**Justificación**: 
- "Role" implica permisos (admin, user, guest)
- "User type" implica categoría de usuario (comunidad, profesional, empresa)

**Riesgo**: Bajo (cambio local, no afecta DB)

**Acción**: 
1. Renombrar variable
2. Actualizar referencias en el archivo
3. Testing manual del registro

---

##### 2. Constante `userTypes` en registro

**Mismo archivo**: `/src/app/register/page.tsx`

**Actual**:
```typescript
const userTypes = [
    'Comunidad',
    'Acueducto rural',
    // ...
];
```

**Propuesto**: **NO CAMBIAR** (es correcto)

**Justificación**: El nombre ya es semánticamente correcto

---

### 2.3 Eliminación de Código Comentado

**Verificación**:

```bash
# Buscar bloques de código comentado
grep -r "// TODO" src/
grep -r "// FIXME" src/
grep -r "/\*.*\*/" src/ --include="*.tsx" --include="*.ts"
```

**Resultado del análisis**: 
- ✅ NO hay TODOs ni FIXMEs pendientes
- ✅ NO hay bloques grandes de código comentado

**Acción**: **NINGUNA** (código limpio)

---

### 2.4 Consolidación de Constantes

#### **Estado Actual**

Constantes como `projectTypes` están **duplicadas** en múltiples archivos:

1. `/src/app/dashboard/new/page.tsx` (línea 23-30)
2. `/src/components/projects/GeneralInfoForm.tsx` (línea 36-43)

**Propuesta**: Centralizar en archivo de constantes

**Archivo nuevo**: `/src/constants/projectTypes.ts`

```typescript
/**
 * Tipos de proyecto disponibles en HydroStack
 * 
 * IMPORTANTE: Este array se usa en:
 * - Creación de proyecto (/dashboard/new)
 * - Edición de info general (/components/projects/GeneralInfoForm)
 * 
 * Al agregar un nuevo tipo, actualizar en UN SOLO LUGAR.
 */
export const PROJECT_TYPES = [
    'Agua potable rural',
    'Agua potable urbano',
    'Potabilización privada',
    'Desalinización',
    'Tratamiento aguas residuales',
    'Tratamiento industrial'
] as const;

export type ProjectType = typeof PROJECT_TYPES[number];
```

**Uso**:

```typescript
// En /src/app/dashboard/new/page.tsx
import { PROJECT_TYPES } from '@/constants/projectTypes';

// ...
{PROJECT_TYPES.map((type) => (
    <option key={type} value={type}>{type}</option>
))}
```

**Riesgo**: Bajo (refactorización simple)

**Beneficio**: Evita inconsistencias al agregar nuevos tipos

---

### 2.5 Corrección de Typos

**Verificación**:

```bash
# Buscar errores ortográficos comunes en español
grep -ri "tratamineto" src/
grep -ri "proyetco" src/
grep -ri "usaurio" src/
```

**Resultado**: ✅ NO se encontraron typos evidentes

**Acción**: **NINGUNA**

---

## PARTE 3: ASEGURAMIENTO DE ESTABILIDAD

### 3.1 Mapa de Estabilidad del Sistema

#### **ZONA ROJA — Crítica (NO TOCAR sin aprobación)**

Cambios aquí pueden romper el sistema completo.

| Archivo/Directorio | Criticidad | Razón | Riesgo |
|--------------------|-----------|-------|--------|
| `/src/app/dashboard/projects/[id]/layout.tsx` | 🔴 CRÍTICO | Layout del proyecto, renderiza sidebar y summary | ALTO |
| `/src/components/ProjectSidebar.tsx` | 🔴 CRÍTICO | Navegación principal, define rutas de módulos | ALTO |
| `/src/context/AuthContext.tsx` | 🔴 CRÍTICO | Gestión de autenticación, sesiones | ALTO |
| `/src/utils/supabase/middleware.ts` | 🔴 CRÍTICO | Middleware de autenticación para todo el sistema | ALTO |
| `/middleware.ts` | 🔴 CRÍTICO | Middleware raíz de Next.js | ALTO |
| `/src/app/layout.tsx` | 🔴 CRÍTICO | Layout raíz de la aplicación | ALTO |

**Regla**: Cualquier cambio en estos archivos requiere:
1. Revisión de arquitecto senior
2. Testing exhaustivo
3. Plan de rollback

---

#### **ZONA AMARILLA — Sensible (Testing cuidadoso)**

Cambios requieren testing exhaustivo pero NO rompen el sistema completo.

| Archivo/Directorio | Criticidad | Razón | Riesgo |
|--------------------|-----------|-------|--------|
| `/src/components/projects/*.tsx` | 🟡 SENSIBLE | Formularios de módulos, lógica de cálculo | MEDIO |
| `/src/app/dashboard/projects/[id]/*/page.tsx` | 🟡 SENSIBLE | Páginas de módulos, fetching de datos | MEDIO |
| `/src/components/projects/ProjectReport.tsx` | 🟡 SENSIBLE | Informe final, consolidación de datos | MEDIO |
| `/src/components/projects/ProjectSummary.tsx` | 🟡 SENSIBLE | Panel lateral de resumen | MEDIO |

**Regla**: Testing manual completo del módulo afectado antes de PR.

---

#### **ZONA VERDE — Segura (Testing estándar)**

Cambios aquí tienen bajo impacto.

| Archivo/Directorio | Criticidad | Razón | Riesgo |
|--------------------|-----------|-------|--------|
| `/src/components/ui/*.tsx` | 🟢 BAJO | Componentes UI genéricos (Button, Input) | BAJO |
| `/src/components/Navbar.tsx` | 🟢 BAJO | Navbar (solo UI) | BAJO |
| `/src/components/Footer.tsx` | 🟢 BAJO | Footer (solo UI) | BAJO |
| `/src/app/globals.css` | 🟢 BAJO | Estilos CSS globales | BAJO |
| `/docs/*` | 🟢 BAJO | Documentación | BAJO |
| `/public/*` | 🟢 BAJO | Archivos estáticos | BAJO |

**Regla**: Testing visual básico suficiente.

---

### 3.2 Puntos Críticos de Crecimiento

#### **1. Separación de Agua Potable vs Aguas Residuales**

**Estado Actual**: Mezclado en `project_type`

**Riesgo Futuro**: Al crecer, se necesitará separar dominios

**Recomendación**: 
- Ya documentado en `/docs/PASO-4-ONBOARDING-PERFILES.md`
- **NO implementar ahora**, solo documentar el plan

**Límite Arquitectónico**:
```typescript
// PROHIBIDO: Crear flujos separados por dominio
// ❌ /dashboard/projects/[id]/water-treatment/...
// ❌ /dashboard/projects/[id]/wastewater-treatment/...

// PERMITIDO: Separar dominio de contexto
// ✅ project.domain = 'water_treatment' | 'wastewater_treatment'
// ✅ project.context = 'rural' | 'urban' | ...
```

---

#### **2. Módulos Condicionales**

**Estado Actual**: Todos los módulos visibles para todos los proyectos

**Riesgo Futuro**: Módulos específicos de un dominio (ej: "Tanque Séptico" solo aguas residuales)

**Recomendación**: 
- Si se agregan módulos condicionales, hacerlo mediante lógica en `ProjectSidebar`
- **NO crear rutas paralelas**

**Límite Arquitectónico**:
```typescript
// PERMITIDO: Condicional en sidebar
const navItems = [
    // Módulos universales
    { label: '1. Info General', href: '...' },
    
    // Módulo condicional
    ...(project.domain === 'wastewater' ? [
        { label: '17. Tanque Séptico', href: '...' }
    ] : []),
];
```

---

#### **3. Escalabilidad de Base de Datos**

**Estado Actual**: 15 tablas secundarias (1:1 con `projects`)

**Riesgo Futuro**: Consultas lentas al generar informe (JOIN de 15 tablas)

**Recomendación**:
- **Ahora**: Agregar índices en `project_id` de todas las tablas secundarias
- **Futuro (si lento)**: Materializar vista con datos consolidados

**Límite Arquitectónico**:
```sql
-- OBLIGATORIO: Índice en project_id
CREATE INDEX idx_table_project_id ON table_name(project_id);

-- PROHIBIDO: Agregar columnas a tabla projects que deberían estar en tabla secundaria
-- ❌ ALTER TABLE projects ADD COLUMN population INT;

-- PERMITIDO: Normalización correcta
-- ✅ CREATE TABLE project_calculations (project_id UUID, population INT, ...);
```

---

### 3.3 Áreas que NO Deben Tocarse (Inmutables)

#### **1. El Flujo de 16 Módulos**

**Estado**: Funcional y universal

**Prohibición**:
- ❌ Cambiar el orden de los módulos
- ❌ Renombrar rutas (rompe links existentes)
- ❌ Eliminar módulos
- ❌ Hacer módulos obligatorios vs opcionales

**Permitido**:
- ✅ Agregar nuevos módulos al final (17, 18, etc.)
- ✅ Mejorar formularios internos sin cambiar rutas

---

#### **2. El Principio de Flujo Único**

**Estado**: Arquitectura fundamental

**Prohibición**:
- ❌ Crear flujos paralelos por tipo de proyecto
- ❌ Duplicar módulos con leves variaciones
- ❌ Rutas condicionales según contexto

**Permitido**:
- ✅ Valores predeterminados según contexto
- ✅ Validaciones contextuales (advertencias)
- ✅ Ayuda contextual diferenciada

---

#### **3. Supabase como Backend**

**Estado**: Integración completa

**Prohibición**:
- ❌ Cambiar de proveedor de base de datos
- ❌ Migrar a backend custom (Express, NestJS, etc.)
- ❌ Implementar autenticación custom

**Permitido**:
- ✅ Agregar tablas nuevas
- ✅ Modificar políticas RLS
- ✅ Agregar columnas a tablas existentes (con migración)

---

### 3.4 Buenas Prácticas Obligatorias

#### **1. Antes de Modificar Código**

```bash
# Siempre trabajar en rama
git checkout -b feat/descripcion-breve

# NUNCA commitear directamente a main
```

#### **2. Migraciones de Base de Datos**

```sql
-- SIEMPRE incluir comentarios
COMMENT ON TABLE table_name IS 'Descripción de la tabla';
COMMENT ON COLUMN table.column IS 'Descripción de la columna';

-- SIEMPRE usar transacciones
BEGIN;
    ALTER TABLE ...;
    UPDATE ...;
COMMIT;

-- SIEMPRE probar en staging primero
```

#### **3. Cambios en Formularios**

```typescript
// SIEMPRE mantener el patrón existente
const [formData, setFormData] = useState(initialData || {});
const [loading, setLoading] = useState(false);

// SIEMPRE manejar errores
try {
    // operación
} catch (err: any) {
    setError(err.message || 'Error genérico');
}

// SIEMPRE dar feedback al usuario
setMessage('Operación exitosa');
```

#### **4. Testing Manual**

```
Checklist obligatorio antes de PR:

□ Funciona en Chrome
□ Funciona en Firefox
□ Funciona en Safari
□ No hay errores en consola
□ Build exitoso (npm run build)
□ Linter pasó (npm run lint)
□ Datos se guardan correctamente en Supabase
□ Navegación entre módulos funciona
□ Logout y login funcionan
```

---

## PARTE 4: PLAN DE ACTUALIZACIÓN DE GITHUB

### 4.1 Convención de Commits

**Formato Estandarizado** (Conventional Commits):

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]

[notas al pie opcionales]
```

#### **Tipos**

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `feat(report): add summary section` |
| `fix` | Corrección de bug | `fix(population): correct projection formula` |
| `docs` | Solo documentación | `docs(architecture): add ARCHITECTURE.md` |
| `style` | Formato (no afecta lógica) | `style(button): adjust padding` |
| `refactor` | Refactorización | `refactor(constants): centralize projectTypes` |
| `perf` | Mejora de performance | `perf(report): optimize data fetching` |
| `test` | Tests | `test(auth): add login flow test` |
| `chore` | Mantenimiento | `chore: remove unused screenshot` |

#### **Ámbitos Comunes**

- `auth`: Autenticación
- `dashboard`: Dashboard general
- `project`: Proyectos (entidad)
- `population`, `source`, `quality`, etc.: Módulos específicos
- `ui`: Componentes UI
- `db`: Base de datos
- `docs`: Documentación

---

### 4.2 Plan de Commits para Consolidación

#### **Fase 1: Limpieza (Commits Atómicos)**

```bash
# Commit 1: Eliminar archivo no usado
rm "Captura de pantalla 2026-01-14 a la(s) 10.25.45 p.m. 1.png"
git add .
git commit -m "chore: remove unused screenshot from project root"

# Commit 2: Verificar y eliminar SVGs no usados (si aplica)
# Primero verificar con grep, luego:
rm public/file.svg public/globe.svg public/window.svg
git add public/
git commit -m "chore(assets): remove unused default Next.js SVG files"

# Commit 3: Centralizar constantes
# Crear /src/constants/projectTypes.ts
# Actualizar imports en archivos que lo usan
git add src/constants/ src/app/dashboard/new/ src/components/projects/GeneralInfoForm.tsx
git commit -m "refactor(constants): centralize PROJECT_TYPES to avoid duplication"

# Commit 4: Renombrado semántico (si se decide hacer)
# Renombrar 'role' a 'user_type' en registro
git add src/app/register/page.tsx
git commit -m "refactor(register): rename 'role' to 'user_type' for semantic clarity"
```

---

#### **Fase 2: Documentación (Commits Temáticos)**

```bash
# Commit 5: Documentación de arquitectura
# Crear ARCHITECTURE.md
git add ARCHITECTURE.md
git commit -m "docs(architecture): add comprehensive system architecture documentation"

# Commit 6: Guía de contribución
# Crear CONTRIBUTING.md
git add CONTRIBUTING.md
git commit -m "docs(contributing): add contribution guidelines and code conventions"

# Commit 7: Política de seguridad
# Crear SECURITY.md
git add SECURITY.md
git commit -m "docs(security): add security policy and reporting guidelines"

# Commit 8: Actualizar README
# Agregar sección de documentación técnica
git add README.md
git commit -m "docs(readme): add technical documentation section with links"

# Commit 9: Changelog
# Crear CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs(changelog): initialize changelog for version tracking"
```

---

#### **Fase 3: Comentarios en Código**

```bash
# Commit 10: Comentarios en formularios críticos
# Agregar headers de documentación a:
# - PopulationForm.tsx
# - CaudalesForm.tsx
# - ProjectReport.tsx
git add src/components/projects/PopulationForm.tsx
git add src/components/projects/CaudalesForm.tsx  
git add src/components/projects/ProjectReport.tsx
git commit -m "docs(forms): add comprehensive module documentation headers"

# Commit 11: Comentarios en componentes UI
git add src/components/ui/
git commit -m "docs(ui): add JSDoc comments to UI components"

# Commit 12: Comentarios en utilidades
git add src/utils/
git commit -m "docs(utils): document Supabase client utilities"
```

---

#### **Fase 4: Consolidación Final**

```bash
# Commit 13: Plan de consolidación
# Agregar este documento
git add docs/CONSOLIDACION-TECNICA.md
git commit -m "docs(consolidation): add technical consolidation plan"

# Commit 14: Actualizar .gitignore si necesario
git add .gitignore
git commit -m "chore(gitignore): add docs build artifacts if applicable"
```

---

### 4.3 Estrategia de Pull Request

#### **Opción A: PR Grande (Recomendada para Consolidación)**

**Ventaja**: Un solo PR, fácil de revisar como conjunto  
**Desventaja**: PR grande

```bash
# Crear rama de consolidación
git checkout -b consolidation/technical-cleanup

# Hacer todos los commits de Fases 1-4
# ...

# Push
git push origin consolidation/technical-cleanup

# Crear PR con título:
"Consolidación Técnica: Documentación, Limpieza y Aseguramiento"
```

**Descripción del PR**:

```markdown
## Resumen

Consolidación técnica de HydroStack sin cambios funcionales.

## Cambios Incluidos

### Documentación
- ✅ ARCHITECTURE.md — Arquitectura del sistema
- ✅ CONTRIBUTING.md — Guía de contribución
- ✅ SECURITY.md — Política de seguridad
- ✅ CHANGELOG.md — Registro de cambios
- ✅ README.md actualizado

### Limpieza
- ✅ Eliminación de screenshot no usado
- ✅ Eliminación de SVGs default de Next.js sin uso
- ✅ Centralización de constantes (PROJECT_TYPES)
- ✅ Renombrado semántico: `role` → `user_type`

### Comentarios en Código
- ✅ Headers de documentación en formularios
- ✅ JSDoc en componentes UI
- ✅ Comentarios de arquitectura en utilidades

### Aseguramiento
-✅ Mapa de estabilidad del sistema
- ✅ Identificación de áreas críticas
- ✅ Buenas prácticas documentadas

## Testing

- ✅ Build exitoso: `npm run build`
- ✅ Linter exitoso: `npm run lint`
- ✅ Testing manual en Chrome, Firefox, Safari
- ✅ No hay cambios funcionales (solo documentación y limpieza)

## Impacto

- **Funcionalidad**: Sin cambios
- **Performance**: Sin cambios
- **Seguridad**: Sin cambios
- **Documentación**: Mejora significativa

## Checklist

- [x] Código revisado
- [x] Documentación actualizada
- [x] Testing realizado
- [x] Build exitoso
- [x] Linter exitoso
- [x] Sin cambios funcionales
```

---

#### **Opción B: PRs Separados (Si se prefiere granularidad)**

```bash
# PR 1: Limpieza
git checkout -b cleanup/unused-files
# Commits 1-4
# Título: "chore: cleanup unused files and centralize constants"

# PR 2: Documentación
git checkout -b docs/architecture
# Commits 5-9
# Título: "docs: add comprehensive technical documentation"

# PR 3: Comentarios
git checkout -b docs/code-comments
# Commits 10-12
# Título: "docs: add code documentation headers and JSDoc comments"

# PR 4: Plan de Consolidación
git checkout -b docs/consolidation-plan
# Commit 13
# Título: "docs: add technical consolidation plan"
```

---

### 4.4 Orden Recomendado de Ejecución

#### **Semana 1: Preparación**

**Día 1-2: Análisis**
- Revisar este documento completo
- Validar que no hay cambios funcionales pendientes
- Confirmar que el sistema está estable

**Día 3: Limpieza**
- Ejecutar Fase 1 (commits 1-4)
- Testing después de cada commit

**Día 4-5: Documentación**
- Crear ARCHITECTURE.md
- Crear CONTRIBUTING.md
- Crear SECURITY.md
- Actualizar README.md
- Crear CHANGELOG.md

---

#### **Semana 2: Comentarios y Finalización**

**Día 6-8: Comentarios en Código**
- Agregar headers a formularios (10-15 archivos)
- Agregar JSDoc a componentes UI
- Documentar utilidades

**Día 9: Testing**
- Build completo
- Linter
- Testing manual exhaustivo

**Día 10: PR y Merge**
- Crear Pull Request
- Revisión de código
- Merge a main

---

### 4.5 Checklist de Validación Pre-Merge

```
□ Documentación

  □ ARCHITECTURE.md creado y completo
  □ CONTRIBUTING.md creado y completo
  □ SECURITY.md creado
  □ CHANGELOG.md creado
  □ README.md actualizado con links

□ Limpieza

  □ Screenshot eliminado
  □ SVGs no usados eliminados (si aplica)
  □ PROJECT_TYPES centralizado
  □ Renombrados semánticos aplicados (si se decide)

□ Comentarios

  □ Formularios documentados (headers)
  □ Componentes UI con JSDoc
  □ Utilidades documentadas

□ Testing

  □ npm run build → Exitoso
  □ npm run lint → Sin errores
  □ Testing manual en 3 navegadores
  □ Login/Logout funciona
  □ Crear proyecto funciona
  □ Navegación entre módulos funciona
  □ Guardar datos funciona
  □ Generar informe funciona

□ GitHub

  □ Commits siguen convención
  □ PR con descripción detallada
  □ Sin conflictos con main
  □ Revisión de código aprobada
```

---

## RESUMEN EJECUTIVO

### Objetivos Cumplidos

1. ✅ **Documentación Técnica Real**
   - ARCHITECTURE.md (arquitectura general)
   - CONTRIBUTING.md (guía de contribución)
   - SECURITY.md (política de seguridad)
   - Actualización de README.md

2. ✅ **Limpieza Técnica Segura**
   - Eliminación de screenshot no usado
   - Eliminación de SVGs default sin uso
   - Centralización de constantes
   - Renombrado semántico opcional (`role` → `user_type`)

3. ✅ **Aseguramiento de Estabilidad**
   - Mapa de estabilidad (Zonas Roja/Amarilla/Verde)
   - Puntos críticos de crecimiento identificados
   - Áreas inmutables documentadas
   - Buenas prácticas obligatorias definidas

4. ✅ **Plan de Actualización de GitHub**
   - Convención de commits definida
   - 14 commits atómicos planificados
   - Estrategia de PR clara
   - Checklist de validación completo

---

### Impacto de la Consolidación

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Documentación** | README básico | Arquitectura completa documentada | +++++ |
| **Claridad** | Código sin comentarios | Headers y JSDoc en componentes clave | ++++ |
| **Mantenibilidad** | Constantes duplicadas | Constantes centralizadas | +++ |
| **Código limpio** | Screenshot + SVGs no usados | Solo archivos necesarios | ++ |
| **Estabilidad** | Sin mapa de riesgos | Áreas críticas identificadas | +++++ |

---

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Romper algo al limpiar archivos | Muy baja | Medio | Verificar con grep antes de eliminar |
| Renombrado semántico rompe algo | Baja | Bajo | Testing exhaustivo post-cambio |
| PR rechazado por ser muy grande | Media | Bajo | Opción B: dividir en múltiples PRs |
| Olvidar actualizar algo | Baja | Bajo | Checklist de validación completo |

---

### Próximos Pasos (Inmediatos)

1. **Revisar este documento** con equipo técnico
2. **Validar que el sistema está estable** (no hay bugs pendientes)
3. **Crear rama `consolidation/technical-cleanup`**
4. **Ejecutar Fase 1** (limpieza)
5. **Ejecutar Fase 2** (documentación)
6. **Ejecutar Fase 3** (comentarios)
7. **Testing exhaustivo**
8. **Crear Pull Request**
9. **Merge a main**
10. **Celebrar** 🎉 (sistema consolidado y documentado)

---

**Fin del Plan de Consolidación Técnica**

**Prioridades**: Estabilidad → Claridad → Escalabilidad futura
