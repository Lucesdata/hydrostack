# INFORME TÉCNICO — Diseño de Onboarding con Perfil de Usuario en HydroStack

**Fecha**: 22 de enero de 2026  
**Arquitecto**: Producto Digital Senior — Plataformas Técnicas de Ingeniería  
**Proyecto**: HydroStack — Onboarding y Perfiles de Usuario  
**Versión**: Propuesta Técnica v1.0

---

## Resumen Ejecutivo

Este documento propone un **ajuste seguro y conservador** al proceso de registro (onboarding) de HydroStack para capturar preferencias del usuario relacionadas con:

1. **Dominios de trabajo**: Agua potable, aguas residuales
2. **Contextos de proyecto**: Rural, urbano, residencial, industrial, desalinización

**Principio fundamental**: Estas preferencias definen el **perfil del usuario**, NO crean flujos paralelos ni alteran la arquitectura existente. Son sugerencias que facilitan la creación de proyectos, pero **NO restringen funcionalidad**.

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### 1.1 Sistema de Registro Existente

**Archivo**: `/src/app/register/page.tsx`

**Datos capturados actualmente**:
```typescript
{
    name: string,           // Nombre completo
    email: string,          // Correo electrónico
    password: string,       // Contraseña
    role: string            // Tipo de usuario
}
```

**Tipos de usuario actuales** (guardados en `auth.users.user_metadata.role`):
- Comunidad
- Acueducto rural
- Profesional técnico
- Empresa / proveedor
- Entidad / ONG

**Almacenamiento**: 
- Metadata en Supabase Auth → `auth.users.user_metadata` (JSON)
- **NO hay tabla `user_profiles`** en la base de datos actual

---

### 1.2 Arquitectura de Proyectos Existente

**Tabla `projects`** (actual):
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR,
    description TEXT,
    location VARCHAR,
    project_type VARCHAR,  -- Contexto del proyecto (rural, urbano, etc.)
    status VARCHAR,
    latitude FLOAT,
    longitude FLOAT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Campo clave**: `project_type`
- Valores actuales: 'Agua potable rural', 'Agua potable urbano', 'Potabilización privada', 'Desalinización', 'Tratamiento aguas residuales', 'Tratamiento industrial'
- **Problema identificado**: Mezcla DOMINIO (agua potable vs aguas residuales) con CONTEXTO (rural, urbano, etc.)

---

## 2. SEPARACIÓN CONCEPTUAL PROPUESTA

### 2.1 Definición de Conceptos

| Concepto | Definición | Alcance | Ejemplos |
|----------|-----------|---------|----------|
| **Perfil de Usuario** | Preferencias generales del usuario sobre qué sistemas desea trabajar | Usuario (global) | "Trabajo en agua potable y aguas residuales, principalmente en contextos rurales y urbanos" |
| **Dominio del Proyecto** | Tipo de sistema de agua | Proyecto (específico) | "Agua potable" o "Aguas residuales" |
| **Contexto del Proyecto** | Escala y tipo de beneficiario | Proyecto (específico) | "Rural", "Urbano", "Residencial", "Industrial", "Desalinización" |
| **Flujo Técnico** | Secuencia de módulos para diseñar | Universal (compartido) | "Estructura del Proyecto" (16 pasos + informe) |

---

### 2.2 Jerarquía Conceptual

```
USUARIO
├── Perfil de Usuario (preferencias generales)
│   ├── Dominios de interés: [Agua potable, Aguas residuales]
│   └── Contextos de interés: [Rural, Urbano, Residencial, Industrial, Desalinización]
│
└── PROYECTOS (múltiples)
    ├── Proyecto 1
    │   ├── Dominio: Agua potable
    │   ├── Contexto: Rural
    │   └── Flujo: Estructura del Proyecto (16 módulos)
    │
    ├── Proyecto 2
    │   ├── Dominio: Aguas residuales
    │   ├── Contexto: Urbano
    │   └── Flujo: Estructura del Proyecto (16 módulos)
    │
    └── Proyecto 3
        ├── Dominio: Agua potable
        ├── Contexto: Desalinización
        └── Flujo: Estructura del Proyecto (16 módulos)
```

**Nota crítica**: El **flujo técnico es ÚNICO** independientemente del dominio y contexto.

---

## 3. MODELO DE DATOS PROPUESTO

