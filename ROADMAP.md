# Roadmap de implementación

## MVP inmediata
1. Configurar proyecto Vite + React + TypeScript + TailwindCSS.
2. Crear esquema Supabase con tablas para torneos, participantes, equipos, partidos, pronósticos, reglas de puntaje y preguntas especiales.
3. Desarrollar pantalla de inicio con selección de participante sin autenticación.
4. Generar dashboard básico con resumen de próximos partidos y estadísticas.
5. Implementar página de pronósticos con tarjetas de partido y guardado de resultados.
6. Construir ranking atractivo y tabla de posiciones.
7. Añadir panel administrador para creación y edición de datos.
8. Preparar servicios desacoplados y hooks para futuras APIs externas.

## Fase 2
- Integrar Supabase Auth con identidades de participante mediante enlaces mágicos o tokens admin si se decide una experiencia segura.
- Implementar sincronización de partidos desde API-Football / Football-Data.
- Registrar resultados oficiales y recalcular puntajes automáticamente.
- Crear exportación a Excel desde Supabase y frontend.
- Añadir módulos de estadísticas avanzadas y métricas de tendencias.

## Fase 3
- Soporte multi-torneo con selección dinámica del campeonato.
- Rol de administrador con panel dedicado y control de acceso separado.
- Diseño con animaciones de balones, banderas y UI deportiva más rica.
- Soporte para notificaciones push web y actualizaciones en tiempo real via Supabase Realtime.

## Buenas prácticas aplicadas
- Estructura en `components`, `layouts`, `pages`, `hooks`, `services`, `types`, `contexts`.
- Diseño mobile-first y responsive con TailwindCSS.
- Servicios desacoplados para integrar APIs externas en el futuro.
- Hooks con TanStack Query para caching, sincronización y estados de carga.
- Tipos TypeScript sólidos para datos de dominio.
- Políticas RLS como base para seguridad de datos.
- Código legible y modular siguiendo principios SOLID y Clean Architecture.

## Estrategia de escalabilidad
- Separar lógica de UI en componentes reutilizables.
- Mantener servicios independientes del framework de UI.
- Utilizar Supabase como backend escalable con PostgreSQL y RLS.
- Preparar integración de Edge Functions para automatismos y tareas cron.
- Validación con Zod y React Hook Form para formularios confiables.
