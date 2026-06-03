# Monorepo — Claude Context

Repositorio personal en GitHub: `TomiAndrade/monorepo` (rama principal: `main`, se trabaja directo en main).

## Proyectos

| Proyecto | Tipo | Ruta |
|---|---|---|
| `evidence-inventory` | Electron + Express + React | `projects/evidence-inventory/` |
| `file-quality-report` | CLI Node.js | `projects/file-quality-report/` |

Cada proyecto tiene su propio `package.json`. No hay workspace raíz.

## Convención de commits

```
feat(scope): descripción
fix(scope): descripción
chore(scope): descripción
```

Scope = nombre del proyecto (`evidence-inventory`, `file-quality-report`).

## Workflow con GitHub (GitFlow simplificado)

- `main` — producción, solo recibe merges desde `develop`.
- `develop` — rama de integración, acá van todos los cambios del día a día.
- Feature branches opcionales: `feat/nombre` desde `develop`, merge de vuelta a `develop`.
- Para mergear `develop` → `main`: PR en GitHub (o merge directo si es un proyecto personal sin revisores).
- No hay CI configurado todavía.

**Flujo típico:**
1. Trabajar en `develop` (o en `feat/algo` si el cambio es grande).
2. Commit con la convención de abajo.
3. Push a `origin/develop`.
4. Cuando el bloque de trabajo está estable, mergear a `main`.
