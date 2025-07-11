-- Hydrostack Initial Database Schema (PostgreSQL 17)
-- Requires the pgcrypto extension for UUID generation.

-----------------------------------------------------------------
-- 0. Enable Extensions ------------------------------------------------------
-----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-----------------------------------------------------------------
-- 1. Users ---------------------------------------------------------------
-----------------------------------------------------------------
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    hashed_password TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user', -- e.g. user | admin
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-----------------------------------------------------------------
-- 2. Projects (PTAR / PTAP) ---------------------------------------------
-----------------------------------------------------------------
CREATE TABLE projects (
    project_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    project_type  TEXT NOT NULL CHECK (project_type IN ('PTAR','PTAP')),
    description   TEXT,
    location      TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-----------------------------------------------------------------
-- 3. user_projects (colaboradores) ---------------------------------------
-----------------------------------------------------------------
CREATE TABLE user_projects (
    user_id    UUID NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT 'collaborator',
    PRIMARY KEY (user_id, project_id)
);

-----------------------------------------------------------------
-- 4. Regulations ---------------------------------------------------------
-----------------------------------------------------------------
CREATE TABLE regulations (
    regulation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country        TEXT NOT NULL,
    code           TEXT NOT NULL, -- e.g. Decreto 3930
    title          TEXT,
    version        TEXT,          -- e.g. Resolución 0631:2015
    effective_from DATE,
    effective_to   DATE,
    url            TEXT
);

-----------------------------------------------------------------
-- 5. Parameter Limits ----------------------------------------------------
-----------------------------------------------------------------
CREATE TABLE parameter_limits (
    limit_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regulation_id UUID NOT NULL REFERENCES regulations(regulation_id) ON DELETE CASCADE,
    parameter     TEXT NOT NULL,  -- e.g. DBO5, SST, pH
    unit          TEXT NOT NULL,  -- mg/L, NTU, etc.
    max_value     NUMERIC,
    min_value     NUMERIC
);

-----------------------------------------------------------------
-- 6. Process Units (unidades de tratamiento) ----------------------------
-----------------------------------------------------------------
CREATE TABLE process_units (
    process_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    name         TEXT NOT NULL,   -- e.g. Reactor UASB
    unit_type    TEXT,            -- Clasificación
    design_flow  NUMERIC,         -- m3/d
    design_notes TEXT
);

-----------------------------------------------------------------
-- 7. Reports -------------------------------------------------------------
-----------------------------------------------------------------
CREATE TABLE reports (
    report_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    file_path    TEXT NOT NULL,   -- path al PDF generado
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-----------------------------------------------------------------
-- 8. Triggers: updated_at -----------------------------------------------
-----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$a
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_updated
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

