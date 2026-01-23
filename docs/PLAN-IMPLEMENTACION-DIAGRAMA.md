# PLAN DE IMPLEMENTACIÓN — Diagrama de Decisión Funcional

**Estado Actual**: Archivos TypeScript base creados ✅  
**Próximos Pasos**: Migración de base de datos y wizard de creación

---

## ARCHIVOS CREADOS

### ✅ Fase 1 Completada

1. **`/src/types/project.ts`** — Types TypeScript
   - Tipos: `ProjectDomain`, `ProjectContext`, `ProjectLevel`, `TreatmentCategory`
   - Interface: `Project`, `ProjectModuleStatus`, `ModuleConfig`
   - Constants: Labels y descripciones

2. **`/src/lib/recommendation-engine.ts`** — Motor de Recomendaciones
   - `getModuleRecommendation()` — Calcula recomendación según contexto
   - `getModuleConfig()` — Obtiene advertencias y ayudas contextuales
   - `initializeModuleStatuses()` — Inicializa estados de módulos
   - `getRecommendationBadge()` — Badge visual
   - `getTreatmentCategoryDescription()` — Descripciones de categorías

---

## PASOS SIGUIENTES (EN ORDEN)

### 🔴 PASO 1: Migración de Base de Datos (CRÍTICO)

**Acción**: Ejecutar migración SQL en Supabase

**Archivo SQL**: Copiar de `/docs/DIAGRAMA-DECISION-FUNCIONAL.md` (líneas 28-108)

**Comandos**:

```sql
-- 1. Agregar columnas a tabla projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_domain VARCHAR(50) DEFAULT 'water_treatment';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_context VARCHAR(50) DEFAULT 'rural';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_level VARCHAR(50) DEFAULT 'complete_design';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS treatment_category VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS decision_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(project_domain);
CREATE INDEX IF NOT EXISTS idx_projects_context ON projects(project_context);
CREATE INDEX IF NOT EXISTS idx_projects_level ON projects(project_level);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(treatment_category);

-- 3. Agregar constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_domain;
ALTER TABLE projects ADD CONSTRAINT chk_project_domain 
    CHECK (project_domain IN ('water_treatment', 'wastewater_treatment'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_context;
ALTER TABLE projects ADD CONSTRAINT chk_project_context 
    CHECK (project_context IN ('rural', 'urban', 'residential', 'industrial', 'desalination'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_project_level;
ALTER TABLE projects ADD CONSTRAINT chk_project_level 
    CHECK (project_level IN ('preliminary_assessment', 'complete_design'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_treatment_category;
ALTER TABLE projects ADD CONSTRAINT chk_treatment_category 
    CHECK (treatment_category IN ('fime', 'compact_plant', 'specific_plant', 'desalination_high_purity') 
           OR treatment_category IS NULL);

-- 4. Comentarios de documentación
COMMENT ON COLUMN projects.project_domain IS 
'Dominio del sistema: water_treatment (agua potable) o wastewater_treatment (aguas residuales). Define marco normativo y terminología.';

COMMENT ON COLUMN projects.project_context IS 
'Contexto del proyecto: rural, urban, residential, industrial, desalination. Ajusta valores predeterminados y recomendaciones.';

COMMENT ON COLUMN projects.project_level IS 
'Nivel del proyecto: preliminary_assessment (evaluación preliminar) o complete_design (diseño técnico completo). Influye en módulos recomendados.';

COMMENT ON COLUMN projects.treatment_category IS 
'Categoría de tratamiento: fime, compact_plant, specific_plant, desalination_high_purity. Determina tecnologías sugeridas.';
```

**Validación**:
```sql
-- Verificar que las columnas se agregaron
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('project_domain', 'project_context', 'project_level', 'treatment_category', 'decision_metadata');
```

---

### 🔴 PASO 2: Crear Tabla `project_module_status`

**SQL**:

```sql
-- Tabla para rastrear estado de módulos
CREATE TABLE IF NOT EXISTS project_module_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    system_recommendation VARCHAR(50),
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    status_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, module_key)
);

-- Índices
CREATE INDEX idx_module_status_project ON project_module_status(project_id);
CREATE INDEX idx_module_status_key ON project_module_status(module_key);
CREATE INDEX idx_module_status_status ON project_module_status(status);

-- Row Level Security
ALTER TABLE project_module_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project module status" 
    ON project_module_status FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_module_status.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own project module status" 
    ON project_module_status FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_module_status.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Comentarios
COMMENT ON TABLE project_module_status IS 
'Estado y recomendaciones de módulos según contexto del proyecto.';

COMMENT ON COLUMN project_module_status.module_key IS 
'Identificador del módulo: general, population, source, quality, caudales, tank, conduccion, desarenador, jar_test, filtro_lento, compact_design, costs, viability, tech_selection';

COMMENT ON COLUMN project_module_status.system_recommendation IS 
'Recomendación automática: essential, recommended, optional, typically_not_applicable';
```

