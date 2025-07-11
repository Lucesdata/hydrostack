# Hydrostack

> **Plataforma open‑source para dimensionar plantas de tratamiento de agua (PTAR/PTAP), generar informes normativos y gestionar proyectos hídricos.**

![Hydrostack Banner](https://img.shields.io/badge/Hydrostack-initial--commit-blue)

---

## Tabla de contenidos

1. [Características](#características)
2. [Instalación rápida](#instalación-rápida)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Base de datos](#base-de-datos)
5. [Roadmap](#roadmap)
6. [Contribuciones](#contribuciones)
7. [Licencia](#licencia)

---

## Características

* **Motor de cálculos** para dimensionar PTAR/PTAP.
* **Generador de informes PDF** con memoria de cálculo y referencias legales.
* **Base legal** versionada por país/ región.
* Multicuenta: **usuarios, organizaciones y líderes comunitarios**.

## Instalación rápida

```bash
# Clona el repo
git clone git@github.com:lucesdata/hydrostack.git && cd hydrostack

# Crea el entorno de base de datos (local)
brew services start postgresql@17         # macOS
createdb hydrostack_dev                   # primera vez únicamente
psql hydrostack_dev -f schema.sql         # carga las tablas

# (Próximamente) Levanta el backend
# docker compose up -d
```

> **Tip VS Code:** instala la extensión **PostgreSQL** y añade la conexión `localhost:5432 / hydrostack_dev` para explorar tablas y lanzar queries.

## Estructura del proyecto

```
hydrostack/
├─ schema.sql          # esquema PostgreSQL
├─ .gitignore
├─ README.md           # este archivo
├─ openapi.yaml        # definición de la API (por crear)
└─ docker-compose.yml  # orquestador de servicios (por crear)
```

## Base de datos

El archivo `schema.sql` crea las siguientes tablas:

* `users`, `projects`, `user_projects`
* `regulations`, `parameter_limits`, `process_units`, `reports`

Incluye triggers `trg_users_updated` y `trg_projects_updated` que mantienen el campo `updated_at`.

Para recargar el esquema en una base nueva:

```bash
psql nueva_bd -f schema.sql
```

## Roadmap

* [x] Definir esquema inicial PostgreSQL
* [ ] Escribir `openapi.yaml` (v0.1)
* [ ] Añadir `docker-compose.yml` (backend + DB)
* [ ] Implementar autenticación JWT
* [ ] Desarrollar wizard de dimensionamiento (frontend)
* [ ] Publicar sitio demo en Vercel/Fly.io

## Contribuciones

¡Las *pull requests* son bienvenidas! Por favor:

1. Crea un branch a partir de `main`.
2. Sigue la convención de commits [Conventional Commits](https://www.conventionalcommits.org/).
3. Asegúrate de que `prettier`/`eslint` pasan y que las pruebas (próximamente) corren.

## Licencia

Este proyecto se publica bajo la licencia MIT — ver el archivo **LICENSE** para más detalles.
