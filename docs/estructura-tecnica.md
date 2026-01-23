# Estructura Técnica del Proyecto — HydroStack

**Documento**: Clasificación Conceptual de Módulos  
**Versión**: 1.0  
**Fecha**: Enero 2026  
**Audiencia**: Desarrolladores, Ingenieros de Producto

---

## Introducción

Este documento describe la **clasificación interna y conceptual** de los módulos que componen el flujo "Estructura del Proyecto" en HydroStack.

La clasificación organiza los 16 pasos técnicos en **7 bloques temáticos** para facilitar:
- Comprensión de la arquitectura de información
- Onboarding de nuevos desarrolladores
- Planificación de nuevas funcionalidades
- Comunicación con usuarios avanzados

**IMPORTANTE**: Esta clasificación es **puramente conceptual** y **NO afecta el código ni la interfaz de usuario**. Los módulos se muestran al usuario en orden secuencial (1-16) sin agrupación visual.

---

## Arquitectura General

```
ESTRUCTURA DEL PROYECTO
│
├── BLOQUE A — Contexto y Alcance
├── BLOQUE B — Caracterización de Demanda
├── BLOQUE C — Caracterización de Fuente Hídrica
├── BLOQUE D — Diseño Hidráulico y Almacenamiento
├── BLOQUE E — Tratamiento Primario y Secundario
├── BLOQUE F — Evaluación Técnica y Económica
└── BLOQUE G — Documentación y Entregables
```

---

## BLOQUE A — Contexto y Alcance del Proyecto

**Propósito**: Definir el marco general del proyecto y sus características básicas.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **1** | Información General | `/general` | `GeneralInfoForm.tsx` | `projects` |

**Función técnica**:
- Identificación del proyecto (nombre, descripción)
- Ubicación geográfica (ciudad, coordenadas GPS)
- **Tipo de proyecto** (contexto, no flujo)
- Estado del proyecto (Borrador, En diseño, Completado)

**Aplicabilidad**: ✅ Universal — Todos los tipos de proyecto

**Campos clave**:
- `name`, `description`, `location`
- `project_type` → Contexto descriptivo (rural, urbano, institucional, etc.)
- `latitude`, `longitude` → Geolocalización
- `status` → Estado del flujo de trabajo

---

## BLOQUE B — Caracterización de Demanda

**Propósito**: Cuantificar la población beneficiaria y estimar la demanda de agua.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **2** | Población y Censo | `/population` | `PopulationForm.tsx` | `project_calculations` |
| **3** | Población Estacional | `/floating-population` | `FloatingPopulationForm.tsx` | `project_seasonal_data` |
| **5** | Consumo de Agua | `/consumption` | `ConsumptionForm.tsx` | `project_consumption` |

**Función técnica**:

### Paso 2: Población y Censo
- Proyección demográfica mediante método geométrico o aritmético
- Cálculo de población de diseño (horizonte de 20-25 años)
- Datos de entrada: población actual, tasa de crecimiento, período de diseño

### Paso 3: Población Estacional
- Ajuste de demanda por población flotante (turismo, estacionalidad)
- Factor de mayoración de demanda en temporada alta
- Aplicable a zonas turísticas, hoteles, campamentos, fincas vacacionales

### Paso 5: Consumo de Agua
- Dotaciones per cápita según nivel de complejidad (RAS 2000)
- Dotación neta, dotación bruta (incluyendo pérdidas)
- Consumos comerciales, industriales, institucionales

**Aplicabilidad**: ✅ Universal — Rural, urbano, institucional, residencial

**Salidas del bloque**:
- Población de diseño (habitantes)
- Dotación neta y bruta (L/hab/día)
- Demanda total ajustada por estacionalidad

---

## BLOQUE C — Caracterización de la Fuente Hídrica

**Propósito**: Identificar, caracterizar y evaluar la disponibilidad y calidad de la fuente de agua.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **4** | Fuente de Agua | `/source` | `SourceForm.tsx` | `project_sources` |
| **6** | Calidad del Agua | `/quality` | `QualityForm.tsx` | `project_water_quality` |

**Función técnica**:

### Paso 4: Fuente de Agua
- Tipo de fuente: superficial (río, quebrada, lago), subterránea (pozo, manantial), lluvia
- Caudal disponible (L/s)
- Coordenadas de captación
- Evaluación de oferta vs demanda

