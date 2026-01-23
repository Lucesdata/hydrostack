# Política de Seguridad — HydroStack

## Versiones Soportadas

| Versión | Soportada |
|---------|-----------|
| 0.1.x   | ✅ Sí     |

## Reportar Vulnerabilidad

Si encuentras una vulnerabilidad de seguridad, por favor **no abras un issue público**. Contacta directamente al equipo técnico.

Incluye en tu reporte:
1. Descripción de la vulnerabilidad.
2. Pasos para reproducir (PoC).
3. Impacto potencial estimado.

## Prácticas de Seguridad en el Proyecto

- **Row Level Security (RLS)**: Habilitado obligatoriamente en todas las tablas de Supabase.
- **Validación de Datos**: Todos los inputs técnicos son validados en el cliente y mediante tipos en la DB.
- **Manejo de Secretos**: Nunca commitear archivos `.env.local` o credenciales.
- **Dependencias**: Mantener las dependencias actualizadas y revisar alertas de seguridad.
