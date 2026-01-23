# IMPLEMENTACIÓN FUNCIONAL — Diagrama de Decisión Contextual en HydroStack

**Fecha**: 23 de enero de 2026  
**Arquitecto**: Software Senior — Sistemas Técnicos Críticos  
**Proyecto**: HydroStack — Diagrama de Decisión Funcional  
**Prioridad**: CRÍTICA — Cambio arquitectónico mayor

---

## PRINCIPIO RECTOR (INVIOLABLE)

```
El contexto ORIENTA.
El flujo NO se fragmenta.
La ingeniería MANDA.
```

**Este documento implementa el diagrama de decisión como un sistema FUNCIONAL que razona sobre el proyecto sin bifurcar código.**

---

## PARTE 1: MODELO DE DATOS AMPLIADO

### 1.1 Tabla `projects` — Nueva Estructura

**Migración SQL**:

```sql
-- Migración: add_decision_diagram_fields
-- Fecha: 2026-01-23
-- Descripción: Agregar campos del diagrama de decisión funcional

BEGIN;

-- 1. DOMINIO DEL SISTEMA (ya existe como project_domain)
-- Verificar que existe, si no, agregar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'project_domain'
    ) THEN
        ALTER TABLE projects ADD COLUMN project_domain VARCHAR(50) DEFAULT 'water_treatment';
    END IF;
END $$;

-- 2. CONTEXTO DEL PROYECTO (ya existe como project_context)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'project_context'
    ) THEN
        ALTER TABLE projects ADD COLUMN project_context VARCHAR(50) DEFAULT 'rural';
    END IF;
END $$;

-- 3. NIVEL DEL PROYECTO (NUEVO)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_level VARCHAR(50) DEFAULT 'complete_design';

-- 4. CATEGORÍA DE TRATAMIENTO (NUEVO)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS treatment_category VARCHAR(50);

-- 5. METADATA DEL DIAGRAMA (NUEVO - JSON para flexibilidad futura)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS decision_metadata JSONB DEFAULT '{}'::jsonb;

-- Comentarios de documentación
COMMENT ON COLUMN projects.project_domain IS 
'Dominio del sistema: water_treatment (agua potable) o wastewater_treatment (aguas residuales). Define marco normativo y terminología.';

COMMENT ON COLUMN projects.project_context IS 
'Contexto del proyecto: rural, urban, residential, industrial, desalination. Ajusta valores predeterminados y recomendaciones.';

COMMENT ON COLUMN projects.project_level IS 
'Nivel del proyecto: preliminary_assessment (evaluación preliminar) o complete_design (diseño técnico completo). Influye en módulos recomendados.';

COMMENT ON COLUMN projects.treatment_category IS 
'Categoría de tratamiento: fime, compact_plant, specific_plant, desalination_high_purity. Determina tecnologías sugeridas.';

COMMENT ON COLUMN projects.decision_metadata IS 
'Metadata adicional del diagrama de decisión en formato JSON. Permite extensibilidad sin cambios de schema.';

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(project_domain);
CREATE INDEX IF NOT EXISTS idx_projects_context ON projects(project_context);
CREATE INDEX IF NOT EXISTS idx_projects_level ON projects(project_level);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(treatment_category);

-- Check constraints para validación
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

COMMIT;
```

---

### 1.2 Nueva Tabla: `project_module_status`

**Propósito**: Rastrear el estado de cada módulo según el contexto del proyecto

```sql
-- Tabla para rastrear estado de módulos
CREATE TABLE IF NOT EXISTS project_module_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,  -- 'population', 'source', 'quality', etc.
    
    -- Estado del módulo
    status VARCHAR(50) DEFAULT 'pending',
    -- Valores: 'pending', 'in_progress', 'completed', 'not_applicable', 'skipped'
    
    -- Razón de no aplicabilidad (si status = 'not_applicable')
    reason TEXT,
    
    -- Recomendación del sistema
    system_recommendation VARCHAR(50),
    -- Valores: 'essential', 'recommended', 'optional', 'typically_not_applicable'
    
    -- Metadata adicional
    notes TEXT,
    
    -- Auditoría
    marked_by UUID REFERENCES auth.users(id),
    status_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: Un solo status por módulo por proyecto
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
'Estado y recomendaciones de módulos según contexto del proyecto. Permite rastrear progreso y aplicabilidad sin fragmentar flujo.';

COMMENT ON COLUMN project_module_status.module_key IS 
'Identificador del módulo: general, population, source, quality, caudales, tank, conduccion, desarenador, jar_test, filtro_lento, compact_design, costs, viability, tech_selection';

COMMENT ON COLUMN project_module_status.system_recommendation IS 
'Recomendación automática basada en diagrama de decisión: essential (crítico), recommended (sugerido), optional (puede aplicar), typically_not_applicable (raro en este contexto)';
```