### Paso 6: Calidad del Agua
- Parámetros fisicoquímicos: pH, turbiedad, color, temperatura, conductividad
- Parámetros químicos: metales pesados, nitratos, fluoruros, cloruros
- Parámetros microbiológicos: coliformes totales, E. coli
- Comparación con normativa vigente (Resolución 2115 de 2007 en Colombia)

**Aplicabilidad**: ✅ Universal — La calidad de la fuente determina el tren de tratamiento

**Salidas del bloque**:
- Caracterización completa de la fuente
- Diagnóstico de calidad (apta/requiere tratamiento)
- Identificación de parámetros críticos a remover

---

## BLOQUE D — Diseño Hidráulico y Almacenamiento

**Propósito**: Calcular caudales de diseño, dimensionar infraestructura de almacenamiento y conducción.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **7** | Caudales de Diseño | `/caudales` | `CaudalesForm.tsx` | `project_calculations` |
| **8** | Almacenamiento | `/tank` | `TankForm.tsx` | `project_calculations` |
| **9** | Conducción | `/conduccion` | `ConduccionForm.tsx` | `project_conduccion` |

**Función técnica**:

### Paso 7: Caudales de Diseño
- **Qmd** (Caudal medio diario): Demanda promedio diaria
- **QMD** (Caudal máximo diario): Qmd × k1 (1.2 - 1.3)
- **QMH** (Caudal máximo horario): QMD × k2 (1.4 - 1.6)
- Factores de mayoración según nivel de riesgo (RAS 2000)

### Paso 8: Almacenamiento
- Volumen de regulación (compensar variaciones horarias)
- Volumen de reserva para emergencias e incendios
- Dimensionamiento geométrico del tanque (circular, rectangular)
- Especificaciones constructivas

### Paso 9: Conducción
- Diseño hidráulico de tubería (ecuación de Hazen-Williams o Darcy-Weisbach)
- Selección de diámetro y material (PVC, HG, PEAD)
- Cálculo de pérdidas por fricción
- Verificación de velocidades admisibles (0.6 - 3.0 m/s)

**Aplicabilidad**:
- ✅ Caudales: Universal
- ✅ Almacenamiento: Aplica excepto en plantas industriales de flujo continuo
- ✅ Conducción: Universal (agua potable, aguas residuales, reutilización)

**Salidas del bloque**:
- Caudales de diseño (Qmd, QMD, QMH en L/s)
- Volumen de tanque (m³)
- Especificaciones de tubería (diámetro, material, longitud)

---

## BLOQUE E — Tratamiento Primario y Secundario

**Propósito**: Diseñar unidades de tratamiento para remoción de contaminantes.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **10** | Desarenador | `/desarenador` | `DesarenadorForm.tsx` | `project_desarenador` |
| **11** | Ensayo de Jarras | `/jar-test` | `JarTestForm.tsx` | `project_jar_test` |
| **12** | Filtro Lento de Arena | `/filtro-lento` | `FiltroLentoForm.tsx` | `project_filtros_lentos` |
| **13** | Ingeniería Compacta | `/compact-design` | `CompactDesignForm.tsx` | `project_compact_ptap` |

**Función técnica**:

### Paso 10: Desarenador
- Remoción de sólidos sedimentables (arenas, limos)
- Diseño de cámara de sedimentación (largo, ancho, profundidad)
- Cálculo de tiempo de retención hidráulico
- Aplicable a fuentes superficiales con turbiedad media-alta

### Paso 11: Ensayo de Jarras (Jar Test)
- Determinación de dosis óptima de coagulante (sulfato de aluminio, PAC)
- Protocolo estándar de prueba (velocidad de mezcla rápida, lenta, sedimentación)
- Selección de pH óptimo de coagulación
- Fundamento para diseño de floculación y sedimentación

### Paso 12: Filtro Lento de Arena
- Filtración biológica y física mediante lecho de arena
- Tasas de filtración bajas (0.1 - 0.3 m/h)
- Dimensionamiento: área de filtro, espesor de lecho, grava soporte
- Tecnología apropiada para sistemas pequeños a medianos (< 10 L/s)