### 3.1 Tabla `user_profiles` (Nueva — Opcional)

**Opción A: Tabla Relacional** (Recomendada para escalabilidad)

```sql
-- Tabla de perfil de usuario
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Preferencias de dominio
    prefers_water_treatment BOOLEAN DEFAULT TRUE,      -- Agua potable
    prefers_wastewater_treatment BOOLEAN DEFAULT FALSE, -- Aguas residuales
    
    -- Preferencias de contexto
    prefers_rural BOOLEAN DEFAULT FALSE,
    prefers_urban BOOLEAN DEFAULT FALSE,
    prefers_residential BOOLEAN DEFAULT FALSE,
    prefers_industrial BOOLEAN DEFAULT FALSE,
    prefers_desalination BOOLEAN DEFAULT FALSE,
    
    -- Metadata adicional
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsqueda rápida por usuario
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: El usuario solo puede ver/editar su propio perfil
CREATE POLICY "Users can view own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
```

**Opción B: JSON en `auth.users.user_metadata`** (Más simple, menos escalable)

```typescript
// Estructura en user_metadata
{
    name: "Juan Pérez",
    role: "Profesional técnico",
    preferences: {
        domains: ["water_treatment", "wastewater_treatment"],
        contexts: ["rural", "urban"],
        onboarding_completed: true
    }
}
```

**Recomendación**: **Opción A (tabla `user_profiles`)** por:
- ✅ Mayor escalabilidad
- ✅ Facilita consultas y reportes
- ✅ Permite agregar campos futuros sin afectar auth
- ✅ Mejor separación de responsabilidades

---

### 3.2 Tabla `projects` Modificada

**Cambio propuesto**: Separar `project_type` en dos campos

```sql
-- Modificación de tabla projects (migración SQL)
ALTER TABLE projects 
    ADD COLUMN project_domain VARCHAR(50),    -- 'water_treatment' o 'wastewater_treatment'
    ADD COLUMN project_context VARCHAR(50);   -- 'rural', 'urban', 'residential',etc.

-- Opcional: Mantener project_type por compatibilidad temporal
-- ALTER TABLE projects RENAME COLUMN project_type TO project_type_legacy;
```

**Migración de datos existentes**:

```sql
-- Migrar datos de project_type a project_domain + project_context
UPDATE projects
SET 
    project_domain = CASE
        WHEN project_type IN ('Agua potable rural', 'Agua potable urbano', 'Potabilización privada', 'Desalinización') 
            THEN 'water_treatment'
        WHEN project_type IN ('Tratamiento aguas residuales', 'Tratamiento industrial') 
            THEN 'wastewater_treatment'
        ELSE 'water_treatment'  -- Default
    END,
    project_context = CASE
        WHEN project_type = 'Agua potable rural' THEN 'rural'
        WHEN project_type = 'Agua potable urbano' THEN 'urban'
        WHEN project_type = 'Potabilización privada' THEN 'residential'
        WHEN project_type = 'Desalinización' THEN 'desalination'
        WHEN project_type = 'Tratamiento aguas residuales' THEN 'urban'
        WHEN project_type = 'Tratamiento industrial' THEN 'industrial'
        ELSE 'rural'  -- Default
    END
WHERE project_domain IS NULL OR project_context IS NULL;
```

---

### 3.3 TypeScript Types

```typescript
// /src/types/user.ts
export type UserDomain = 'water_treatment' | 'wastewater_treatment';

export type ProjectContext = 
    | 'rural' 
    | 'urban' 
    | 'residential' 
    | 'industrial' 
    | 'desalination';

export interface UserProfile {
    id: string;
    user_id: string;
    prefers_water_treatment: boolean;
    prefers_wastewater_treatment: boolean;
    prefers_rural: boolean;
    prefers_urban: boolean;
    prefers_residential: boolean;
    prefers_industrial: boolean;
    prefers_desalination: boolean;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    location: string | null;
    project_domain: UserDomain;
    project_context: ProjectContext;
    status: 'Borrador' | 'En diseño' | 'Completado' | 'Archivado';
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
}
```

---

## 4. DISEÑO DEL FLUJO DE ONBOARDING

### 4.1 Flujo Actual (Antes)

```
1. Usuario accede a /register
2. Llena: nombre, email, contraseña, rol
3. Click en "Registrarse"
4. Redirect a /dashboard
```

