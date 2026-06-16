# Polla Mundialista Familiar Rincón

Aplicación web para pronósticos deportivos familiares, diseñada para ser usable en móviles y escritorio sin autenticación tradicional.

## Stack
- React + Vite + TypeScript
- TailwindCSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Supabase + PostgreSQL + RLS
- Vercel para hosting

## Arquitectura
- `src/components`
- `src/layouts`
- `src/pages`
- `src/hooks`
- `src/services`
- `src/types`
- `src/contexts`
- `src/assets`

## Desarrollo
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar local:
   ```bash
   npm run dev
   ```

## Base de datos
- `sql/supabase-schema.sql`
- `sql/rls-policies.sql`

## MVP
1. Selección simple de participante
2. Dashboard de pronósticos
3. Guardado de resultados
4. Ranking y estadísticas básicas
5. Panel administrador para mantenimiento