### Paso 13: Ingeniería Compacta (PTAP Compacta)
- Plantas compactas de tratamiento (coagulación-sedimentación-filtración)
- Diseño de unidades integradas
- Aplicable a caudales medianos (5 - 100 L/s)
- Soluciones urbanas, rurales, institucionales

**Aplicabilidad**: ⚠️ **Condicional según calidad de fuente**

| Tipo de Fuente | Módulos Aplicables |
|----------------|-------------------|
| Agua superficial turbia (>50 NTU) | Desarenador + Jar Test + Compacta |
| Agua superficial clara (<25 NTU) | Filtro Lento únicamente |
| Agua subterránea de calidad | Solo desinfección (módulos no aplican) |
| Agua de mar | Desalinización (fuera del alcance actual) |

**Nota crítica**: Estos módulos **NO son obligatorios para todos los proyectos**. El ingeniero debe seleccionar los módulos relevantes según el diagnóstico del Bloque C (Calidad del Agua).

**Salidas del bloque**:
- Dimensiones de unidades de tratamiento
- Especificaciones de operación (dosis de químicos, tasas de filtración)
- Criterios de mantenimiento

---

## BLOQUE F — Evaluación Técnica y Económica

**Propósito**: Estimar costos operativos, evaluar viabilidad de sitio y seleccionar tecnología óptima.

| Paso | Módulo | Ruta | Componente | Tabla DB |
|------|--------|------|------------|----------|
| **14** | Costos (OpEx) | `/costs` | `OpexForm.tsx` | `project_opex` |
| **15** | Viabilidad y O&M | `/viability` | `ViabilityForm.tsx` | `project_viability` |
| **16** | Selección de Tecnología | `/tech-selection` | `TechSelectionMatrix.tsx` | `project_tech_matrix` |

**Función técnica**:

### Paso 14: Costos Operativos (OpEx)
- **Químicos**: Coagulante, desinfectante (cloro, hipoclorito)
- **Energía**: Bombeo, iluminación
- **Personal**: Operador, fontanero
- **Mantenimiento preventivo**: Repuestos, herramientas
- **Administración**: Papelería, servicios públicos
- Cálculo de costo mensual y costo por m³ tratado

### Paso 15: Viabilidad de Sitio y O&M
- **Accesibilidad**: Vías de acceso, distancia a centros poblados
- **Disponibilidad de insumos**: Químicos, energía eléctrica, repuestos
- **Capacidad operativa**: Personal técnico disponible, capacitación
- **Disponibilidad de terreno**: Espacio suficiente para construcción
- Valoración cualitativa (Alto, Medio, Bajo)

### Paso 16: Selección de Tecnología (Matriz Multicriterio)
- Comparación técnica de alternativas tecnológicas
- Criterios ponderados: costo, complejidad, mantenimiento, eficiencia, escalabilidad
- Metodologías: AHP (Proceso Analítico Jerárquico), matriz ponderada
- Justificación técnica de la tecnología seleccionada

**Aplicabilidad**: ✅ Universal — Todo proyecto requiere evaluación económica y de viabilidad

**Salidas del bloque**:
- Presupuesto operativo anual
- Diagnóstico de viabilidad técnica
- Ranking de tecnologías y justificación de selección

---

## BLOQUE G — Documentación y Entregables

**Propósito**: Consolidar toda la información en un documento técnico exportable.

| Paso | Módulo | Ruta | Componente | Tablas DB |
|------|--------|------|------------|----------|
| **📄** | Informe Final | `/report` | `ProjectReport.tsx` | Todas (consolidación) |

**Función técnica**:
- Generación automática de memoria técnica completa
- Incluye todos los cálculos, tablas, gráficos y resultados
- Formato exportable (PDF/HTML)
- Cumplimiento de estándares de documentación técnica

**Aplicabilidad**: ✅ Universal — Todo proyecto requiere documentación formal

**Contenido del informe**:
1. Información general del proyecto
2. Caracterización de demanda y oferta
3. Diseño hidráulico
4. Diseño de tratamiento
5. Evaluación económica
6. Conclusiones y recomendaciones
7. Anexos técnicos

---

## Tipo de Proyecto como Contexto (NO como Flujo)

### Concepto Técnico

El campo `project_type` en la tabla `projects` es un **metadato contextual descriptivo** que caracteriza el proyecto sin alterar su estructura.

**Tipos de proyecto disponibles**:
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

### Contexto vs Flujo

