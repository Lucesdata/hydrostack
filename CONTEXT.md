# HydroStack — Contexto del proyecto

## Qué es esto
Portafolio profesional estático de **Giovanni X. Guevara Duque** — Ingeniero de Procesos (Agua / Aguas Residuales / Industrial). **No es una SaaS, no hay login, no hay servicios de terceros.**

---

## Archivos principales

| Archivo | Descripción |
|---|---|
| `index.html` | Portafolio principal (ES). HTML/CSS/JS puro, 668 líneas |
| `assets/css/main.css` | Estilos globales, layout, variables |
| `assets/css/components.css` | Componentes: cards, skills, timeline, proyectos |
| `assets/js/main.js` | Scroll reveal, skill bars, counters, filtro proyectos |
| `assets/js/lang.js` | Selector ES/EN/FR (i18n) |
| `gemelos/voragine/PTAP_LaVoragine_i18n_v2.html` | Gemelo digital en producción |

---

## Datos reales del CV (Giovanni)

**Nombre:** Giovanni X. Guevara Duque  
**Título:** Ingeniero de Procesos · Agua / AR / Industrial  
**Ubicación:** Sant Feliu de Llobregat, Barcelona, España  
**Email:** lucesproject@gmail.com  
**Teléfono:** +34 673 506 760  

**Stats hero:** 11+ años · 42+ plantas/proyectos · 150k+ habitantes atendidos  

**Formación:** Licence en Sciences, Química e Ing. Química — UPEC Paris XII (2007–2013), beca gobierno colombiano  

**Idiomas:** Español (nativo), Francés (nativo/UPEC), Inglés (C1), Catalán (básico)  

**Herramientas:** EPA-SWMM · EPANET · Python (Pandas/NumPy) · Power BI · ArcGIS · SCADA/IoT · Django · React.js  

---

## Experiencia / Timeline (orden en HTML)

1. **2015–Presente** · INALDEX / Proyectos independientes — PTAR Cali 60 000 PE (EUR 6M), IOTIO (IoT/Django/React), gemelo PTAP La Vorágine, plantas lixiviados BMA
2. **2012–2015** · UAESP Bogotá — 37 sistemas rurales agua potable y saneamiento
3. **2010–2012** · FURESAS — Reactor UASB industrial (diseño, arranque, calibración)
4. **2007–2013** · UPEC Paris XII — Formación académica (beca gobierno colombiano)

---

## Proyectos (sección Portafolio)

| Proyecto | Categoría | Herramientas |
|---|---|---|
| PTAR Cali 60 000 PE · EUR 6M | sanitary | EPANET, EPA-SWMM, AutoCAD |
| 37 PTAPs rurales · UAESP | sanitary | EPANET, ArcGIS, Python |
| Gemelo digital PTAP La Vorágine | digital | Three.js, Chart.js, Motor HID |
| IOTIO — Plataforma IoT | digital | Django, React.js, Power BI |
| Plantas lixiviados · BMA | sanitary | EPA-SWMM, Python, ArcGIS |
| Reactor UASB · FURESAS | sanitary | EPANET, Python, SCADA |

Filtros: **Todos · Agua & Saneamiento · Digital & IoT**

---

## Skills (barras de progreso)

| Competencia | % |
|---|---|
| EPANET / EPA-SWMM | 92% |
| Ingeniería de procesos AR | 90% |
| Python / Pandas / NumPy | 82% |
| SCADA / IoT / Django | 85% |
| ArcGIS / Power BI | 80% |
| Gestión de obra pública | 85% |

---

## Gemelo Digital (sección destacada)

- **PTAP La Vorágine** — en producción, link: `gemelos/voragine/PTAP_LaVoragine_i18n_v2.html`
- Stack: Three.js r128 · Motor HID · LGH Canvas · SCADA Dashboard · Chart.js 4 · i18n ES/EN · Partículas de flujo · Raycasting 3D

---

## Preview server

```json
// .claude/launch.json (en worktree crazy-stonebraker)
{
  "name": "portfolio-static",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["serve", "/Users/giovannyguevaraduque/Desktop/hydrostack", "-l", "3001"],
  "port": 3001
}
```

Arrancar: en Claude Code usar `preview_start` con nombre `portfolio-static` → puerto 3001.

---

## Rama Next.js (paralela, no tocar)

- Worktree: `/Users/giovannyguevaraduque/Desktop/hydrostack/.claude/worktrees/crazy-stonebraker/`
- Rama: `claude/crazy-stonebraker`
- PR: https://github.com/Lucesdata/hydrostack/pull/1
- Es el rediseño SaaS con estética "Precision Hydrology" (ocean navy + teal bioluminiscente). **No mezclar con el portafolio estático.**

---

## Lo que NO hay en el portafolio

- ❌ Login / auth
- ❌ Datos de usuarios / formularios con backend
- ❌ Referencias a Irlanda
- ❌ Nombre "Alejandro Solano" (era el placeholder)
- ❌ Teléfono colombiano +57
- ❌ Email a.solano@hydrostack.co
- ❌ Bogotá como ubicación principal

---

## Pendientes sugeridos

- [ ] Actualizar versiones EN/FR de `index.html` (si existen en `en/` y `fr/`)
- [ ] Añadir foto real de perfil (reemplazar el avatar SVG en `.profile-avatar`)
- [ ] Actualizar links reales de LinkedIn / GitHub / ResearchGate en el footer
- [ ] Conectar formulario de contacto a un servicio real (Formspree / Netlify Forms)
