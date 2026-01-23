# RESUMEN EJECUTIVO — Paso 4: Onboarding y Perfiles de Usuario

**Documento**: `/docs/PASO-4-ONBOARDING-PERFILES.md`  
**Extensión**: ~900 líneas de especificación técnica completa

---

## 📋 Problema Identificado

Actualmente HydroStack:
- ✅ Tiene un flujo único universal (correcto)
- ✅ Usa `project_type` como contexto (correcto)
- ⚠️ **Mezcla DOMINIO con CONTEXTO en `project_type`**
  - Ejemplo: "Agua potable rural" = Dominio (agua potable) + Contexto (rural)
  - Problema: Dificulta separar agua potable de aguas residuales

---

## 🎯 Solución Propuesta

### 1. Separación Conceptual Clara

| Concepto | Definición | Ejemplos | Alcance |
|----------|-----------|----------|---------|
| **Perfil de Usuario** | Preferencias generales del usuario | "Trabajo en agua potable, contextos rurales y urbanos" | Usuario (global) |
| **Dominio** | Tipo de sistema de agua | "Agua potable" o "Aguas residuales" | Proyecto (específico) |
| **Contexto** | Escala y beneficiario | "Rural", "Urbano", "Residencial", "Industrial" | Proyecto (específico) |
| **Flujo Técnico** | Secuencia de módulos | "Estructura del Proyecto" (16 pasos) | Universal (único) |

---

### 2. Modelo de Datos

#### **Nueva tabla: `user_profiles`**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    
    -- Dominios de interés
    prefers_water_treatment BOOLEAN,
    prefers_wastewater_treatment BOOLEAN,
    
    -- Contextos de interés
    prefers_rural BOOLEAN,
    prefers_urban BOOLEAN,
    prefers_residential BOOLEAN,
    prefers_industrial BOOLEAN,
    prefers_desalination BOOLEAN,
    
    onboarding_completed BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### **Modificación tabla `projects`**
```sql
ALTER TABLE projects 
    ADD COLUMN project_domain VARCHAR(50),    -- 'water_treatment' | 'wastewater_treatment'
    ADD COLUMN project_context VARCHAR(50);   -- 'rural' | 'urban' | 'residential' | etc.

-- Migrar datos existentes de project_type
UPDATE projects 
SET project_domain = ... , project_context = ...;
```

---

### 3. Flujo de Onboarding Propuesto

```
1. Usuario se registra → /register
   ├── Nombre, email, contraseña, rol
   └── Click "Continuar"

2. Usuario accede a → /onboarding (NUEVO)
   ├── ¿Qué sistemas deseas diseñar?
   │   ☐ Agua potable
   │   ☐ Aguas residuales
   │
   └── ¿En qué contextos trabajarás?
       ☐ Rural
       ☐ Urbano
       ☐ Residencial / Privado
       ☐ Industrial
       ☐ Desalinización
       
3. Usuario completa → Guarda en user_profiles

4. Redirect → /dashboard
```

---

### 4. Creación de Proyectos Mejorada

**Antes**:
```typescript
project_type: 'Agua potable rural'  // Mezcla dominio + contexto
```

**Después**:
```typescript
project_domain: 'water_treatment',   // Separado: dominio
project_context: 'rural'             // Separado: contexto

// Valores predeterminados según perfil del usuario
```

---

## ✅ Validación de Restricciones

| Restricción | Cumplimiento | Evidencia |
|-------------|--------------|-----------|
| NO modificar rutas existentes | ✅ | Solo se agrega `/onboarding`, rutas de proyectos intactas |
| NO duplicar módulos | ✅ | Los 16 módulos permanecen únicos |
| NO crear flujos paralelos | ✅ | Flujo "Estructura del Proyecto" sigue siendo único |
| NO introducir IoT | ✅ | No mencionado ni implementado |
| NO ocultar módulos | ✅ | Todos los módulos visibles para todos |
| NO lenguaje comercial | ✅ | Lenguaje técnico e ingenieril |

---

## 🏗️ Arquitectura Actualizada

```
USUARIO
├── Perfil (preferencias)
│   ├── Dominios: [Agua potable ✓, Aguas residuales ✓]
│   └── Contextos: [Rural ✓, Urbano ✓]
│
└── PROYECTOS
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
    └── ...

FLUJO TÉCNICO: ÚNICO Y UNIVERSAL (NO CAMBIA)
```

---

## 🎯 Beneficios

