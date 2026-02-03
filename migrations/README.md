# Migraciones de Base de Datos - FiME Design

Esta carpeta contiene las migraciones SQL necesarias para las nuevas funcionalidades del Asistente de Diseño FiME.

## Archivo: `fime_design_tables.sql`

### Tablas Creadas

1. **`project_fgac_design`** - Filtro Grueso Ascendente en Capas
2. **`project_weir_control`** - Control y Vertederos de Aforo
3. **`project_risk_analysis`** - Análisis de Riesgo y Vulnerabilidad

### Cómo Ejecutar la Migración

#### Opción 1: Supabase Dashboard (Recomendado)

1. Accede a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto HYDROSTACK
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **+ New query**
5. Copia y pega el contenido completo de `fime_design_tables.sql`
6. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
7. Verifica que el output muestre:
   ```
   FiME Design Tables Migration completed successfully!
   - project_fgac_design ✓
   - project_weir_control ✓
   - project_risk_analysis ✓
   All tables have Row Level Security enabled.
   ```

#### Opción 2: Supabase CLI

```bash
# Si tienes el CLI de Supabase instalado
supabase migration new fime_design_tables
# Copia el contenido de fime_design_tables.sql al archivo generado
# Luego ejecuta:
supabase db push
```

### Verificación Post-Migración

Ejecuta esta consulta en el SQL Editor para verificar que las tablas fueron creadas correctamente:

```sql
SELECT 
    table_name, 
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'project_fgac_design', 
    'project_weir_control', 
    'project_risk_analysis'
)
ORDER BY table_name;
```

### Rollback (si es necesario)

Si necesitas revertir esta migración:

```sql
DROP TABLE IF EXISTS project_risk_analysis CASCADE;
DROP TABLE IF EXISTS project_weir_control CASCADE;
DROP TABLE IF EXISTS project_fgac_design CASCADE;
```

⚠️ **Advertencia**: Esto eliminará todos los datos almacenados en estas tablas.

## Seguridad

Todas las tablas incluyen:
- ✅ Row Level Security (RLS) activado
- ✅ Políticas de acceso basadas en `auth.uid()`
- ✅ Relaciones `ON DELETE CASCADE` con la tabla `projects`
- ✅ Constraints para validar rangos de valores

Solo los usuarios propietarios de un proyecto pueden acceder a sus datos FiME.
