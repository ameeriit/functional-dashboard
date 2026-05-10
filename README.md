# Functional Dashboard

A Next.js 16 dashboard built with React 19, Tailwind CSS v4, and shadcn/ui (radix-lyra style).

## Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- **UI**: [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/)
- **Language**: TypeScript
- **Tooling**: ESLint (with import-boundary enforcement), Prettier, pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command          | What it does                                |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Run the dev server with Turbopack           |
| `pnpm build`     | Production build                            |
| `pnpm start`     | Run the production build                    |
| `pnpm lint`      | Lint the codebase (incl. import boundaries) |
| `pnpm format`    | Format `.ts` / `.tsx` with Prettier         |
| `pnpm typecheck` | TypeScript no-emit typecheck                |

### Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

Components land in `shared/ui/` per the aliases in `components.json`.

## Architecture

The codebase has a two-layer split: **`app/` is routing only**, and **`views/` holds page implementations**. Pages live in `views/`, and route files in `app/` are thin shells that fetch data and render the matching view component.

```
app/                    Next.js routes only (page.tsx, layout.tsx, route.ts)
views/                  Page implementations, one folder per view
shared/
├── ui/                 Generic shadcn primitives
├── lib/                Generic utilities (cn, format helpers)
├── layout/             Layout shells (AppShell, ...)
└── common/             Concrete app-level chrome (AppSidebar, SiteHeader)
providers/              App-wide React providers (theme, ...)
hooks/                  Generic React hooks
```

### Always use alias imports

Never use relative `./` or `../`. Always use the workspace alias roots:

| Alias           | Maps to                             |
| --------------- | ----------------------------------- |
| `@/app/*`       | `./app/*`                           |
| `@/views/*`     | `./views/*`                         |
| `@/shared/*`    | `./shared/*`                        |
| `@/providers/*` | `./providers/*`                     |
| `@/hooks/*`     | `./hooks/*`                         |
| `@/*`           | fallback for shadcn-generated paths |

```ts
// BAD
import { UsersTable } from "./_components/users-table"
import type { User } from "../entities/types"

// GOOD
import { UsersTable } from "@/views/users/_components/users-table"
import type { User } from "@/views/users/entities/types"
```