---

### 4.2 Flujo Propuesto (Después)

```
1. Usuario accede a /register
2. PASO 1: Datos básicos
   ├── Nombre completo
   ├── Email
   ├── Contraseña
   └── Tipo de usuario (rol)
   
3. Click en "Continuar" → Registro en Supabase Auth

4. PASO 2: Preferencias de trabajo (NUEVO)
   ├── ¿Qué sistemas deseas diseñar?
   │   ☐ Agua potable
   │   ☐ Aguas residuales
   │
   └── ¿En qué contextos trabajarás?
       ☐ Rural
       ☐ Urbano
       ☐ Residencial / Privado
       ☐ Industrial
       ☐ Desalinización (solo si seleccionó agua potable)
       
5. Click en "Completar registro" → Guarda en user_profiles

6. Redirect a /dashboard
```

---

### 4.3 Pantallas Propuestas

#### **Pantalla 1: Datos Básicos** (`/register`)

```
┌─────────────────────────────────────────┐
│          CREAR CUENTA - PASO 1/2        │
│        Información de tu cuenta         │
├─────────────────────────────────────────┤
│                                         │
│  Nombre completo                        │
│  [___________________________]          │
│                                         │
│  Correo electrónico                     │
│  [___________________________]          │
│                                         │
│  Contraseña                             │
│  [___________________________]          │
│                                         │
│  Tipo de usuario                        │
│  [▼ Profesional técnico      ]          │
│  (Opciones: Comunidad, Acueducto rural, │
│   Profesional técnico, Empresa, ONG)    │
│                                         │
│  [    Continuar →    ]                  │
│                                         │
│  ¿Ya tienes cuenta? Inicia sesión       │
└─────────────────────────────────────────┘
```

#### **Pantalla 2: Preferencias de Trabajo** (`/onboarding` — NUEVO)

```
┌─────────────────────────────────────────┐
│          COMPLETAR PERFIL - PASO 2/2    │
│     Personaliza tu experiencia          │
├─────────────────────────────────────────┤
│                                         │
│  ¿Qué sistemas deseas diseñar?          │
│                                         │
│  ☐ Agua potable                         │
│     Tratamiento de agua cruda para      │
│     consumo humano                      │
│                                         │
│  ☐ Aguas residuales                     │
│     Tratamiento de aguas servidas       │
│                                         │
│  ──────────────────────────────────     │
│                                         │
│  ¿En qué contextos trabajarás?          │
│                                         │
│  ☐ Rural                                │
│     Acueductos rurales, comunidades     │
│                                         │
│  ☐ Urbano                               │
│     Sistemas municipales, ciudades      │
│                                         │
│  ☐ Residencial / Privado                │
│     Viviendas, condominios, fincas      │
│                                         │
│  ☐ Industrial                           │
│     Empresas, plantas industriales      │
│                                         │
│  ☐ Desalinización                       │
│     Tratamiento de agua salobre/marina  │
│                                         │
│  ──────────────────────────────────     │
│                                         │
│  💡 Estas preferencias nos ayudan a     │
│     sugerirte valores predeterminados,  │
│     pero NO limitan tu trabajo          │
│                                         │
│  [← Anterior]  [Completar registro →]   │
└─────────────────────────────────────────┘
```

---

### 4.4 Validaciones UX

| Validación | Comportamiento |
|------------|----------------|
| No selecciona ningún dominio | Advertencia: "Selecciona al menos un tipo de sistema" |
| No selecciona ningún contexto | Permitir continuar (opcional) |
| Selecciona "Desalinización" sin "Agua potable" | Deshabilitar la opción (desalinización es un contexto de agua potable) |
| Click en "Omitir" | Permitir, pero marcar perfil como incompleto |

---

## 5. INFLUENCIA DEL PERFIL EN LA CREACIÓN DE PROYECTOS

### 5.1 Principio Fundamental

**El perfil de usuario NO restringe, SOLO sugiere.**

| Acción | Con Perfil | Sin Perfil |
|--------|-----------|-----------|
| Crear proyecto | Valores predeterminados según preferencias | Valores por defecto genéricos |
| Ver todos los tipos de proyecto | ✅ Sí, todos visibles | ✅ Sí, todos visibles |
| Cambiar dominio/contexto del proyecto | ✅ Sí, total libertad | ✅ Sí, total libertad |