1. **Separación correcta de conceptos**: Perfil ≠ Dominio ≠ Contexto ≠ Flujo
2. **Mejor UX**: Valores predeterminados según perfil al crear proyectos
3. **Preparación para futuro**: Base sólida para agua potable vs aguas residuales
4. **Flexibilidad**: Preferencias NO restringen, solo sugieren
5. **Escalabilidad**: Fácil agregar nuevos dominios/contextos sin duplicar código

---

## 📊 Impacto del Cambio

| Componente | Cambio | Riesgo |
|------------|--------|--------|
| Base de datos | MEDIO — Nueva tabla + 2 columnas | ⚠️ Medio |
| Registro | BAJO — Agregar pantalla opcional `/onboarding` | ✅ Bajo |
| Creación de proyectos | MEDIO — Separar dominio + contexto | ⚠️ Medio |
| **Flujo técnico (16 módulos)** | **CERO** — No cambia | ✅ Cero |
| **Rutas de proyectos** | **CERO** — No cambian | ✅ Cero |

---

## 🚀 Roadmap de Implementación

### Fase 1: Preparación (Semana 1)
- Crear tabla `user_profiles`
- Agregar `project_domain` y `project_context` a `projects`
- Migrar datos de `project_type` → dominio + contexto

### Fase 2: Onboarding (Semana 2)
- Crear página `/onboarding`
- Hook `useUserProfile()`
- Actualizar flujo de registro

### Fase 3: Creación de Proyectos (Semana 3)
- Separar dominio (radio) y contexto (dropdown)
- Sugerencias basadas en perfil

### Fase 4: Ajustes y Documentación (Semana 4)
- Página `/profile` para editar preferencias
- Actualizar documentación técnica

---

## 💡 Principio Fundamental

> **Las preferencias del usuario SOLO sugieren, NUNCA restringen.**

Un usuario con preferencia "Solo agua potable rural" puede:
- ✅ Crear proyecto de aguas residuales
- ✅ Crear proyecto urbano
- ✅ Usar todos los 16 módulos técnicos
- ✅ Cambiar dominio/contexto en cualquier momento

**El perfil solo facilita la UX, NO limita funcionalidad.**

---

## 🎨 Wireframes Clave

### Pantalla de Onboarding

```
┌──────────────────────────────────────┐
│   COMPLETAR PERFIL - PASO 2/2        │
├──────────────────────────────────────┤
│                                      │
│  ¿Qué sistemas deseas diseñar? *     │
│                                      │
│  ☐ Agua potable                      │
│  ☐ Aguas residuales                  │
│                                      │
│  ¿En qué contextos trabajarás?       │
│                                      │
│  ☐ Rural                             │
│  ☐ Urbano                            │
│  ☐ Residencial / Privado             │
│  ☐ Industrial                        │
│  ☐ Desalinización                    │
│                                      │
│  💡 Estas preferencias nos ayudan a  │
│     sugerirte valores, pero NO       │
│     limitan tu trabajo               │
│                                      │
│  [Omitir]  [Completar registro →]    │
└──────────────────────────────────────┘
```

### Crear Proyecto Mejorado

```
┌──────────────────────────────────────┐
│        NUEVO PROYECTO                │
├──────────────────────────────────────┤
│                                      │
│  Nombre del Proyecto *               │
│  [_____________________]             │
│                                      │
│  Tipo de sistema *                   │
│  ◉ Agua potable                      │
│  ○ Aguas residuales                  │
│                                      │
│  Contexto del proyecto *             │
│  [▼ Rural (sugerido)   ]             │
│                                      │
│  💡 Basado en tus preferencias       │
│     Cambiar preferencias →           │
│                                      │
│  [Cancelar]  [Crear Proyecto →]      │
└──────────────────────────────────────┘
```

---

## 📄 Documentación Completa

Para detalles técnicos exhaustivos, consultar:

**`/docs/PASO-4-ONBOARDING-PERFILES.md`** (~900 líneas)
- Análisis completo del estado actual
- Separación conceptual detallada
- Modelo de datos con SQL completo
- Diseño UX con wireframes
- Código de implementación (TypeScript/React)
- Migración segura de datos
- Justificación técnica
- Análisis de riesgos y mitigaciones
- Roadmap de implementación
- Escenarios de uso

---

## ✅ Conclusión

Esta propuesta es:

- ✅ **Técnicamente sólida**: Respeta principios de ingeniería de software
- ✅ **Conservadora**: NO rompe la arquitectura existente
- ✅ **Escalable**: Fácil agregar dominios/contextos en el futuro
- ✅ **Flexible**: Preferencias NO restringen funcionalidad
- ✅ **Preparada**: Base sólida para separar agua potable de aguas residuales

**El flujo único universal permanece intacto. El corazón de HydroStack no cambia.**

---

**Fin del Resumen Ejecutivo**
