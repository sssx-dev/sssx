# Differential Builds

`sssx diff` only rebuilds pages affected by changes.

## How it works

1. **Dependency graph** — tracks which source files affect which routes
2. **File change detection** — compares file mtimes against last build
3. **Affected route resolution** — finds all routes impacted by changes:
   - Direct: the changed file's route
   - Taxonomy: tag/category pages sharing values with changed content
   - Layout: if `+layout.svelte` changed, all routes rebuild

## Usage

```shell
# First run: full build + saves dependency graph
sssx diff

# Subsequent runs: only rebuilds what changed
sssx diff
```

## Example output

```
  Differential build
  Changed files:   1
    ~ src/content/posts/hello.md
  Affected routes: 4
  ✓ /posts/hello/           (45ms)
  ✓ /tags/javascript/       (38ms)    ← shares "javascript" tag
  ✓ /tags/svelte/           (35ms)    ← shares "svelte" tag
  ✓ /blog/page/1/           (40ms)    ← lists posts

  Diff Build Summary
  Routes rebuilt:  4 / 156 total
```

## Tracked dependencies

| Source | Affects |
|--------|---------|
| `*.md` content file | Its own route + taxonomy pages with shared tags |
| `*.json` data file | All routes in same directory |
| `+layout.svelte` | All routes (full rebuild) |
| Image files | Routes in same content directory |

## Dependency graph file

The graph is stored in `.sssx-deps.json` (add to `.gitignore`). Delete it to force a full rebuild.