| Aspecto | Contexto (Implementado ✅) | Flujo (NO implementado ❌) |
|---------|---------------------------|----------------------------|
| **Definición** | Metadato descriptivo | Secuencia de pasos diferente |
| **Rutas** | Mismas rutas para todos | Rutas distintas por tipo |
| **Código** | Sin duplicación | Código duplicado |
| **Mantenibilidad** | Alta | Baja |
| **Flexibilidad** | Total | Restrictiva |

### Uso Actual del Contexto

1. **Creación de proyecto**: El usuario selecciona el tipo al crear el proyecto (`/dashboard/new`)
2. **Edición**: Puede modificarse en "Información General" (`/general`)
3. **Visualización**: Se muestra en el dashboard y en el informe final
4. **NO afecta**: Rutas, cálculos, validaciones, módulos disponibles

### Uso Futuro (Evolución Recomendada)

**Corto plazo (0-3 meses)**:
- Valores predeterminados por contexto (ej: dotación rural = 120 L/hab/día)
- Advertencias contextuales (ej: "PTAP compacta puede ser sobredimensionada para contexto rural")

**Mediano plazo (3-6 meses)**:
- Filtros en dashboard por tipo de proyecto
- Plantillas predefinidas con datos de ejemplo
- Personalización de secciones del informe según contexto

**Largo plazo (6-12 meses)**:
- Sistema de recomendación de tecnologías basado en contexto + calidad + caudal
- Módulos marcables como "No Aplica" (opcional)
- Wizard de creación con selección guiada de módulos relevantes

**IMPORTANTE**: Todas estas evoluciones **respetan el flujo único universal**. El contexto solo aporta valores predeterminados y recomendaciones, **nunca restringe funcionalidad**.

---

## Aplicabilidad de Módulos por Tipo de Proyecto

### Tabla de Aplicabilidad

| Módulo | Rural | Urbano | Residencial | Institucional | Industrial | Aguas Residuales |
|--------|:-----:|:------:|:-----------:|:-------------:|:----------:|:----------------:|
| 1. Info General | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2. Población | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| 3. Población Estacional | ⚠️ | ⚠️ | ✅ | ⚠️ | ❌ | ❌ |
| 4. Fuente de Agua | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 5. Consumo | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| 6. Calidad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7. Caudales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8. Almacenamiento | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| 9. Conducción | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10. Desarenador | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| 11. Jar Test | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| 12. Filtro Lento | ⚠️ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ |
| 13. Compacta | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ | ❌ |
| 14. OpEx | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15. Viabilidad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16. Selección | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 📄 Informe | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Leyenda**:
- ✅ Siempre aplicable
- ⚠️ Condicional (depende de calidad de fuente, escala, etc.)
- ❌ Generalmente no aplicable (pero el módulo no se oculta)

**Nota**: Todos los módulos permanecen **visibles y accesibles** independientemente del tipo de proyecto. Esta tabla es solo orientativa para el ingeniero.

---

## Principios de Diseño del Sistema

### 1. Flujo Único Universal
- Un solo flujo de trabajo sirve para todos los tipos de proyecto
- Evita duplicación de código y mantiene consistencia

### 2. Contexto como Metadata
- El `project_type` es descriptivo, no prescriptivo
- NO controla rutas ni módulos disponibles

### 3. Flexibilidad del Ingeniero
- El usuario puede usar todos los módulos sin restricciones
- Permite adaptar la metodología al caso específico

### 4. Módulos Opcionales Conceptuales
- No todos los módulos aplican a todos los proyectos
- El ingeniero decide qué módulos llenar según su criterio técnico

### 5. Escalabilidad sin Fragmentación
- Agregar nuevos tipos de proyecto NO requiere duplicar código
- Solo se agrega el tipo al arreglo `projectTypes`

### 6. Mantenibilidad
- Mejoras al flujo se propagan automáticamente a todos los tipos
- Reduce superficie de bugs y facilita testing

---

## Arquitectura de Base de Datos

### Tablas Relacionales