**Validación**:
```sql
-- Verificar que la tabla se creó
SELECT * FROM information_schema.tables WHERE table_name = 'project_module_status';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'project_module_status';
```

---

### 🟡 PASO 3: Migrar Datos Existentes (Opcional pero Recomendado)

**SQL**: Migrar campo `project_type` legacy a nuevos campos

```sql
-- Mapear project_type a project_domain + project_context
UPDATE projects
SET 
    project_domain = CASE
        WHEN project_type ILIKE '%residual%' OR project_type ILIKE '%industrial%' 
            OR project_type = 'Tratamiento aguas residuales'
            THEN 'wastewater_treatment'
        ELSE 'water_treatment'
    END,
    project_context = CASE
        WHEN project_type ILIKE '%rural%' THEN 'rural'
        WHEN project_type ILIKE '%urbano%' OR project_type ILIKE '%urban%' THEN 'urban'
        WHEN project_type ILIKE '%privada%' OR project_type ILIKE '%residencial%' THEN 'residential'
        WHEN project_type ILIKE '%industrial%' THEN 'industrial'
        WHEN project_type ILIKE '%desalin%' THEN 'desalination'
        ELSE 'rural' -- Default
    END,
    project_level = 'complete_design', -- Default para proyectos existentes
    treatment_category = NULL -- Se define manualmente después
WHERE project_domain IS NULL OR project_context IS NULL;
```

**Validación**:
```sql
-- Verificar migración
SELECT 
    project_type,
    project_domain,
    project_context,
    project_level
FROM projects
LIMIT 10;
```

---

### 🟢 PASO 4: Actualizar Página de Creación de Proyecto

**Archivo**: `/src/app/dashboard/new/page.tsx`

**Opción A**: Usar wizard de 5 pasos (recomendado)
- Ver código completo en `/docs/DIAGRAMA-DECISION-FUNCIONAL.md` (líneas 615-1190)
- Requiere crear componentes: `StepDomain`, `StepContext`, `StepLevel`, `StepTreatmentCategory`, `StepGeneralInfo`, `RadioCard`

**Opción B**: Versión simplificada (más rápida)
- Mantener formulario actual
- Agregar campos de diagrama de decisión como selects antes del nombre

**Recomendación inmediata**: Empezar con **Opción B** (simplificada) para validar que todo funciona, luego migrar a **Opción A** (wizard completo).

---

### 🟢 PASO 5: Actualizar ProjectSidebar con Badges

**Archivo**: `/src/components/ProjectSidebar.tsx`

**Cambios necesarios**:

1. Importar tipos:
```typescript
import { Project, ProjectModuleStatus, ModuleKey } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';
```

2. Fetch project y module statuses:
```typescript
const [project, setProject] = useState<Project | null>(null);
const [moduleStatuses, setModuleStatuses] = useState<Map<ModuleKey, ProjectModuleStatus>>(new Map());

useEffect(() => {
    // Fetch project
    const fetchProject = async () => {
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
        
        if (data) setProject(data as Project);
    };
    
    // Fetch module statuses
    const fetchModuleStatuses = async () => {
        const { data } = await supabase
            .from('project_module_status')
            .select('*')
            .eq('project_id', projectId);
        
        if (data) {
            const statusMap = new Map<ModuleKey, ProjectModuleStatus>();
            data.forEach((status: ProjectModuleStatus) => {
                statusMap.set(status.module_key, status);
            });
            setModuleStatuses(statusMap);
        }
    };
    
    fetchProject();
    fetchModuleStatuses();
}, [projectId, supabase]);
```

3. Renderizar badges en navItems:
```typescript
{navItems.map((item) => {
    const moduleStatus = moduleStatuses.get(item.moduleKey);
    const badge = moduleStatus ? 
        RecommendationEngine.getRecommendationBadge(moduleStatus.system_recommendation) :
        null;
    
    return (
        <Link key={item.href} href={item.href} ...>
            <span>{item.label}</span>
            {badge && (
                <span title={badge.label} style={{ fontSize: '0.7rem' }}>
                    {badge.icon}
                </span>
            )}
        </Link>
    );
})}
```