---

### 5.2 Flujo de Creación de Proyecto Mejorado

**Archivo actualizado**: `/src/app/dashboard/new/page.tsx`

#### **Antes (Actual)**:
```typescript
const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    project_type: 'Agua potable rural'  // Valor hardcodeado
});

const projectTypes = [
    'Agua potable rural',
    'Agua potable urbano',
    'Potabilización privada',
    // ...
];
```

#### **Después (Propuesto)**:
```typescript
const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    project_domain: userProfile.prefers_water_treatment ? 'water_treatment' : 'wastewater_treatment',
    project_context: suggestDefaultContext(userProfile)  // Basado en preferencias
});

const domains = [
    { value: 'water_treatment', label: 'Agua potable' },
    { value: 'wastewater_treatment', label: 'Aguas residuales' }
];

const contexts = [
    { value: 'rural', label: 'Rural', applicableTo: ['water_treatment', 'wastewater_treatment'] },
    { value: 'urban', label: 'Urbano', applicableTo: ['water_treatment', 'wastewater_treatment'] },
    { value: 'residential', label: 'Residencial', applicableTo: ['water_treatment', 'wastewater_treatment'] },
    { value: 'industrial', label: 'Industrial', applicableTo: ['water_treatment', 'wastewater_treatment'] },
    { value: 'desalination', label: 'Desalinización', applicableTo: ['water_treatment'] }
];

function suggestDefaultContext(profile: UserProfile): ProjectContext {
    if (profile.prefers_rural) return 'rural';
    if (profile.prefers_urban) return 'urban';
    if (profile.prefers_residential) return 'residential';
    if (profile.prefers_industrial) return 'industrial';
    if (profile.prefers_desalination) return 'desalination';
    return 'rural';  // Fallback
}
```

---

### 5.3 Pantalla de Creación de Proyecto Mejorada

```
┌─────────────────────────────────────────┐
│          NUEVO PROYECTO                 │
├─────────────────────────────────────────┤
│                                         │
│  Nombre del Proyecto *                  │
│  [___________________________]          │
│                                         │
│  Descripción                            │
│  [___________________________ ]         │
│  [___________________________]          │
│                                         │
│  Ubicación                              │
│  [___________________________]          │
│                                         │
│  Tipo de sistema *                      │
│  ◉ Agua potable                         │
│  ○ Aguas residuales                     │
│                                         │
│  Contexto del proyecto *                │
│  [▼ Rural (sugerido)         ]          │
│  (Opciones: Rural, Urbano, Residencial, │
│   Industrial, Desalinización)           │
│                                         │
│  ──────────────────────────────────     │
│                                         │
│  💡 Basado en tus preferencias          │
│     Cambiar preferencias →              │
│                                         │
│  [Cancelar]  [Crear Proyecto →]         │
└─────────────────────────────────────────┘
```

**Cambios clave**:
- ✅ "Tipo de sistema" separado (Radio buttons: Agua potable / Aguas residuales)
- ✅ "Contexto" separado (Dropdown con opciones filtradas)
- ✅ Valor predeterminado según perfil (con sufijo "sugerido")
- ✅ Enlace para cambiar preferencias del perfil

---

## 6. IMPLEMENTACIÓN TÉCNICA

### 6.1 Migración de Base de Datos

**Archivo**: `supabase/migrations/YYYYMMDDHHMMSS_add_user_profiles.sql`