```
projects (1)
  ├─→ project_calculations (1:1)
  ├─→ project_seasonal_data (1:1)
  ├─→ project_sources (1:1)
  ├─→ project_consumption (1:1)
  ├─→ project_water_quality (1:1)
  ├─→ project_conduccion (1:1)
  ├─→ project_treatment (1:1)
  ├─→ project_desarenador (1:1)
  ├─→ project_jar_test (1:1)
  ├─→ project_filtros_lentos (1:1)
  ├─→ project_compact_ptap (1:1)
  ├─→ project_opex (1:1)
  ├─→ project_viability (1:1)
  └─→ project_tech_matrix (1:1)
```

**Tabla principal**: `projects`
- Contiene: `id`, `user_id`, `name`, `description`, `location`, **`project_type`**, `status`, `latitude`, `longitude`, `created_at`, `updated_at`

**Tablas secundarias**: Una por cada módulo técnico (relación 1:1 con `projects`)

**Normalización**: Tercera forma normal (3NF)
- Evita redundancia de datos
- Facilita consultas específicas por módulo
- Permite agregar/eliminar módulos sin afectar otros

---

## Rutas y Navegación

### Estructura de Rutas

```
/dashboard                          → Listado de proyectos
/dashboard/new                      → Crear nuevo proyecto
/dashboard/projects/[id]            → Redirect a /general
/dashboard/projects/[id]/general    → Paso 1
/dashboard/projects/[id]/population → Paso 2
/dashboard/projects/[id]/floating-population → Paso 3
... (etc, hasta)
/dashboard/projects/[id]/report     → Informe Final
```

**Layout compartido**: `/dashboard/projects/[id]/layout.tsx`
- Renderiza `ProjectSidebar` (navegación)
- Renderiza `ProjectSummary` (panel lateral derecho)
- Renderiza `children` (contenido del módulo)

**Navegación libre**: El usuario puede saltar entre módulos sin restricciones de secuencia

---

## Componentes Principales

### `ProjectSidebar.tsx`
- Lista los 16 pasos + informe final
- Resalta el módulo activo
- **Clasificación interna agregada mediante comentarios** (ver código)

### `GeneralInfoForm.tsx`
- Formulario de información general
- Incluye selector de `project_type`
- Campo `status` para estado del proyecto

### Componentes de Formularios (20 archivos)
- Cada módulo tiene su propio componente de formulario
- Patrón consistente: Recibe `projectId` e `initialData`, gestiona estado local, guarda en Supabase

### `ProjectReport.tsx`
- Consolida datos de todas las tablas
- Genera documento técnico completo
- Formato imprimible/exportable

---

## Evolución Futura

### Próximos Pasos Recomendados

**Corto plazo (0-3 meses)**:
1. ✅ **Documentación interna** (este archivo)
2. ✅ **Comentarios en código** (`ProjectSidebar.tsx`)
3. ✅ **Actualización de README** con diagrama de bloques

**Mediano plazo (3-6 meses)**:
1. Valores predeterminados por `project_type`
2. Validaciones y advertencias contextuales
3. Indicadores de progreso del proyecto

**Largo plazo (6-12 meses)**:
1. Sistema de módulos marcables como "No Aplica"
2. Plantillas predefinidas por tipo de proyecto
3. Wizard de creación con guía inteligente

### Funcionalidades Avanzadas (Futuro)

- **Sistema de recomendaciones**: IA que sugiere tecnologías según contexto + calidad + caudal
- **Comparación de proyectos**: Benchmarking entre proyectos similares
- **Gestión de versiones**: Historial de cambios en cálculos
- **Colaboración multi-usuario**: Múltiples ingenieros trabajando en el mismo proyecto
- **Integración GIS**: Mapas interactivos con geolocalización de proyectos

---

## Glosario Técnico

- **OpEx**: Operational Expenditure (Gastos Operativos)
- **Qmd**: Caudal medio diario (m³/día o L/s)
- **QMD**: Caudal máximo diario
- **QMH**: Caudal máximo horario
- **RAS 2000**: Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico (Colombia)
- **NTU**: Nephelometric Turbidity Units (Unidades Nefelométricas de Turbiedad)
- **PTAP**: Planta de Tratamiento de Agua Potable
- **O&M**: Operación y Mantenimiento

---

## Referencias Normativas

- **RAS 2000** (Colombia): Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico
- **Resolución 2115 de 2007** (Colombia): Calidad del agua potable
- **OMS**: Guías para la calidad del agua de bebida
- **AWWA**: American Water Works Association - Standards

---

**Fin del documento — Estructura Técnica del Proyecto**