---

### 1.3 TypeScript Types Actualizados

**Archivo**: `/src/types/project.ts`

```typescript
/**
 * Dominio del sistema de agua
 */
export type ProjectDomain = 'water_treatment' | 'wastewater_treatment';

/**
 * Contexto del proyecto
 */
export type ProjectContext = 
    | 'rural' 
    | 'urban' 
    | 'residential' 
    | 'industrial' 
    | 'desalination';

/**
 * Nivel del proyecto
 */
export type ProjectLevel = 
    | 'preliminary_assessment'  // Evaluación preliminar
    | 'complete_design';        // Diseño técnico completo

/**
 * Categoría de tratamiento
 */
export type TreatmentCategory = 
    | 'fime'                    // FIME (Filtración en Múltiples Etapas)
    | 'compact_plant'           // Planta compacta
    | 'specific_plant'          // Planta específica (rápida vs lenta)
    | 'desalination_high_purity'; // Desalinización / Alta pureza

/**
 * Recomendación del sistema para un módulo
 */
export type SystemRecommendation = 
    | 'essential'                   // Crítico para este tipo de proyecto
    | 'recommended'                 // Sugerido
    | 'optional'                    // Puede aplicar según caso
    | 'typically_not_applicable';   // Raro en este contexto

/**
 * Estado de un módulo
 */
export type ModuleStatus = 
    | 'pending'          // Pendiente
    | 'in_progress'      // En progreso
    | 'completed'        // Completado
    | 'not_applicable'   // No aplica a este proyecto
    | 'skipped';         // Omitido intencionalmente

/**
 * Clave de módulo técnico
 */
export type ModuleKey = 
    | 'general'
    | 'population'
    | 'floating_population'
    | 'source'
    | 'consumption'
    | 'quality'
    | 'caudales'
    | 'tank'
    | 'conduccion'
    | 'desarenador'
    | 'jar_test'
    | 'filtro_lento'
    | 'compact_design'
    | 'costs'
    | 'viability'
    | 'tech_selection';

/**
 * Proyecto con campos del diagrama de decisión
 */
export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    location: string | null;
    
    // Diagrama de decisión
    project_domain: ProjectDomain;
    project_context: ProjectContext;
    project_level: ProjectLevel;
    treatment_category: TreatmentCategory | null;
    decision_metadata: Record<string, any>;
    
    // Estado y auditoría
    status: 'Borrador' | 'En diseño' | 'Completado' | 'Archivado';
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
}

/**
 * Estado de módulo
 */
export interface ProjectModuleStatus {
    id: string;
    project_id: string;
    module_key: ModuleKey;
    status: ModuleStatus;
    reason: string | null;
    system_recommendation: SystemRecommendation;
    notes: string | null;
    marked_by: string | null;
    status_updated_at: string;
    created_at: string;
}

/**
 * Configuración de módulo según contexto
 */
export interface ModuleConfig {
    module_key: ModuleKey;
    label: string;
    route: string;
    block: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    recommendation: SystemRecommendation;
    reason?: string;
    adaptations?: {
        placeholder?: string;
        help_text?: string;
        warning?: string;
    };
}
```

---

## PARTE 2: MOTOR DE RECOMENDACIONES

### 2.1 Engine de Lógica Contextual

**Archivo**: `/src/lib/recommendation-engine.ts`

