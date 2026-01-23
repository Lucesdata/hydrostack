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

- **Tipado estricto**: Todas las funciones y variables deben tener tipos explícitos.
- **No usar `any`**: Usar tipos específicos o `unknown` con type guards.
- **Interfaces sobre types**: Preferir `interface` para objetos de dominio.

### Nomenclatura

- **Variables y funciones**: `camelCase` (ej: `calculateFlowRate`).
- **Componentes React**: `PascalCase` (ej: `ProjectDashboard.tsx`).
- **Rutas de archivos**: `kebab-case` (ej: `/dashboard/projects/[id]/jar-test`).
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_POPULATION`).
- **Tablas de DB**: `snake_case` (ej: `project_calculations`).

### Estilos

- **NO usar TailwindCSS**: Solo Vanilla CSS.
- **Usar variables CSS**: `var(--color-primary)` en lugar de colores hardcodeados.
- **Estilos inline**: Evitarlos si son complejos; usar archivos CSS o variables.

---

## Estructura de Commits

Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):

`<tipo>(<ámbito>): <descripción>`

### Tipos
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de bug.
- `docs`: Solo documentación.
- `style`: Cambios de formato (no afectan lógica).
- `refactor`: Refactorización de código.
- `chore`: Tareas de mantenimiento.

---

## Proceso de Desarrollo

1. Crear rama desde `main`: `feat/nombre-funcionalidad`.
2. Realizar commits atómicos y descriptivos.
3. Verificar con `npm run lint` y `npm run build`.
4. Abrir Pull Request con descripción de cambios y evidencia técnica.

---

## Áreas del Sistema

### 🔒 CRÍTICAS (Requieren revisión exhaustiva)
- `/src/context/AuthContext.tsx`
- `/src/utils/supabase/`
- `/middleware.ts`
- `/src/app/dashboard/projects/[id]/layout.tsx`

### ⚠️ SENSIBLES (Requieren testing cuidadoso)
- Formularios de módulos (`/src/components/projects/`)
- Cálculos técnicos y motores de recomendación.
