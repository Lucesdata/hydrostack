# Especificación Técnica: FIME Baseline v1.0
**HydroStack — Motor Rural de Alto Desempeño**

## 1. Declaración de Estatus
El sistema **FIME (Filtración en Múltiples Etapas)** es declarado formalmente como la **Tecnología Base (Baseline)** de HydroStack para proyectos de agua potable en contextos rurales y de difícil acceso. 

Representa el "Caso de Uso Normativo Primario", donde el asistente de IA y los motores de cálculo alcanzan su máxima precisión y auditoría técnica.

## 2. Supuestos de Diseño
El motor de cálculo FIME de HydroStack asume los siguientes principios de ingeniería:

1.  **Barreras Múltiples**: La potabilización se logra mediante la suma de eficiencias de remoción física y biológica, no por una única unidad crítica.
2.  **Soberanía del Ingeniero**: El sistema sugiere dimensiones basadas en caudales proyectados y calidad de fuente, pero el ingeniero tiene la responsabilidad final de ajustar gradientes y velocidades.
3.  **Prioridad de Flujo**: Se prioriza el funcionamiento por gravedad extrema a extrema, minimizando la dependencia de energía externa.
4.  **Cero Químicos Críticos**: El tren de tratamiento (E1-E7) busca garantizar la potabilización física y microbiológica sin dependencia de coagulantes químicos en la fase biológica.

## 3. Límites de Aplicación
| Parámetro | Límite Recomendado | Razón Técnica |
|-----------|---------------------|---------------|
| Turbiedad entrada | < 250 UNT (Picos) | Evita colmatación prematura del FGD/FGA. |
| Turbiedad entrada (Media) | < 50 UNT | Carga ideal para alta eficiencia biológica en FLA. |
| Caudal nominal | < 25 L/s | Escala ideal para gestión comunitaria y rural. |
| Población | < 10,000 hab | Límite para mantener simplicidad operativa. |

## 4. Relación con Normativa (RAS / OMS)
FIME Baseline v1.0 se alinea con los siguientes estándares:

-   **Colombia (RAS 0330)**: Cumple con los lineamientos de filtración lenta y prefiltración de grava para pequeños municipios.
-   **OMS (WHO Guidelines)**: Adopta la Filtración Lenta como la tecnología más confiable para la remoción de quistes (Giardia/Cryptosporidium) en medios rurales.
-   **Remoción Logarítmica**: El balance de masas audita una remoción mínima de **4 Logs de patógenos** para declarar un diseño como seguro.

## 5. Módulos del Tren de Tratamiento (E1-E7)
1.  **E1. Pretratamiento**: Captación y desarenación. Protección mecánica.
2.  **E2. FGD**: Filtro Grueso Dinámico. Fusible hidráulico ante picos de lluvia.
3.  **E3. FGA/D**: Filtro Grueso Ascendente/Descendente. Reducción de carga de sólidos.
4.  **E4. FLA**: Filtro Lento de Arena. Corazón sanitario y barrera biológica.
5.  **E5. Hidráulica**: Balance de niveles y pérdidas de carga.
6.  **E6. Implantación**: Layout espacial y operatividad.
7.  **E7. Balance de Masas**: Auditoría final de potabilidad y cumplimiento normativo.
