-- FiME Design Tables Migration
-- For HYDROSTACK - Asistente de Diseño FiME
-- Run this migration in your Supabase dashboard SQL editor

-- ============================================================
-- 1. FGAC (Filtro Grueso Ascendente en Capas) Design Table
-- ============================================================

CREATE TABLE IF NOT EXISTS project_fgac_design (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vf_design DECIMAL(4,2) CHECK (vf_design BETWEEN 0.3 AND 0.6), -- Velocidad de filtración (m/h)
    num_units INTEGER CHECK (num_units >= 2),
    area_unit DECIMAL(10,2), -- Área por unidad (m²)
    width DECIMAL(10,2), -- Ancho (m)
    length DECIMAL(10,2), -- Largo (m)
    layer_specifications JSONB, -- Especificaciones de capas filtrantes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_fgac_design_project ON project_fgac_design(project_id);

-- RLS Policy: Solo el usuario propietario del proyecto puede acceder
ALTER TABLE project_fgac_design ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own FGAC designs" ON project_fgac_design;
DROP POLICY IF EXISTS "Users can insert their own FGAC designs" ON project_fgac_design;
DROP POLICY IF EXISTS "Users can update their own FGAC designs" ON project_fgac_design;
DROP POLICY IF EXISTS "Users can delete their own FGAC designs" ON project_fgac_design;

-- Create policies
CREATE POLICY "Users can view their own FGAC designs"
    ON project_fgac_design FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_fgac_design.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own FGAC designs"
    ON project_fgac_design FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_fgac_design.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own FGAC designs"
    ON project_fgac_design FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_fgac_design.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own FGAC designs"
    ON project_fgac_design FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_fgac_design.project_id
        AND projects.user_id = auth.uid()
    ));

-- ============================================================
-- 2. Weir Control (Vertederos de Aforo) Table
-- ============================================================

CREATE TABLE IF NOT EXISTS project_weir_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    weir_type VARCHAR(50) CHECK (weir_type IN ('triangular', 'rectangular')),
    angle_degrees DECIMAL(5,2), -- Para vertedero triangular (60° o 90°)
    length_m DECIMAL(10,2), -- Para vertedero rectangular (longitud de cresta)
    h_design_m DECIMAL(10,2), -- Altura de diseño sobre el vertedero
    q_calculated_lps DECIMAL(10,3), -- Caudal calculado
    gauge_colors JSONB, -- Configuración de zonas de colores (verde/amarillo/rojo)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_weir_control_project ON project_weir_control(project_id);

-- RLS
ALTER TABLE project_weir_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own weir controls" ON project_weir_control;
DROP POLICY IF EXISTS "Users can insert their own weir controls" ON project_weir_control;
DROP POLICY IF EXISTS "Users can update their own weir controls" ON project_weir_control;
DROP POLICY IF EXISTS "Users can delete their own weir controls" ON project_weir_control;

CREATE POLICY "Users can view their own weir controls"
    ON project_weir_control FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_weir_control.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own weir controls"
    ON project_weir_control FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_weir_control.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own weir controls"
    ON project_weir_control FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_weir_control.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own weir controls"
    ON project_weir_control FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_weir_control.project_id
        AND projects.user_id = auth.uid()
    ));

-- ============================================================
-- 3. Risk Analysis (Análisis de Riesgo y Vulnerabilidad) Table
-- ============================================================

CREATE TABLE IF NOT EXISTS project_risk_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    flood_risk INTEGER CHECK (flood_risk BETWEEN 1 AND 5),
    drought_risk INTEGER CHECK (drought_risk BETWEEN 1 AND 5),
    contamination_risk INTEGER CHECK (contamination_risk BETWEEN 1 AND 5),
    flow_stability INTEGER CHECK (flow_stability BETWEEN 1 AND 5),
    watershed_protection INTEGER CHECK (watershed_protection BETWEEN 1 AND 5),
    overall_vulnerability DECIMAL(3,1), -- Promedio ponderado (1.0 - 5.0)
    mitigation_actions TEXT[], -- Array de recomendaciones
    additional_notes TEXT, -- Observaciones adicionales
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_risk_analysis_project ON project_risk_analysis(project_id);

-- RLS
ALTER TABLE project_risk_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own risk analyses" ON project_risk_analysis;
DROP POLICY IF EXISTS "Users can insert their own risk analyses" ON project_risk_analysis;
DROP POLICY IF EXISTS "Users can update their own risk analyses" ON project_risk_analysis;
DROP POLICY IF EXISTS "Users can delete their own risk analyses" ON project_risk_analysis;

CREATE POLICY "Users can view their own risk analyses"
    ON project_risk_analysis FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_risk_analysis.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own risk analyses"
    ON project_risk_analysis FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_risk_analysis.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own risk analyses"
    ON project_risk_analysis FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_risk_analysis.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own risk analyses"
    ON project_risk_analysis FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_risk_analysis.project_id
        AND projects.user_id = auth.uid()
    ));

-- ============================================================
-- 4. Comments for Documentation
-- ============================================================

COMMENT ON TABLE project_fgac_design IS 'Diseño del Filtro Grueso Ascendente en Capas (FGAC) para sistemas FIME';
COMMENT ON COLUMN project_fgac_design.vf_design IS 'Velocidad de filtración de diseño en m/h (rango: 0.3-0.6)';
COMMENT ON COLUMN project_fgac_design.layer_specifications IS 'Especificaciones de las 3 capas de grava (JSON)';

COMMENT ON TABLE project_weir_control IS 'Diseño de vertederos de control y sistema de aforo con códigos de colores';
COMMENT ON COLUMN project_weir_control.weir_type IS 'Tipo de vertedero: triangular (bajo caudal) o rectangular (alto caudal)';
COMMENT ON COLUMN project_weir_control.gauge_colors IS 'Configuración de zonas verde/amarillo/rojo para operación manual';

COMMENT ON TABLE project_risk_analysis IS 'Análisis de vulnerabilidad y riesgo ambiental del proyecto FIME';
COMMENT ON COLUMN project_risk_analysis.overall_vulnerability IS 'Índice ponderado de vulnerabilidad general (1.0-5.0)';
COMMENT ON COLUMN project_risk_analysis.mitigation_actions IS 'Array de acciones de mitigación recomendadas';

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE 'FiME Design Tables Migration completed successfully!';
    RAISE NOTICE '- project_fgac_design ✓';
    RAISE NOTICE '- project_weir_control ✓';
    RAISE NOTICE '- project_risk_analysis ✓';
    RAISE NOTICE 'All tables have Row Level Security enabled.';
END $$;