```sql
-- Crear tabla user_profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prefers_water_treatment BOOLEAN DEFAULT TRUE,
    prefers_wastewater_treatment BOOLEAN DEFAULT FALSE,
    prefers_rural BOOLEAN DEFAULT FALSE,
    prefers_urban BOOLEAN DEFAULT FALSE,
    prefers_residential BOOLEAN DEFAULT FALSE,
    prefers_industrial BOOLEAN DEFAULT FALSE,
    prefers_desalination BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Agregar campos a projects
ALTER TABLE projects 
    ADD COLUMN project_domain VARCHAR(50) DEFAULT 'water_treatment',
    ADD COLUMN project_context VARCHAR(50) DEFAULT 'rural';

-- Migrar datos existentes
UPDATE projects
SET 
    project_domain = CASE
        WHEN project_type ILIKE '%residual%' OR project_type ILIKE '%industrial%' 
            THEN 'wastewater_treatment'
        ELSE 'water_treatment'
    END,
    project_context = CASE
        WHEN project_type ILIKE '%rural%' THEN 'rural'
        WHEN project_type ILIKE '%urbano%' THEN 'urban'
        WHEN project_type ILIKE '%privada%' OR project_type ILIKE '%residencial%' THEN 'residential'
        WHEN project_type ILIKE '%desalin%' THEN 'desalination'
        WHEN project_type ILIKE '%industrial%' THEN 'industrial'
        ELSE 'rural'
    END
WHERE project_domain IS NULL OR project_context IS NULL;

-- Opcional: Deprecar project_type (mantener por compatibilidad)
-- ALTER TABLE projects RENAME COLUMN project_type TO project_type_legacy;

COMMENT ON TABLE user_profiles IS 'Perfil de usuario con preferencias de trabajo';
COMMENT ON COLUMN projects.project_domain IS 'Dominio del proyecto: water_treatment o wastewater_treatment';
COMMENT ON COLUMN projects.project_context IS 'Contexto del proyecto: rural, urban, residential, industrial, desalination';
```

---

### 6.2 Componente de Onboarding

**Archivo nuevo**: `/src/app/onboarding/page.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        prefers_water_treatment: false,
        prefers_wastewater_treatment: false,
        prefers_rural: false,
        prefers_urban: false,
        prefers_residential: false,
        prefers_industrial: false,
        prefers_desalination: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences({ ...preferences, [key]: !preferences[key] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: Al menos un dominio seleccionado
        if (!preferences.prefers_water_treatment && !preferences.prefers_wastewater_treatment) {
            setError('Por favor selecciona al menos un tipo de sistema');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        user_id: user?.id,
                        ...preferences,
                        onboarding_completed: true,
                    }
                ]);

            if (insertError) throw insertError;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al guardar preferencias');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        Completar Perfil - Paso 2/2
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-gray-dark)' }}>
                        Personaliza tu experiencia en HydroStack
                    </p>
                </div>

                {error && <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-foreground)' }}>
                            ¿Qué sistemas deseas diseñar? *
                        </h3>
                        <CheckboxOption
                            label="Agua potable"
                            description="Tratamiento de agua cruda para consumo humano"
                            checked={preferences.prefers_water_treatment}
                            onChange={() => handleToggle('prefers_water_treatment')}
                        />
                        <CheckboxOption
                            label="Aguas residuales"
                            description="Tratamiento de aguas servidas domésticas e industriales"
                            checked={preferences.prefers_wastewater_treatment}
                            onChange={() => handleToggle('prefers_wastewater_treatment')}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-foreground)' }}>
                            ¿En qué contextos trabajarás?
                        </h3>
                        <CheckboxOption
                            label="Rural"
                            description="Acueductos rurales, comunidades pequeñas"
                            checked={preferences.prefers_rural}
                            onChange={() => handleToggle('prefers_rural')}
                        />
                        <CheckboxOption
                            label="Urbano"
                            description="Sistemas municipales, ciudades"
                            checked={preferences.prefers_urban}
                            onChange={() => handleToggle('prefers_urban')}
                        />
                        <CheckboxOption
                            label="Residencial / Privado"
                            description="Viviendas, condominios, fincas privadas"
                            checked={preferences.prefers_residential}
                            onChange={() => handleToggle('prefers_residential')}
                        />
                        <CheckboxOption
                            label="Industrial"
                            description="Empresas, plantas industriales"
                            checked={preferences.prefers_industrial}
                            onChange={() => handleToggle('prefers_industrial')}
                        />
                        <CheckboxOption
                            label="Desalinización"
                            description="Tratamiento de agua salobre o marina"
                            checked={preferences.prefers_desalination}
                            onChange={() => handleToggle('prefers_desalination')}
                            disabled={!preferences.prefers_water_treatment}
                        />
                    </div>

                    <div style={{ backgroundColor: 'var(--color-gray-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)', margin: 0 }}>
                            💡 <strong>Nota:</strong> Estas preferencias nos ayudan a sugerirte valores predeterminados al crear proyectos, pero <strong>NO limitan tu trabajo</strong>. Podrás crear proyectos de cualquier tipo en cualquier momento.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                        <Button type="button" variant="secondary" onClick={() => router.push('/dashboard')}>
                            Omitir
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Completar registro →'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CheckboxOption({ label, description, checked, onChange, disabled = false }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <label style={{
            display: 'flex',
            alignItems: 'start',
            padding: '1rem',
            marginBottom: '0.5rem',
            border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-gray-medium)'}`,
            borderRadius: 'var(--radius-sm)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: disabled ? 'var(--color-gray-light)' : (checked ? 'rgba(34, 84, 131, 0.05)' : 'white'),
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s'
        }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                style={{ marginRight: '1rem', marginTop: '0.25rem', cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
            <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-foreground)' }}>
                    {label}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
                    {description}
                </div>
            </div>
        </label>
    );
}
```

---

### 6.3 Actualización del Flujo de Registro

**Archivo modificado**: `/src/app/register/page.tsx`

```typescript
// Después del registro exitoso en Supabase Auth
if (signUpError) throw signUpError;

