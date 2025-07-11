# 🌊 Hydrostack

> **Plataforma open‑source para dimensionar plantas de tratamiento de agua (PTAR / PTAP), generar informes normativos y acelerar proyectos hídricos para comunidades, ingenieros y organismos gubernamentales.**

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/lucesdata/hydrostack/ci.yml?label=Build&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/PRs-welcome-purple?style=for-the-badge"/>
</p>

---

## ✨ Motivación

La brecha entre el **diseño conceptual** de una planta de tratamiento y su **validación ante autoridad ambiental** suele ser costosa y lenta. Hydrostack nace para:

1. Democratizar el acceso a **herramientas de cálculo** de alto nivel.
2. Reducir de **semanas a minutos** la elaboración de memorias de cálculo e informes.
3. Facilitar que **líderes comunitarios** impulsen proyectos de agua potable y saneamiento.

---

## 🗺️ Tabla de contenidos

1. [Características clave](#características-clave)
2. [Capturas](#capturas)
3. [Instalación rápida](#instalación-rápida)
4. [Stack & Arquitectura](#stack--arquitectura)
5. [Estructura del código](#estructura-del-código)
6. [Base de datos](#base-de-datos)
7. [Roadmap detallado](#roadmap-detallado)
8. [Contribuir](#contribuir)
9. [Créditos](#créditos)
10. [Licencia](#licencia)

---

## Características clave

* 🧮 **Motor de cálculos** desacoplado para dimensionar PTAR/PTAP (caudales, cargas, unidades de proceso).
* 📝 **Generador de informes** (PDF/Docx) con: memoria de cálculo, tablas de resultados, justificación legal.
* 📚 **Base legal versionada**: leyes, resoluciones y límites descargados por país (actualizable vía admin panel).
* 👥 **Gestión multi‑usuario**: roles *viewer*, *editor*, *admin*; proyectos colaborativos.
* 🌐 **API REST + OpenAPI 3.1** para integraciones con ERPs o portales gubernamentales.
* 🚀 **Deploy 1‑click** en Docker / Vercel / Fly.io.

---

## Capturas

> *Próximamente*: mock‑ups de Figma y capturas del prototipo.

---

## Instalación rápida

### Opción A — Docker Compose

```bash
# clonamos y arrancamos
git clone git@github.com:lucesdata/hydrostack.git && cd hydrostack
docker compose up -d      # levanta postgres + backend placeholder
```

### Opción B — Local (brew + Node)

```bash
# Base de datos
brew install postgresql@17
brew services start postgresql@17
createdb hydrostack_dev
psql hydrostack_dev -f schema.sql

# Backend (NestJS próximamente)
pnpm install && pnpm dev
```

> **Tip VS Code:** extensión *PostgreSQL* → conecta a `localhost:5432 / hydrostack_dev` para explorar tablas.

---

## Stack & Arquitectura

| Capa     | Tecnología                             | Notas                                          |
| -------- | -------------------------------------- | ---------------------------------------------- |
| Frontend | Next.js 14, Tailwind, shadcn/ui        | Wizard de dimensionamiento + dashboard         |
| Backend  | NestJS (TypeScript)                    | Autenticación JWT, lógica de negocio           |
| Cálculos | Librería propia (`@hydrostack/engine`) | Unit tests + posibilidad de usarla CLI         |
| DB       | PostgreSQL 17 + pgcrypto               | Esquema en `schema.sql`; triggers `updated_at` |
| Infra    | Docker + Compose, GitHub Actions       | CI/CD & despliegues                            |

![Arquitectura Logical](https://raw.githubusercontent.com/lucesdata/hydrostack-docs/main/diagrams/architecture_logical.png)

---

## Estructura del código

```
hydrostack/
├─ apps/
│  └─ api/                # Backend NestJS
├─ packages/
│  └─ engine/             # Motor de cálculos
├─ web/                   # Next.js frontend
├─ schema.sql             # Esquema de base de datos
├─ openapi.yaml           # API contract (en progreso)
├─ docker-compose.yml
└─ README.md
```

---

## Base de datos

`schema.sql` crea 7 tablas principales y 2 triggers de actualización automática. Carga inicial:

```bash
psql hydrostack_dev -f schema.sql
```

> **Seed legal:** script pendiente para poblar `regulations` y `parameter_limits`.

---

## Roadmap detallado

| Fase                           | Entregables                                         | Estado         |
| ------------------------------ | --------------------------------------------------- | -------------- |
| **1. Definición & alineación** | Workshop de producto, mapa de normativas, MVP scope | ✅ Completado   |
| **2. Prototipo UX**            | Wireframes Figma, arquitectura BD, API contract     | 🔄 En progreso |
| **3. MVP Alpha**               | Auth, cálculo PTAR simple, informes PDF             | ⏳ Q3 2025      |
| **4. Beta pública**            | Multi‑usuario, PTAP, docker deploy, docs            | ⏳ Q4 2025      |
| **5. Extensiones**             | Integración IoT, panel analíticas, multi‑idioma     | 🌓 2026        |

---

## Contribuir

1. **Fork** el repo y crea tu branch desde `main`.
2. Sigue la convención **Conventional Commits**.
3. Ejecuta `pnpm test` y `pnpm lint` antes de abrir la PR.
4. Para cambios en el motor de cálculos añade tests en `packages/engine/__tests__`.

> Nos encanta recibir problemas, discusiones y PRs ✨.

---

## Créditos

Proyecto creado por [@lucesdata](https://github.com/lucesdata) con la ayuda de colaboradores de la comunidad Hydrostack.

---

## Licencia

Hydrostack se publica bajo licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
