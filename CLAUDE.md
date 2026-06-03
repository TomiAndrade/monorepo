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

## Workflow con GitHub

- Rama única: `main`. No se usan feature branches por ahora.
- Push directo a `origin/main` al terminar cada bloque de trabajo.
- No hay CI configurado todavía.
