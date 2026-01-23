# Arquitectura de HydroStack

## Visión General
HydroStack es una plataforma web para diseño técnico de proyectos de tratamiento de agua.

## Stack Tecnológico
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript 5
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Vanilla CSS con variables CSS

## Principios Arquitectónicos

### 1. Flujo Único Universal
- TODOS los proyectos (agua potable, aguas residuales, cualquier contexto) usan el MISMO flujo.
- NO hay flujos paralelos ni rutas duplicadas.
- Los 16 módulos técnicos son universales.

### 2. Separación de Conceptos
- **Perfil de Usuario**: Preferencias generales (futuro).
- **Dominio**: Tipo de sistema (agua potable vs aguas residuales).
- **Contexto**: Escala del proyecto (rural, urbano, etc.).
- **Flujo Técnico**: Secuencia de 16 módulos (único y compartido).

### 3. Context over Configuration
- El `project_type` es CONTEXTO, no configuración.
- NO altera el flujo, solo ajusta parámetros predeterminados.
- El ingeniero tiene libertad total para usar todos los módulos.

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
│   │   ├── projects/             # Formularios de módulos
│   │   ├── ui/                   # Componentes UI básicos
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectSidebar.tsx
│   │   └── Providers.tsx
│   ├── context/                  # Contextos React (AuthContext)
│   ├── constants/                # Constantes compartidas
│   ├── types/                    # Definiciones TypeScript
│   └── utils/                    # Utilidades (Supabase, etc.)
├── public/                       # Archivos estáticos
├── docs/                         # Documentación técnica
└── README.md
```

## Base de Datos (Supabase - PostgreSQL)

### Tabla Principal
- `projects`: Entidad principal del proyecto.

### Tablas Secundarias (1:1 con projects)
- `project_calculations`: Cálculos de población y caudales.
- `project_sources`: Caracterización de fuente.
- `project_water_quality`: Parámetros de calidad.
- `project_conduccion`: Diseño hidráulico.
- `project_treatment`: Dimensionamiento de tratamiento.
- ... y otras tablas específicas por módulo.

## Flujo de la Aplicación

1. Usuario se autentica (Supabase Auth).
2. Accede al dashboard (`/dashboard`).
3. Crea un proyecto (`/dashboard/new`) usando el Diagrama de Decisión.
4. Navega por los 16 módulos técnicos (`/dashboard/projects/[id]/...`).
5. Genera informe final (`/dashboard/projects/[id]/report`).

## Límites Arquitectónicos (NO MODIFICAR)

### ❌ Prohibido
1. **NO crear flujos paralelos**: Un solo flujo sirve para todos los tipos.
2. **NO duplicar módulos**: Los 16 módulos son únicos y compartidos.
3. **NO condicionar rutas por tipo**: Rutas universales para todos.
4. **NO ocultar módulos según contexto**: Todos siempre visibles (pueden tener advertencias).
5. **NO mezclar dominios en una entidad**: Separar agua potable de aguas residuales mediante el campo `project_domain`.

### ✅ Permitido
1. **Agregar campos a tablas existentes** (con migración segura).
2. **Agregar nuevos módulos** (si son universales).
3. **Valores predeterminados según contexto** (sugerencias, NO restricciones).

## Seguridad
- **Row Level Security (RLS)**: Habilitado en todas las tablas.
- **Autenticación**: Supabase Auth con JWT.
- **Políticas**: El usuario solo accede a sus propios proyectos.