```typescript
import { 
    ProjectDomain, 
    ProjectContext, 
    ProjectLevel, 
    TreatmentCategory, 
    ModuleKey, 
    SystemRecommendation,
    ModuleConfig 
} from '@/types/project';

/**
 * Motor de recomendaciones contextual de HydroStack
 * 
 * PRINCIPIO: Este motor ORIENTA, NO RESTRINGE
 * 
 * Función: Calcular recomendaciones de módulos según el contexto del proyecto
 * NO bloquea navegación ni oculta módulos
 */
export class RecommendationEngine {
    
    /**
     * Obtener recomendación de un módulo según contexto del proyecto
     */
    static getModuleRecommendation(
        moduleKey: ModuleKey,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): SystemRecommendation {
        
        // BLOQUE A — Contexto (siempre esencial)
        if (moduleKey === 'general') return 'essential';
        
        // BLOQUE B — Demanda
        if (moduleKey === 'population') {
            return domain === 'water_treatment' || domain === 'wastewater_treatment' 
                ? 'essential' 
                : 'essential';
        }
        
        if (moduleKey === 'floating_population') {
            if (context === 'residential' || context === 'desalination') return 'recommended';
            if (level === 'preliminary_assessment') return 'optional';
            return 'recommended';
        }
        
        if (moduleKey === 'consumption') return 'essential';
        
        // BLOQUE C — Fuente
        if (moduleKey === 'source') {
            return domain === 'water_treatment' ? 'essential' : 'typically_not_applicable';
        }
        
        if (moduleKey === 'quality') return 'essential';
        
        // BLOQUE D — Hidráulica
        if (moduleKey === 'caudales') return 'essential';
        if (moduleKey === 'tank') return 'recommended';
        if (moduleKey === 'conduccion') return 'recommended';
        
        // BLOQUE E — Tratamiento (depende de categoría)
        if (moduleKey === 'desarenador') {
            if (category === 'fime') return 'recommended';
            if (category === 'compact_plant') return 'recommended';
            if (category === 'desalination_high_purity') return 'typically_not_applicable';
            return 'optional';
        }
        
        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'specific_plant') return 'recommended';
            if (category === 'fime') return 'optional';
            if (category === 'desalination_high_purity') return 'typically_not_applicable';
            return 'recommended';
        }
        
        if (moduleKey === 'filtro_lento') {
            if (category === 'fime') return 'essential';
            if (category === 'compact_plant') return 'typically_not_applicable';
            if (category === 'specific_plant') return 'recommended';
            return 'recommended';
        }
        
        if (moduleKey === 'compact_design') {
            if (category === 'compact_plant') return 'essential';
            if (category === 'fime') return 'typically_not_applicable';
            return 'recommended';
        }
        
        // BLOQUE F — Evaluación (siempre importante)
        if (moduleKey === 'costs') return 'essential';
        if (moduleKey === 'viability') return 'essential';
        if (moduleKey === 'tech_selection') {
            return level === 'complete_design' ? 'essential' : 'recommended';
        }
        
        // Fallback
        return 'recommended';
    }
    
    /**
     * Obtener configuración adaptativa de un módulo
     */
    static getModuleConfig(
        moduleKey: ModuleKey,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): Pick<ModuleConfig, 'adaptations' | 'reason'> {
        
        const adaptations: ModuleConfig['adaptations'] = {};
        let reason: string | undefined;
        
        // Adaptaciones por módulo
        if (moduleKey === 'desarenador') {
            if (category === 'desalination_high_purity') {
                reason = 'En desalinización normalmente se usa prefiltración específica';
                adaptations.warning = '⚠️ Este módulo es poco común en desalinización. Verifica si aplica a tu caso.';
            }
            if (context === 'residential') {
                adaptations.help_text = 'En proyectos residenciales, el desarenador puede omitirse si la fuente tiene baja turbiedad';
            }
        }
        
        if (moduleKey === 'jar_test') {
            if (category === 'compact_plant') {
                adaptations.help_text = 'Esencial para definir dosis de coagulante en planta compacta';
            }
            if (category === 'desalination_high_purity') {
                reason = 'Desalinización no usa coagulación convencional';
                adaptations.warning = '⚠️ Este módulo típicamente NO aplica a desalinización';
            }
        }
        
        if (moduleKey === 'filtro_lento') {
            if (category === 'fime') {
                adaptations.help_text = 'Componente clave de FIME junto con filtros gruesos y dinámicos';
            }
            if (category === 'compact_plant') {
                reason = 'Plantas compactas usan filtración rápida, no filtros lentos';
                adaptations.warning = '⚠️ Plantas compactas normalmente NO usan filtros lentos';
            }
        }
        
        if (moduleKey === 'compact_design') {
            if (category === 'fime') {
                reason = 'FIME no es una planta compacta convencional';
                adaptations.warning = '⚠️ FIME y planta compacta son tecnologías diferentes';
            }
        }
        
        if (moduleKey === 'source') {
            if (domain === 'wastewater_treatment') {
                reason = 'Aguas residuales no tienen "fuente" en el sentido de agua cruda';
                adaptations.warning = '⚠️ En aguas residuales, esta sección puede no aplicar';
            }
        }
        
        if (moduleKey === 'floating_population') {
            if (context === 'residential') {
                adaptations.help_text = 'Importante en condominios o fincas con estacionalidad turística';
            }
            if (context === 'industrial') {
                reason = 'Plantas industriales normalmente tienen demanda constante';
                adaptations.warning = 'ℹ️ Verifica si hay variación estacional en tu planta';
            }
        }
        
        if (moduleKey === 'tech_selection') {
            if (level === 'preliminary_assessment') {
                adaptations.help_text = 'En evaluación preliminar, puede ser una matriz simplificada';
            }
            if (level === 'complete_design') {
                adaptations.help_text = 'En diseño completo, se espera análisis multicriterio riguroso';
            }
        }
        
        return { adaptations, reason };
    }
    
    /**
     * Inicializar estados de módulos para un proyecto nuevo
     */
    static initializeModuleStatuses(
        projectId: string,
        domain: ProjectDomain,
        context: ProjectContext,
        level: ProjectLevel,
        category: TreatmentCategory | null
    ): Omit<ProjectModuleStatus, 'id' | 'created_at' | 'status_updated_at' | 'marked_by'>[] {
        
        const moduleKeys: ModuleKey[] = [
            'general',
            'population',
            'floating_population',
            'source',
            'consumption',
            'quality',
            'caudales',
            'tank',
            'conduccion',
            'desarenador',
            'jar_test',
            'filtro_lento',
            'compact_design',
            'costs',
            'viability',
            'tech_selection'
        ];
        
        return moduleKeys.map(moduleKey => ({
            project_id: projectId,
            module_key: moduleKey,
            status: 'pending',
            reason: null,
            system_recommendation: this.getModuleRecommendation(
                moduleKey, domain, context, level, category
            ),
            notes: null
        }));
    }
    
    /**
     * Obtener badge visual según recomendación
     */
    static getRecommendationBadge(recommendation: SystemRecommendation): {
        label: string;
        color: string;
        icon: string;
    } {
        switch (recommendation) {
            case 'essential':
                return {
                    label: 'Esencial',
                    color: '#DC2626', // rojo
                    icon: '🔴'
                };
            case 'recommended':
                return {
                    label: 'Recomendado',
                    color: '#2563EB', // azul
                    icon: '🔵'
                };
            case 'optional':
                return {
                    label: 'Opcional',
                    color: '#65A30D', // verde oliva
                    icon: '🟢'
                };
            case 'typically_not_applicable':
                return {
                    label: 'Típicamente no aplica',
                    color: '#6B7280', // gris
                    icon: '⚪'
                };
        }
    }
    
    /**
     * Obtener texto explicativo según categoría de tratamiento
     */
    static getTreatmentCategoryDescription(category: TreatmentCategory): string {
        switch (category) {
            case 'fime':
                return 'Filtración en Múltiples Etapas: Filtros gruesos, dinámicos y lentos de arena. Apropiado para comunidades pequeñas con agua superficial.';
            case 'compact_plant':
                return 'Planta Compacta: Tratamiento químico (coagulación-floculación) + sedimentación + filtración rápida. Para caudales medianos a altos.';
            case 'specific_plant':
                return 'Planta Específica: Diseño customizado según condiciones particulares. Puede usar filtración rápida o lenta según caso.';
            case 'desalination_high_purity':
                return 'Desalinización / Alta Pureza: Ósmosis inversa, electrodiálisis u otros procesos de separación avanzada. Para agua salobre o marina.';
        }
    }
}
```