// NUEVO: Redirect a onboarding en lugar de dashboard
router.push('/onboarding');
```

---

### 6.4 Hook para Obtener Perfil de Usuario

**Archivo nuevo**: `/src/hooks/useUserProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/user';

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!error && data) {
                setProfile(data);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user, supabase]);

    return { profile, loading };
}
```

---

## 7. JUSTIFICACIÓN TÉCNICA — POR QUÉ ESTE ENFOQUE NO ROMPE HYDROSTACK

### 7.1 Validación de Restricciones

| Restricción | Estado | Evidencia |
|-------------|--------|-----------|
| NO modificar rutas existentes | ✅ Cumplido | Solo se agrega `/onboarding`, todas las rutas de proyectos permanecen idénticas |
| NO duplicar módulos | ✅ Cumplido | Los 16 módulos técnicos se mantienen únicos y compartidos |
| NO crear flujos paralelos | ✅ Cumplido | El flujo "Estructura del Proyecto" sigue siendo único y universal |
| NO introducir IoT | ✅ Cumplido | No se menciona ni implementa |
| NO ocultar módulos según tipo | ✅ Cumplido | Todos los módulos visibles para todos los proyectos |
| NO usar lenguaje comercial | ✅ Cumplido | Lenguaje técnico e ingenieril en toda la documentación |

---

### 7.2 Análisis de Impacto por Componente

| Componente | Cambio | Impacto | Riesgo |
|-----------|--------|---------|--------|
| **Base de datos** | Agregar tabla `user_profiles`, dos columnas a `projects` | Bajo — Migración SQL segura, no afecta datos existentes | ⚠️ Bajo |
| **Registro** | Agregar paso de onboarding después de registro | Bajo — Flujo opcional, se puede omitir | ✅ Muy bajo |
| **Creación de proyectos** | Cambiar `project_type` por `project_domain` + `project_context` | Medio — requiere migración de datos existentes | ⚠️ Medio |
| **Flujo técnico** | Ninguno | Cero — El flujo de 16 módulos NO cambia | ✅ Cero |
| **Rutas** | Ninguno (solo agregar `/onboarding`) | Cero — Rutas de proyectos intactas | ✅ Cero |
| **Componentes de formularios** | Ninguno | Cero — Los 20 componentes NO cambian | ✅ Cero |

---

### 7.3 Escalabilidad del Enfoque

#### **Escenario Futuro 1: Agregar nuevo dominio (ej: Agua de lluvia)**

```sql
-- Agregar columna booleana a user_profiles
ALTER TABLE user_profiles ADD COLUMN prefers_rainwater_treatment BOOLEAN DEFAULT FALSE;