The repo ships `.vscode/settings.json` setting `importModuleSpecifier: "non-relative"` so the editor proposes `@/...` paths in autocomplete. Cross-layer imports are also enforced statically by ESLint — see [Statically enforced invariants](#statically-enforced-invariants) below.

### The recursive shape (one-folder-removal rule)

The whole architecture is **one shape, applied recursively**. At any depth, a "thing" is:

```
<thing>.tsx                  the main file (named export <Thing>)
<thing>/                     companion folder for everything private to <thing>
├── api/                     data layer (fetchers, mutations). Optional.
│   └── <thing>-data.ts
├── entities/                domain types. Optional.
│   └── types.ts
├── _components/             UI-only private pieces. Optional.
│   └── <piece>.tsx
└── <sub-feature>/           sub-feature WITH its own data layer. Optional. Recurses.
    ├── <sub-feature>-section.tsx
    ├── api/
    ├── entities/
    ├── _components/
    └── <nested-sub-feature>/
```

**The guarantee**: to delete any feature or sub-feature at any depth, **delete its folder and remove its single import line** in the parent. Nothing else.

A view is just this shape applied at the top of a view folder. A complex sub-component is the same shape applied inside `_components/`. A sub-sub-feature inside a sub-feature is again the same shape. There is no special "view-only" syntax.

#### Concrete examples

**View level:**

```
views/users/
├── users-page.tsx              MAIN component <UsersPage>
├── api/
│   └── users-data.ts
├── entities/
│   └── types.ts
└── _components/
    └── users-table.tsx
```

**View with a top-level sub-feature** (Activity has its own data layer):

```
views/overview/
├── overview-page.tsx
├── api/overview-data.ts
├── entities/types.ts
├── _components/
│   └── stats-grid.tsx
└── activity/                   sub-feature
    ├── activity-section.tsx    MAIN component <ActivitySection>
    ├── api/activity-data.ts
    ├── entities/types.ts
    └── _components/
        └── activity-chart.tsx
```

**Sub-feature deep inside a sub-component** (delete-user is a feature private to the table):

```
views/users/_components/
├── users-table.tsx
└── users-table/
    ├── _components/                UI-only pieces of the table
    │   └── row.tsx
    └── delete-user/                sub-feature WITH own data layer (mutation)
        ├── delete-user-section.tsx MAIN component <DeleteUserSection>
        ├── api/
        │   └── delete-user.ts      the actual mutation
        └── _components/
            └── confirm-dialog.tsx
```

To remove the delete feature: `rm -rf views/users/_components/users-table/delete-user/` and remove the import in `users-table.tsx`. The feature is gone — no other file in the codebase needs to change.

### Sub-feature vs `_components/` decision

Use this matrix at every level:

| Concern                                                     | Where it goes                                             |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| UI-only piece (no own fetcher, no own domain type)          | sibling `_components/<piece>.tsx`                         |
| Operation dialog/form that just calls back into the parent  | sibling `_components/create-<entity>-dialog.tsx`          |
| Independent data + types (own fetcher, mutation, or entity) | sibling `<sub-feature>/` folder mirroring the shape above |

Naming:

- Folder name is the feature noun in kebab-case: `activity/`, `delete-user/`, `recent-orders/`, `team-invites/`.
- Main file is `<feature>-section.tsx` (or `-panel.tsx`, `-widget.tsx`) and exports a named `<FeatureSection>` component. Do **not** name the file `<feature>.tsx` exporting `<Feature>` — it stutters in imports and frequently collides with library names (e.g., `Activity` from lucide).
- Operation prefixes for namespacing inside `_components/`: `create-<entity>-dialog.tsx`, `delete-<entity>-confirm.tsx`.

### View-local helpers, hooks, tests

- **Generic helpers** go in `@/shared/lib/`. Helpers tightly coupled to a single fetcher live next to it inside that level's `api/`. There is no per-view `lib/` folder.
- **View-local hooks** live as siblings, following the same shape: `<thing>/_hooks/use-<thing>.ts`, or — when the hook is private to one component and small — colocated inside the component file. Generic, app-wide hooks live in `@/hooks`.
- **Tests are colocated**: `<file>.test.ts(x)` next to `<file>`. Removing a feature folder also removes its tests. No top-level `tests/`.

### Server vs client components

Default to server components. Add `"use client"` only at the leaf where interactivity actually begins (event handlers, state, browser APIs).

A `<view>-page.tsx` and any `<feature>-section.tsx` are server components — they only compose. The `"use client"` directive should appear in `_components/*.tsx` leaves, never at the page or section level.

Data fetching for a sub-feature happens either in the route (props down) or inside the sub-feature's section as a server component (self-fetching). Both are allowed; pick the simpler one for the case.

### Route files in `app/`

Routes are thin shells that orchestrate: fetch top-level data, set metadata, render the matching view. They never contain JSX trees, business logic, or sub-components.

```tsx
// app/(dashboard)/users/page.tsx
import { UsersPage } from "@/views/users/users-page"
import { getUsers } from "@/views/users/api/users-data"

export const metadata = { title: "Users" }

export default async function Page() {
  const users = await getUsers()
  return <UsersPage users={users} />
}
```

If a route file grows beyond ~10–15 lines, extract whatever is growing into the view.

### `shared/common/` discipline

`shared/common/` holds concrete app-level layout chrome (AppSidebar, SiteHeader). It has **one rule**: only static, app-wide layout chrome with no per-request data. The day a piece needs the current user, dynamic role-based nav, or feature data, it stops being chrome — it either becomes a view or accepts data via props from a layout/route. Resist the temptation to use `common/` as a junk drawer.

### Statically enforced invariants

These boundaries are enforced by `eslint-plugin-import-x`'s `no-restricted-paths` rule. Violations fail `pnpm lint`:

- `shared/ui/**`, `shared/lib/**`, `shared/layout/**`, `shared/common/**`, `providers/**`, and `hooks/**` cannot import from `@/views/*` or `@/app/*`.
- `views/<a>/**` cannot import from `views/<b>/**` for any other view `<b>`.

Conventions documented but not lint-enforced today (rely on review):

- Within a "thing", dependency direction is one-way: `_components/`, sub-features, and the main file may import from `api/` and `entities/`. `api/` and `entities/` never import from `_components/` or sub-features.
- Sub-features at the same level never import from each other.
- Pages never import from each other's `api/`, `entities/`, `_components/`, or sub-features.

## Adding things

### A new page

1. Create `views/<name>/`:
   - `<name>-page.tsx` — main component, named export `<Name>Page`, accepts data as props.
   - `api/<name>-data.ts` — fetcher (and mock data).
   - `entities/types.ts` — domain types.
   - `_components/` — UI sub-components, if any.
2. Create `app/<group>/<route>/page.tsx` — thin shell that fetches and renders.
3. Add the entry to the `nav` literal in `shared/common/app-sidebar.tsx`.
4. Add the new view's folder name to the `views` array in `eslint.config.mjs` so the cross-view import ban applies to it.

### A sub-feature inside an existing thing

Sub-features can be added at any level — view root, inside `_components/<comp>/`, or inside another sub-feature. The shape is always the same:

1. Create `<parent>/<feature>/`:
   - `<feature>-section.tsx` — main component, named export `<FeatureSection>`.
   - `api/<feature>-data.ts` and/or mutations as needed.
   - `entities/types.ts` if it has its own types.
   - `_components/` and/or further sub-feature folders as needed.
2. Import the section into the parent and render it.

### Removing a page or sub-feature

Delete the folder. Remove its single import line from the parent (route, page, or component). For a top-level page, also remove its line from the sidebar `nav`. Done.
