# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [v1.0.0-beta] - 2026-01-27

### Lanzamiento Beta Pública
- **Landing Page**: Nueva portada profesional con diseño "Engineering Navy", responsive y blueprint técnico animado.
- **Mobile First**: Optimización completa del Dashboard y Sidebar para dispositivos móviles.
- **Auth**: Solución a problema de "Invalid Refresh Token" con auto-logout y manejo de errores.

### Infraestructura
- **Tailwind v4**: Migración a última versión de Tailwind CSS.
- **Vercel**: Configuración de variables de entorno y despliegue público sin password.

## [Desarrollo] - 2026-01-23

### Consolidación Técnica
- **Documentación**: Creados `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md` y `CHANGELOG.md`.
- **Limpieza**: Eliminación de activos no utilizados (screenshots y SVGs default).
- **Refactorización**:
  - Centralización de constantes en `src/constants/project.ts`.
  - Renombrado semántico de `role` a `user_type` en el registro de usuarios.
  - Actualización de formularios para usar constantes centralizadas.
- **Estabilidad**: Definición de zonas críticas y mapa de riesgos técnicos.

## [v0.1.0] - Versión Inicial

### Funcionalidades
- Dashboard de proyectos.
- Diagrama de Decisión Funcional (Dominio, Contexto, Nivel).
- Flujo universal de 16 módulos técnicos.
- Integración completa con Supabase (Auth + DB + RLS).
- Generación de informe técnico preliminar.