-- Agregar valor al enum de project_domain
UPDATE projects SET project_domain = 'rainwater_treatment' WHERE ...; -- Solo si aplica
```

**Impacto**: Bajo — Un campo adicional, sin duplicación de código.

---

#### **Escenario Futuro 2: Agregar nuevo contexto (ej: Turismo)**

```sql
ALTER TABLE user_profiles ADD COLUMN prefers_tourism BOOLEAN DEFAULT FALSE;
```

**Impacto**: Cero en código existente, solo agregar opción en UI.

---

#### **Escenario Futuro 3: Agregar módulo específico (ej: "Tanque Séptico" solo para aguas residuales)**

1. Crear tabla `project_septic_tank`
2. Agregar ruta `/dashboard/projects/[id]/septic-tank`
3. Agregar componente `SepticTankForm.tsx`
4. **Agregar condicionalmente al `ProjectSidebar`**:

```typescript
const navItems = [
    // ... módulos existentes
    
    // NUEVO: Módulo condicional
    ...(project.project_domain === 'wastewater_treatment' ? [
        { label: '17. Tanque Séptico', href: `/dashboard/projects/${projectId}/septic-tank` }
    ] : []),
    
    // Informe final
    { label: '📄 Informe Final', href: `/dashboard/projects/${projectId}/report` },
];
```

**Impacto**: Medio — Primera vez que se condiciona módulo según dominio, pero arquitectura lo soporta.

---

### 7.4 Mantenibilidad

**Ventajas del enfoque propuesto**:

1. ✅ **Separación de conceptos clara**: Perfil ≠ Proyecto ≠ Flujo
2. ✅ **Migración de datos segura**: `project_type` se descompone lógicamente
3. ✅ **Extensibilidad sin duplicación**: Agregar dominios/contextos es trivial
4. ✅ **Compatibilidad hacia atrás**: Se puede mantener `project_type` legacy temporalmente
5. ✅ **Testing simple**: Cada capa (perfil, proyecto, flujo) se puede probar independientemente

---

### 7.5 Coherencia de Ingeniería

El enfoque propuesto respeta los **principios de ingeniería de software**:

| Principio | Cumplimiento |
|-----------|--------------|
| **Separation of Concerns** | ✅ Perfil (usuario) separado de Proyecto (entidad) separado de Flujo (proceso) |
| **DRY (Don't Repeat Yourself)** | ✅ Un solo flujo universal, NO duplicación de módulos |
| **Single Responsibility** | ✅ Cada tabla tiene una responsabilidad clara |
| **Open/Closed** | ✅ Abierto para extensión (nuevos dominios/contextos), cerrado para modificación (flujo existente) |
| **Liskov Substitution** | ✅ Todos los proyectos (independientemente del dominio) usan el mismo flujo |
| **Interface Segregation** | ✅ Perfil de usuario no fuerza interfaces innecesarias |
| **Dependency Inversion** | ✅ Creación de proyectos depende de abstracciones (UserProfile), no de implementaciones concretas |

---

## 8. ROADMAP DE IMPLEMENTACIÓN

### Fase 1: Preparación (Semana 1)

1. ✅ Crear migración SQL para `user_profiles`
2. ✅ Crear migración SQL para agregar `project_domain` y `project_context` a `projects`
3. ✅ Ejecutar migración de datos existentes (`project_type` → `project_domain` + `project_context`)
4. ✅ Definir TypeScript types (`UserProfile`, `UserDomain`, `ProjectContext`)

### Fase 2: Onboarding (Semana 2)

1. ✅ Crear página `/onboarding`
2. ✅ Crear componente `CheckboxOption` reutilizable
3. ✅ Actualizar `/register` para redirect a `/onboarding`
4. ✅ Crear hook `useUserProfile()`
5. ✅ Testing del flujo completo de registro

### Fase 3: Creación de Proyectos (Semana 3)

1. ✅ Actualizar `/dashboard/new/page.tsx` para usar `project_domain` + `project_context`
2. ✅ Separar selección de dominio (Radio buttons) y contexto (Dropdown)
3. ✅ Implementar sugerencias basadas en perfil del usuario
4. ✅ Agregar enlace "Cambiar preferencias" → `/profile` (futura página de configuración)

### Fase 4: Actualización de Proyectos Existentes (Semana 4)

1. ✅ Actualizar `GeneralInfoForm.tsx` para permitir edición de `project_domain` + `project_context`
2. ✅ Mantener `project_type` como campo legacy (opcional, para compatibilidad)
3. ✅ Actualizar `ProjectReport.tsx` para mostrar dominio + contexto claramente

### Fase 5: Refinamientos (Semana 5)

1. ✅ Crear página `/profile` para editar preferencias de usuario
2. ✅ Agregar validaciones contextuales (ej: desalinización solo con agua potable)
3. ✅ Agregar analytics de preferencias de usuario (reportes internos)
4. ✅ Documentar en `/docs/estructura-tecnica.md`

---

## 9. ESCENARIOS DE USO

### Escenario A: Usuario Solo Agua Potable Rural

**Perfil**:
```typescript
{
    prefers_water_treatment: true,
    prefers_wastewater_treatment: false,
    prefers_rural: true,
    prefers_urban: false,
    // ... resto false
}
```

**Al crear proyecto**:
- Dominio predeterminado: "Agua potable"
- Contexto predeterminado: "Rural"
- Puede cambiar a cualquier otro tipo sin restricciones

---

### Escenario B: Usuario Consultor Multidisciplinario

**Perfil**:
```typescript
{
    prefers_water_treatment: true,
    prefers_wastewater_treatment: true,
    prefers_rural: true,
    prefers_urban: true,
    prefers_industrial: true,
    // ... todos true
}
```

**Al crear proyecto**:
- Dominio predeterminado: "Agua potable" (primera preferencia)
- Contexto predeterminado: "Rural" (primera preferencia)
- Libertad total para cambiar según necesidad del proyecto

---

### Escenario C: Usuario Empresa de Aguas Residuales Industrial

**Perfil**:
```typescript
{
    prefers_water_treatment: false,
    prefers_wastewater_treatment: true,
    prefers_industrial: true,
    // ... resto false
}
```

**Al crear proyecto**:
- Dominio predeterminado: "Aguas residuales"
- Contexto predeterminado: "Industrial"
- Puede crear proyectos de agua potable si lo necesita en el futuro

---

## 10. CONCLUSIONES Y RECOMENDACIONES

### ✅ Validaciones Finales

1. ✅ **El perfil de usuario NO rompe la arquitectura existente**
2. ✅ **El flujo técnico permanece único y universal**
3. ✅ **Las preferencias solo sugieren, NO restringen**
4. ✅ **La migración de datos es segura y reversible**
5. ✅ **El sistema es extensible sin fragmentación**

---

### 🎯 Beneficios del Enfoque

| Beneficio | Descripción |
|-----------|-------------|
| **Mejor UX** | El usuario no ve opciones irrelevantes al crear proyectos |
| **Personalización** | Valores predeterminados según el perfil del ingeniero |
| **Flexibilidad** | No se restringe funcionalidad, solo se orienta |
| **Escalabilidad** | Fácil agregar nuevos dominios y contextos |
| **Separación de conceptos** | Perfil ≠ Proyecto ≠ Flujo (clara arquitectura) |
| **Preparación para futuro** | Base sólida para módulos condicionales (opcional) |

---

### ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Migración SQL falla en datos legacy | Baja | Alto | Testing exhaustivo en ambiente de staging, rollback plan |
| Usuarios omiten onboarding | Media | Bajo | Permitir omitir, agregar banner en dashboard para completar perfil después |
| Confusión entre dominio y contexto | Media | Medio | UI clara con descripciones, ayuda contextual |
| Datos inconsistentes (`project_domain` NULL) | Baja | Medio | Valores DEFAULT en schema, validación en frontend |

---

### 📋 Recomendaciones Finales

#### **Implementar ahora (Prioridad Alta)**:
1. ✅ Crear tabla `user_profiles`
2. ✅ Agregar `/onboarding` con captura de preferencias
3. ✅ Separar `project_domain` y `project_context` en creación de proyectos
4. ✅ Migrar datos de `project_type` → `project_domain` + `project_context`

#### **Implementar después (Prioridad Media)**:
1. ⏳ Página `/profile` para editar preferencias
2. ⏳ Banner en dashboard para completar perfil (si fue omitido)
3. ⏳ Analytics de preferencias de usuario (reportes internos)

#### **Considerar futuro (Prioridad Baja)**:
1. 🔮 Módulos condicionales según dominio (ej: "Tanque Séptico" solo en aguas residuales)
2. 🔮 Plantillas predefinidas por dominio + contexto
3. 🔮 Sistema de recomendación inteligente basado en perfil + proyecto

---

**Fin del Informe Técnico — Onboarding y Perfiles de Usuario en HydroStack**

**Conclusión**: Este enfoque es **técnicamente sólido, conservador y escalable**. Respeta la arquitectura existente mientras prepara el sistema para una separación clara entre agua potable y aguas residuales, sin romper el flujo único universal que es el corazón de HydroStack.