---

### 🟢 PASO 6: Componente de Advertencias Contextuales (Opcional)

**Archivo nuevo**: `/src/components/projects/ModuleWarning.tsx`

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, ModuleKey } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

export default function ModuleWarning({ 
    projectId, 
    moduleKey 
}: { 
    projectId: string; 
    moduleKey: ModuleKey;
}) {
    const [config, setConfig] = useState<any>(null);
    const supabase = createClient();
    
    useEffect(() => {
        const fetchProject = async () => {
            const { data } = await supabase
                .from('projects')
                .select('project_domain, project_context, project_level, treatment_category')
                .eq('id', projectId)
                .single();
            
            if (data) {
                const moduleConfig = RecommendationEngine.getModuleConfig(
                    moduleKey,
                    data.project_domain,
                    data.project_context,
                    data.project_level,
                    data.treatment_category
                );
                setConfig(moduleConfig);
            }
        };
        
        fetchProject();
    }, [projectId, moduleKey, supabase]);
    
    if (!config || !config.adaptations) return null;
    
    return (
        <>
            {config.adaptations.warning && (
                <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem'
                }}>
                    {config.adaptations.warning}
                </div>
            )}
            
            {config.adaptations.help_text && (
                <div style={{
                    backgroundColor: '#DBEAFE',
                    border: '1px solid #93C5FD',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem'
                }}>
                    💡 <strong>Recomendación:</strong> {config.adaptations.help_text}
                </div>
            )}
        </>
    );
}
```

**Uso en formularios**:
```typescript
import ModuleWarning from '@/components/projects/ModuleWarning';

export default function FiltroLentoForm({ projectId, initialData }: Props) {
    return (
        <div>
            {/* Advertencia contextual */}
            <ModuleWarning projectId={projectId} moduleKey="filtro_lento" />
            
            {/* Resto del formulario */}
            <form>...</form>
        </div>
    );
}
```

---

## TESTING

### ✅ Checklist de Validación

Después de implementar cada paso:

- [ ] **Build exitoso**: `npm run build`
- [ ] **Linter sin errores**: `npm run lint`
- [ ] **Migraciones aplicadas** en Supabase
- [ ] **Tabla `project_module_status` creada** correctamente
- [ ] **Crear nuevo proyecto funciona** con campos del diagrama
- [ ] **Proyectos existentes siguen funcionando** (valores DEFAULT)
- [ ] **Badges aparecen** en ProjectSidebar
- [ ] **Advertencias contextuales** se muestran según categoría

---

## ROLLBACK (Si algo falla)

### Revertir Migraciones de Base de Datos

```sql
-- Eliminar tabla project_module_status
DROP TABLE IF EXISTS project_module_status CASCADE;

-- Eliminar columnas agregadas a projects
ALTER TABLE projects 
    DROP COLUMN IF EXISTS project_domain,
    DROP COLUMN IF EXISTS project_context,
    DROP COLUMN IF EXISTS project_level,
    DROP COLUMN IF EXISTS treatment_category,
    DROP COLUMN IF EXISTS decision_metadata;
```

### Revertir Código

```bash
# Eliminar archivos creados
rm src/types/project.ts
rm src/lib/recommendation-engine.ts
rm src/components/projects/ModuleWarning.tsx

# Revertir cambios en archivos existentes
git checkout src/app/dashboard/new/page.tsx
git checkout src/components/ProjectSidebar.tsx
```

---

## CRONOGRAMA ESTIMADO

| Paso | Tiempo | Riesgo |
|------|--------|--------|
| 1. Migración SQL (`projects`) | 30 min | Bajo |
| 2. Tabla `project_module_status` | 20 min | Bajo |
| 3. Migrar datos existentes | 10 min | Bajo |
| 4. Página de creación (simplificada) | 1-2 horas | Medio |
| 5. ProjectSidebar con badges | 1 hora | Medio |
| 6. Advertencias contextuales | 1-2 horas | Bajo |
| **Total** | **4-6 horas** | — |

---

## ESTADO ACTUAL

✅ **Completado**:
- Types TypeScript (`/src/types/project.ts`)
- Motor de recomendaciones (`/src/lib/recommendation-engine.ts`)
- Documentación técnica completa

⏳ **Pendiente**:
- Ejecutar migraciones SQL en Supabase
- Actualizar UI (wizard o formulario simplificado)
- Testing completo

---

**Próximo paso inmediato**: Ejecutar **PASO 1** (migración SQL) en Supabase.