---

## PARTE 3: FLUJO DE CREACIÓN DE PROYECTO MEJORADO

### 3.1 Wizard de Creación Multi-Paso

**Archivo**: `/src/app/dashboard/new/page.tsx` (REEMPLAZAR COMPLETO)

```typescript
"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
    ProjectDomain, 
    ProjectContext, 
    ProjectLevel, 
    TreatmentCategory 
} from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

export default function NewProjectPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Diagrama de decisión
        project_domain: 'water_treatment' as ProjectDomain,
        project_context: 'rural' as ProjectContext,
        project_level: 'complete_design' as ProjectLevel,
        treatment_category: null as TreatmentCategory | null,
        
        // Información general
        name: '',
        description: '',
        location: '',
        
        // Metadata
        estimated_population: '',
        estimated_flow: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();
    const { user } = useAuth();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleNext = () => {
        // Validaciones por paso
        if (step === 1) {
            // Paso 1: Dominio seleccionado
            setStep(2);
        } else if (step === 2) {
            // Paso 2: Contexto seleccionado
            setStep(3);
        } else if (step === 3) {
            // Paso 3: Nivel seleccionado
            setStep(4);
        } else if (step === 4) {
            // Paso 4: Categoría seleccionada (puede ser null)
            setStep(5);
        }
    };
    
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name) {
            setError('El nombre del proyecto es obligatorio');
            return;
        }
        if (!user) {
            setError('Debe iniciar sesión para crear un proyecto');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // 1. Crear proyecto
            const { data: project, error: insertError } = await supabase
                .from('projects')
                .insert([
                    {
                        user_id: user.id,
                        name: formData.name,
                        description: formData.description,
                        location: formData.location,
                        project_domain: formData.project_domain,
                        project_context: formData.project_context,
                        project_level: formData.project_level,
                        treatment_category: formData.treatment_category,
                        decision_metadata: {
                            estimated_population: formData.estimated_population || null,
                            estimated_flow: formData.estimated_flow || null,
                            wizard_completed_at: new Date().toISOString()
                        },
                        status: 'Borrador'
                    }
                ])
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            // 2. Inicializar estados de módulos
            if (project) {
                const moduleStatuses = RecommendationEngine.initializeModuleStatuses(
                    project.id,
                    formData.project_domain,
                    formData.project_context,
                    formData.project_level,
                    formData.treatment_category
                );
                
                const { error: statusError } = await supabase
                    .from('project_module_status')
                    .insert(moduleStatuses);
                
                if (statusError) console.error('Error al inicializar módulos:', statusError);
                
                // 3. Redirigir al proyecto
                router.push(`/dashboard/projects/${project.id}/general`);
            }
            
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        Nuevo Proyecto
                    </h1>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>
                        Paso {step} de 5 — Diagrama de Decisión
                    </p>
                </div>
                
                {/* Progress Bar */}
                <div style={{ 
                    height: '4px', 
                    backgroundColor: 'var(--color-gray-light)', 
                    borderRadius: '2px', 
                    marginBottom: '2rem',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        height: '100%', 
                        backgroundColor: 'var(--color-primary)', 
                        width: `${(step / 5) * 100}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                
                {error && (
                    <div style={{ 
                        backgroundColor: '#FEE2E2', 
                        color: 'var(--color-error)', 
                        padding: '0.75rem', 
                        borderRadius: 'var(--radius-sm)', 
                        marginBottom: '1.5rem' 
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* PASO 1: DOMINIO DEL SISTEMA */}
                    {step === 1 && (
                        <StepDomain 
                            value={formData.project_domain} 
                            onChange={(value) => setFormData({ ...formData, project_domain: value })} 
                        />
                    )}
                    
                    {/* PASO 2: CONTEXTO DEL PROYECTO */}
                    {step === 2 && (
                        <StepContext 
                            domain={formData.project_domain}
                            value={formData.project_context} 
                            onChange={(value) => setFormData({ ...formData, project_context: value })} 
                        />
                    )}
                    
                    {/* PASO 3: NIVEL DEL PROYECTO */}
                    {step === 3 && (
                        <StepLevel 
                            value={formData.project_level} 
                            onChange={(value) => setFormData({ ...formData, project_level: value })} 
                        />
                    )}
                    
                    {/* PASO 4: CATEGORÍA DE TRATAMIENTO */}
                    {step === 4 && (
                        <StepTreatmentCategory 
                            domain={formData.project_domain}
                            value={formData.treatment_category} 
                            onChange={(value) => setFormData({ ...formData, treatment_category: value })} 
                        />
                    )}
                    
                    {/* PASO 5: INFORMACIÓN GENERAL */}
                    {step === 5 && (
                        <StepGeneralInfo 
                            formData={formData}
                            onChange={handleChange}
                        />
                    )}
                    
                    {/* Navigation Buttons */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={step === 1 ? () => router.back() : handleBack}
                        >
                            {step === 1 ? 'Cancelar' : '← Anterior'}
                        </Button>
                        
                        {step < 5 ? (
                            <Button type="button" onClick={handleNext}>
                                Continuar →
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Proyecto'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// COMPONENTES DE CADA PASO
// ============================================

function StepDomain({ value, onChange }: { 
    value: ProjectDomain; 
    onChange: (value: ProjectDomain) => void 
}) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                1. Dominio del Sistema
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿Qué tipo de sistema de agua vas a diseñar?
            </p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard
                    name="domain"
                    value="water_treatment"
                    checked={value === 'water_treatment'}
                    onChange={() => onChange('water_treatment')}
                    title="💧 Agua Potable"
                    description="Tratamiento de agua cruda para consumo humano. Incluye captación, potabilización y distribución."
                />
                <RadioCard
                    name="domain"
                    value="wastewater_treatment"
                    checked={value === 'wastewater_treatment'}
                    onChange={() => onChange('wastewater_treatment')}
                    title="♻️ Aguas Residuales"
                    description="Tratamiento de aguas servidas domésticas, industriales o mixtas antes de disposición final."
                />
            </div>
        </div>
    );
}

function StepContext({ domain, value, onChange }: { 
    domain: ProjectDomain;
    value: ProjectContext; 
    onChange: (value: ProjectContext) => void 
}) {
    const contexts: { value: ProjectContext; title: string; description: string; applicableTo: ProjectDomain[] }[] = [
        {
            value: 'rural',
            title: '🏡 Rural',
            description: 'Acueductos rurales, comunidades pequeñas. Énfasis en simplicidad operativa y mantenimiento.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'urban',
            title: '🏙️ Urbano',
            description: 'Sistemas municipales, ciudades. Énfasis en continuidad del servicio y redundancia.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'residential',
            title: '🏘️ Residencial / Privado',
            description: 'Viviendas, condominios, fincas privadas. Escala pequeña a mediana.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'industrial',
            title: '🏭 Industrial',
            description: 'Empresas, plantas industriales. Puede requerir calidades específicas según proceso.',
            applicableTo: ['water_treatment', 'wastewater_treatment']
        },
        {
            value: 'desalination',
            title: '🌊 Desalinización',
            description: 'Tratamiento de agua salobre o marina mediante ósmosis inversa u otros procesos.',
            applicableTo: ['water_treatment']
        }
    ];
    
    const applicableContexts = contexts.filter(c => c.applicableTo.includes(domain));
    
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                2. Contexto del Proyecto
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿En qué contexto se desarrollará el proyecto?
            </p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
                {applicableContexts.map(context => (
                    <RadioCard
                        key={context.value}
                        name="context"
                        value={context.value}
                        checked={value === context.value}
                        onChange={() => onChange(context.value)}
                        title={context.title}
                        description={context.description}
                    />
                ))}
            </div>
        </div>
    );
}

function StepLevel({ value, onChange }: { 
    value: ProjectLevel; 
    onChange: (value: ProjectLevel) => void 
}) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                3. Nivel del Proyecto
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿Qué nivel de detalle requiere tu proyecto?
            </p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
                <RadioCard
                    name="level"
                    value="preliminary_assessment"
                    checked={value === 'preliminary_assessment'}
                    onChange={() => onChange('preliminary_assessment')}
                    title="📋 Evaluación Preliminar"
                    description="Estudio de factibilidad o pre-diseño. Algunos módulos técnicos pueden ser opcionales."
                />
                <RadioCard
                    name="level"
                    value="complete_design"
                    checked={value === 'complete_design'}
                    onChange={() => onChange('complete_design')}
                    title="📐 Diseño Técnico Completo"
                    description="Diseño detallado para construcción. Se recomiendan todos los módulos técnicos relevantes."
                />
            </div>
        </div>
    );
}

function StepTreatmentCategory({ domain, value, onChange }: { 
    domain: ProjectDomain;
    value: TreatmentCategory | null; 
    onChange: (value: TreatmentCategory | null) => void 
}) {
    // Solo aplicable a agua potable
    if (domain !== 'water_treatment') {
        return (
            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                    4. Categoría de Tratamiento
                </h2>
                <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                    Esta sección aplica principalmente a agua potable.
                </p>
                <div style={{ 
                    padding: '1.5rem', 
                    backgroundColor: 'var(--color-gray-light)', 
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--color-gray-dark)' }}>
                        ℹ️ Para aguas residuales, la tecnología se define en módulos posteriores
                    </p>
                </div>
            </div>
        );
    }
    
    const categories: { value: TreatmentCategory; title: string; description: string }[] = [
        {
            value: 'fime',
            title: '🔄 FIME (Filtración en Múltiples Etapas)',
            description: 'Filtros gruesos, dinámicos y lentos. Apropiado para comunidades pequeñas con agua superficial.'
        },
        {
            value: 'compact_plant',
            title: '⚗️ Planta Compacta',
            description: 'Coagulación + floculación + sedimentación + filtración rápida. Para caudales medianos a altos.'
        },
        {
            value: 'specific_plant',
            title: '🛠️ Planta Específica',
            description: 'Diseño customizado. Puede usar filtración rápida o lenta según condiciones particulares.'
        },
        {
            value: 'desalination_high_purity',
            title: '💎 Desalinización / Alta Pureza',
            description: 'Ósmosis inversa, electrodiálisis. Para agua salobre, marina o requisitos extremos de calidad.'
        }
    ];
    
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                4. Categoría de Tratamiento
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                ¿Qué tipo de tecnología consideras usar? (Puedes omitir si aún no lo sabes)
            </p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
                {categories.map(category => (
                    <RadioCard
                        key={category.value}
                        name="category"
                        value={category.value}
                        checked={value === category.value}
                        onChange={() => onChange(category.value)}
                        title={category.title}
                        description={category.description}
                    />
                ))}
                
                {/* Opción de omitir */}
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    style={{
                        padding: '1rem',
                        border: `2px solid ${value === null ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: value === null ? 'rgba(34, 84, 131, 0.05)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        ⏭️ Aún no lo sé
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
                        Omitir este paso. Podrás definirlo más adelante.
                    </div>
                </button>
            </div>
        </div>
    );
}

function StepGeneralInfo({ formData, onChange }: { 
    formData: any; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void 
}) {
    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                5. Información General
            </h2>
            <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem' }}>
                Completa la información básica de tu proyecto
            </p>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Input
                    id="name"
                    name="name"
                    label="Nombre del Proyecto *"
                    placeholder="Ej: Acueducto Veredal La Esperanza"
                    value={formData.name}
                    onChange={onChange}
                    required
                />
                
                <div className="input-group">
                    <label htmlFor="description" className="label">Descripción</label>
                    <textarea
                        id="description"
                        name="description"
                        className="input"
                        placeholder="Breve descripción del alcance..."
                        value={formData.description}
                        onChange={onChange}
                        rows={3}
                        style={{ fontFamily: 'inherit' }}
                    />
                </div>
                
                <Input
                    id="location"
                    name="location"
                    label="Ubicación"
                    placeholder="Ciudad, Departamento"
                    value={formData.location}
                    onChange={onChange}
                />
                
                <Input
                    id="estimated_population"
                    name="estimated_population"
                    label="Población Estimada (opcional)"
                    type="number"
                    placeholder="Número de habitantes"
                    value={formData.estimated_population}
                    onChange={onChange}
                />
                
                <Input
                    id="estimated_flow"
                    name="estimated_flow"
                    label="Caudal Estimado (L/s) (opcional)"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.5"
                    value={formData.estimated_flow}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

// ============================================
// COMPONENTE REUTILIZABLE: RadioCard
// ============================================

function RadioCard({ 
    name, 
    value, 
    checked, 
    onChange, 
    title, 
    description 
}: {
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    title: string;
    description: string;
}) {
    return (
        <label style={{
            display: 'block',
            padding: '1.25rem',
            border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            backgroundColor: checked ? 'rgba(34, 84, 131, 0.05)' : 'white',
            transition: 'all 0.2s'
        }}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                style={{ marginRight: '1rem' }}
            />
            <div style={{ display: 'inline-block', verticalAlign: 'top', maxWidth: 'calc(100% - 2rem)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-foreground)' }}>
                    {title}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)', lineHeight: 1.5 }}>
                    {description}
                </div>
            </div>
        </label>
    );
}
```

---

## PARTE 4: ADAPTACIÓN DEL FLUJO TÉCNICO

### 4.1 ProjectSidebar Mejorado con Badges

**Archivo**: `/src/components/ProjectSidebar.tsx` (MODIFICAR)

```typescript
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, ProjectModuleStatus, ModuleKey } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

export default function ProjectSidebar({ projectId }: { projectId: string }) {
    const pathname = usePathname();
    const [project, setProject] = useState<Project | null>(null);
    const [moduleStatuses, setModuleStatuses] = useState<Map<ModuleKey, ProjectModuleStatus>>(new Map());
    const supabase = createClient();
    
    useEffect(() => {
        // Fetch project data
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

    const navItems: { 
        label: string; 
        href: string; 
        moduleKey: ModuleKey;
        block: string;
    }[] = [
        // BLOQUE A — Contexto y Alcance del Proyecto
        { label: '1. Info General', href: `/dashboard/projects/${projectId}/general`, moduleKey: 'general', block: 'BLOQUE A' },
        
        // BLOQUE B — Caracterización de Demanda
        { label: '2. Población y Censo', href: `/dashboard/projects/${projectId}/population`, moduleKey: 'population', block: 'BLOQUE B' },
        { label: '3. Población Estacional', href: `/dashboard/projects/${projectId}/floating-population`, moduleKey: 'floating_population', block: 'BLOQUE B' },
        
        // BLOQUE C — Caracterización de Fuente Hídrica
        { label: '4. Fuente de Agua', href: `/dashboard/projects/${projectId}/source`, moduleKey: 'source', block: 'BLOQUE C' },
        { label: '5. Consumo de Agua', href: `/dashboard/projects/${projectId}/consumption`, moduleKey: 'consumption', block: 'BLOQUE C' },
        { label: '6. Calidad del Agua', href: `/dashboard/projects/${projectId}/quality`, moduleKey: 'quality', block: 'BLOQUE C' },
        
        // BLOQUE D — Diseño Hidráulico y Almacenamiento
        { label: '7. Caudales de Diseño', href: `/dashboard/projects/${projectId}/caudales`, moduleKey: 'caudales', block: 'BLOQUE D' },
        { label: '8. Almacenamiento', href: `/dashboard/projects/${projectId}/tank`, moduleKey: 'tank', block: 'BLOQUE D' },
        { label: '9. Conducción', href: `/dashboard/projects/${projectId}/conduccion`, moduleKey: 'conduccion', block: 'BLOQUE D' },
        
        // BLOQUE E — Tratamiento Primario y Secundario
        { label: '10. Desarenador', href: `/dashboard/projects/${projectId}/desarenador`, moduleKey: 'desarenador', block: 'BLOQUE E' },
        { label: '11. Ensayo de Jarras', href: `/dashboard/projects/${projectId}/jar-test`, moduleKey: 'jar_test', block: 'BLOQUE E' },
        { label: '12. Filtro Lento', href: `/dashboard/projects/${projectId}/filtro-lento`, moduleKey: 'filtro_lento', block: 'BLOQUE E' },
        { label: '13. Ingeniería Compacta', href: `/dashboard/projects/${projectId}/compact-design`, moduleKey: 'compact_design', block: 'BLOQUE E' },
        
        // BLOQUE F — Evaluación Técnica y Económica
        { label: '14. Costos (OpEx)', href: `/dashboard/projects/${projectId}/costs`, moduleKey: 'costs', block: 'BLOQUE F' },
        { label: '15. Viabilidad y O&M', href: `/dashboard/projects/${projectId}/viability`, moduleKey: 'viability', block: 'BLOQUE F' },
        { label: '16. Selección de Tecnología', href: `/dashboard/projects/${projectId}/tech-selection`, moduleKey: 'tech_selection', block: 'BLOQUE F' },
    ];

    return (
        <aside style={{
            width: '280px',
            backgroundColor: 'white',
            borderRight: '1px solid var(--color-gray-medium)',
            height: 'calc(100vh - 80px)',
            padding: '2rem 1rem',
            position: 'sticky',
            top: '0',
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    color: 'var(--color-gray-dark)',
                    letterSpacing: '0.05em',
                    marginBottom: '1rem'
                }}>
                    Estructura del Proyecto
                </h3>
                
                {project && (
                    <div style={{
                        fontSize: '0.75rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--color-gray-light)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem'
                    }}>
                        <div><strong>Dominio:</strong> {project.project_domain === 'water_treatment' ? 'Agua Potable' : 'Aguas Residuales'}</div>
                        <div><strong>Contexto:</strong> {project.project_context}</div>
                        {project.treatment_category && (
                            <div><strong>Categoría:</strong> {project.treatment_category}</div>
                        )}
                    </div>
                )}
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const moduleStatus = moduleStatuses.get(item.moduleKey);
                        const badge = moduleStatus ? 
                            RecommendationEngine.getRecommendationBadge(moduleStatus.system_recommendation) :
                            null;
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    color: isActive ? 'white' : 'var(--color-gray-dark)',
                                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    fontWeight: isActive ? 600 : 400,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{item.label}</span>
                                {badge && (
                                    <span 
                                        title={badge.label}
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        {badge.icon}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Informe Final */}
            <Link 
                href={`/dashboard/projects/${projectId}/report`}
                style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    color: pathname.includes('/report') ? 'white' : 'var(--color-primary)',
                    backgroundColor: pathname.includes('/report') ? 'var(--color-primary)' : 'rgba(34, 84, 131, 0.1)',
                    fontWeight: 600,
                    marginBottom: '1rem'
                }}
            >
                📄 Informe Final
            </Link>

            <div>
                <Link href="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-gray-dark)',
                    fontSize: '0.9rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-gray-medium)'
                }}>
                    ← Volver al Dashboard
                </Link>
            </div>
        </aside>
    );
}
```

**CONTINÚA...**

Debido al límite de caracteres, voy a crear el documento completo. Ya tengo una buena parte diseñada. ¿Quieres que continúe con:
1. Componentes de página mejorados con advertencias contextuales
2. Sistema de badges y recomendaciones visuales
3. Hook para gestionar estado de módulos
4. Plan de implementación y migración

O prefieres que guarde lo que tengo hasta ahora y lo complete en el siguiente paso?
