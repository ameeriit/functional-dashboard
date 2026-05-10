# Functional Dashboard

A Next.js 16 dashboard built with React 19, Tailwind CSS v4, and shadcn/ui (radix-lyra style).

## Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- **UI**: [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/)
- **Data table**: [TanStack Table](https://tanstack.com/table/v8) v8
- **Forms & validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) (via `@hookform/resolvers/zod`)
- **Feedback**: [Sonner](https://sonner.emilkowal.ski/) toasts
- **Language**: TypeScript
- **Tooling**: ESLint (with import-boundary enforcement), Prettier, pnpm

## Setup instructions

### Prerequisites

- **Node.js**: A current [Active LTS](https://nodejs.org/) release or newer (Next.js 16 expects a modern runtime).
- **pnpm**: The repo is wired for [pnpm](https://pnpm.io/) (see `pnpm-lock.yaml`). Install it if needed (for example `corepack enable` then `corepack prepare pnpm@latest --activate`, or your preferred install method).

### Install and run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). **Environment variables**: none are required for the current mock-backed Users flow; add keys here when you introduce a real API.

### Production build

```bash
pnpm build
pnpm start
```

### Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Dev server with Turbopack                               |
| `pnpm build`        | Production build                                        |
| `pnpm start`        | Serve the production build                              |
| `pnpm lint`         | ESLint (includes import-boundary rules)                 |
| `pnpm format`       | Write Prettier formatting                               |
| `pnpm format:check` | Check formatting only                                   |
| `pnpm typecheck`    | TypeScript `--noEmit`                                   |
| `pnpm ready`        | Format, lint, typecheck, then build (local convenience) |
| `pnpm ready:ci`     | Same as `ready` but `format:check` instead of write     |

### Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

New primitives land under the paths configured in `components.json` (mapped via `@/shared/ui/*` in this workspace). Custom compositions belong in `shared/common/` or `views/`, not alongside vendored shadcn files — see [Architecture reference](#architecture-reference).

## Dashboard & editable table

### Data source

The **Users** page does **not** call a public HTTP API. It uses a **single-process, in-memory mock** that simulates a workspace directory:

- **Core mock**: `shared/lib/mock-workspace-users.ts` — holds the user list, applies sorting/filtering/search, paginates results, and exposes async functions with **simulated network latency** so loading states behave realistically.
- **View-facing surface**: `views/users/api/users-data.ts` re-exports `fetchWorkspaceUsersPage`, `updateUser`, `deleteUser`, role/status helpers, and shared query types. The users UI imports only from here (or hooks that wrap these calls).
- **Session behavior**: `updateUser` / `deleteUser` mutate the in-memory store for the lifetime of the dev server process (until restart). That makes **optimistic updates**, **rollback on failure**, and **toast feedback** (`views/users/_components/users-table/_hooks/use-user-save.ts`, `use-user-delete.ts`) meaningful without a backend.

If you replace the mock with a real API, keep the same boundaries: implement fetch/mutation in `views/users/api/` (or route handlers) and keep `shared/common/data-table` free of view-specific imports.

### Feature checklist (reference implementation)

The reusable table lives under **`shared/common/data-table/`** (`DataTable`, cell editors, types). The **Users** table (`views/users/_components/users-table/`) demonstrates:

| Area                       | Notes                                                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout & nav               | Responsive shell `shared/layout/app-shell.tsx`, sidebar `shared/common/app-sidebar.tsx`; table route `/users`.                                                                                        |
| Columns & data             | Props-driven `ColumnDef`s; demo: `views/users/_components/users-table/_components/user-table-columns.tsx`.                                                                                            |
| Editing                    | View vs edit modes; row and/or cell editing via `editMode` (e.g. `row`, `cell`, `both`). Clear **Save** / **Cancel**; drafts use React Hook Form — originals are not overwritten until save succeeds. |
| Callbacks                  | `DataTable` accepts **`onEdit`**, **`onSave`**, **`onDelete`**; Users wires save/delete (see note below for `onEdit`).                                                                                |
| Validation                 | Zod schema `views/users/_components/users-table/api/user-draft.ts`; inline errors in editors (`role="alert"`).                                                                                        |
| Sorting / filters / search | Column sorting; per-column filters (text/select); global search with **debounce** (`debounceGlobalSearchMs` on `DataTable`).                                                                          |
| Pagination                 | **Server-style** on the mock: `manualPagination` + `manualSorting` + `manualFiltering`, `rowCount`, and `onQueryChange` → `useUsersRemoteQuery` → `fetchWorkspaceUsersPage`.                          |
| Column resize              | Enabled on the table; resize handles expose ARIA on the separator.                                                                                                                                    |
| Field types                | Built-ins: text, number, select, checkbox, switch, date, phone, currency, percentage — extensible via `customEditors` / `ColumnMeta.renderEditor` (`shared/common/data-table/types.ts`).              |
| Formatting                 | Parsing/normalization: `shared/lib/parse-field-input.ts`; currency/phone/percentage editors in `shared/common/data-table/cell-editors.tsx`.                                                           |
| Persistence                | Table UI state (sort, filters, pagination, column visibility, global filter draft) → **`localStorage`** when `persistenceKey` is set (`shared/lib/table-persistence.ts`). **Not** synced to the URL.  |
| Extras                     | Column visibility menu (default on); light/dark via `providers/theme-provider.tsx` (`next-themes`); optimistic saves with rollback + Sonner toasts.                                                   |

### Intentionally not used / gaps vs some briefs

| Topic                             | This repo                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **React Query / SWR**             | Optional elsewhere; here data is loaded with React state + callbacks (`use-users-remote-query.ts`).                            |
| **URL query persistence**         | Not implemented; only **localStorage** for table state (see above).                                                            |
| **`onEdit` on Users**             | The prop exists on `DataTable` for consumers; the Users demo does **not** pass `onEdit` (save/delete illustrate persistence).  |
| **Keyboard-first spreadsheet UX** | Focus management and ARIA on controls and live regions are in place; full grid keyboard navigation is not a goal of this demo. |

### Folder map (brief vs this repo)

Take-home specs often suggest `/components/table` and `/pages/...`. Here the same roles appear as:

| Typical brief              | This codebase                                                  |
| -------------------------- | -------------------------------------------------------------- |
| Shared table UI            | `shared/common/data-table/`                                    |
| Dashboard layout / sidebar | `shared/layout/app-shell.tsx`, `shared/common/app-sidebar.tsx` |
| App routes                 | `app/(dashboard)/...`                                          |
| Page UI                    | `views/<feature>/`                                             |

## Architecture and decisions

This repo separates **where routes live** from **how pages are built**. Next.js route files under `app/` stay small: metadata, optional server-side data loading, and a single render of a view component. Everything that reads like “the Users screen”—composition, feature folders, columns, hooks, and mutations—lives under `views/<feature>/`. That keeps pull requests scoped by feature and stops route files from becoming undeletable junk drawers.

**Shared code** is split by stability and reusability. `shared/ui/` is vendored shadcn output (minimal edits). `shared/lib/` holds generic helpers (formatting, mock workspace helpers). `shared/common/` holds authored compositions (`DataTable`, sidebar chrome) that must remain **free of imports from `views/` or `app/`**, so any screen can use the table without creating circular feature coupling. ESLint `no-restricted-paths` encodes those boundaries so `pnpm lint` fails on violations—details under [Statically enforced invariants](#statically-enforced-invariants).

**Inside each feature**, one recursive folder shape repeats (`main file`, optional `api/`, `entities/`, `_components/`, nested sub-features). The goal is the **one-folder-removal rule**: deleting a feature is deleting a folder and one import line. Convention beats bespoke nesting per page.

**Rendering model**: default to React Server Components; `"use client"` only on leaves that need events or browser APIs (the editable grid, mobile sidebar, etc.). Pages remain cheap to render and easier to evolve toward streaming or server data later.

**Data for the Users demo**: a single-process **in-memory mock** (`shared/lib/mock-workspace-users.ts`) with **simulated latency**, surfaced through `views/users/api/users-data.ts`. That exercises loading states and manual pagination without a backend; swapping in HTTP belongs behind the same view-local API modules—not inside `shared/common/data-table`.

For diagrams, alias imports, route-shell examples, and sub-feature vs `_components/` rules, see [Architecture reference](#architecture-reference).

## Tradeoffs and alternatives

| Area                       | What we chose                                                                           | Alternatives                                                     | Why this tradeoff                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Table responsibilities** | One `DataTable` owning toolbar, pagination, filters, resize, editing, persistence hooks | Split into micro-packages per concern (toolbar-only, shell-only) | Faster consistency across screens; cost is a larger component surface until we carve stable subcomponents           |
| **Forms in the grid**      | One React Hook Form instance per active row + Zod                                       | Controlled inputs only; or per-cell Hook Form                    | Row-level Save/Cancel and validation stay coherent; typing generic rows is verbose                                  |
| **Pagination / filters**   | `manual*` TanStack modes + server-shaped queries (`onQueryChange`)                      | Fully client-side dataset                                        | Matches backends where **the server is authoritative**—avoids double-filtering and drift                            |
| **State persistence**      | `localStorage` via `persistenceKey`                                                     | URL `searchParams`                                               | Simpler and fewer SSR hydration pitfalls; shareable links are a deliberate follow-up                                |
| **Remote data library**    | `useEffect`/callback-driven fetching for the demo                                       | TanStack Query, SWR, Relay                                       | Fewer deps while mocks suffice; Query earns its weight once real endpoints, retries, and cache normalization appear |
| **Optimistic UX**          | Update row locally, rollback + toast on failure                                         | Pessimistic-only UI; or full offline patch queue                 | Good demo UX with minimal machinery; conflict resolution and offline are out of scope                               |

Other deliberate gaps (keyboard-heavy spreadsheet UX, URL-synced filters, etc.) are documented under [Intentionally not used](#intentionally-not-used--gaps-vs-some-briefs).

## Extending and modifying

**Replace the mock with a real API** — Keep column defs, drafts, and mutations in `views/users/` (or route handlers). Implement HTTP in `views/users/api/` (or server actions) while preserving the same query payload shape the table already emits in manual mode. Do **not** import feature types into `shared/common/data-table/`.

**Add another dashboard page** — Follow [Adding things § A new page](#a-new-page): create `views/<name>/`, add `app/(dashboard)/<route>/page.tsx` as a thin shell, register nav in `shared/common/app-sidebar.tsx`, and add the folder name to the `views` array in `eslint.config.mjs`.

**Customize cells or editors** — Use `customEditors` / `ColumnMeta.renderEditor` (`shared/common/data-table/types.ts`); parsing helpers live in `shared/lib/parse-field-input.ts` when reusable.

**Roadmap-style improvements** (not implemented here): URL-encoded table state (possibly migrating keys from `localStorage`), TanStack Query around mutations/list queries, component tests for edit/save/cancel paths, Storybook-style isolation for `DataTable` variants, and locale-aware number/date formatting.

## Scalability and performance

**Product scalability** — Feature folders and ESLint boundaries scale to larger teams: new routes do not entangle unrelated views, and cross-view imports are forbidden at lint time. The recursive shape keeps ownership obvious (“everything under `views/invoices/` is Invoices”).

**Runtime performance today** — The Users grid renders **visible rows synchronously**; the demo dataset is small. Pagination is already modeled as **server-shaped** (`manualPagination`, `rowCount`, query callbacks), so wiring to cursor/limit APIs is mostly swapping the fetcher—not rewriting TanStack wiring.

**Limitations at larger row counts** — Without virtualization, very wide tables or thousands of DOM rows will stress layout and interaction latency; `@tanstack/react-virtual` (or similar) over the body rows would be the next lever. Resize + horizontal scroll on narrow viewports should be audited separately.

**Backend coupling** — The mock runs **in-process** (single Node lifetime); horizontal scaling and persistence require a real store and API—those constraints are intentional for the exercise.

**Network and caching** — When APIs arrive, prefer listing endpoints that accept filter/sort/page in one round-trip (matching current query objects). Client caches (TanStack Query) reduce redundant reads and centralize retry/error semantics **without** changing the table contract.

## Architecture reference

The codebase has a two-layer split: **`app/` is routing only**, and **`views/` holds page implementations**. Pages live in `views/`, and route files in `app/` are thin shells that fetch data and render the matching view component.

```
app/                    Next.js routes only (page.tsx, layout.tsx, route.ts)
views/                  Page implementations, one folder per view
shared/
├── ui/                 shadcn primitives ONLY (came from `shadcn add`).
│                       Treat as vendored — minimal edits, easy to re-sync.
├── lib/                Generic utilities (cn, format helpers)
├── layout/             Layout shells (AppShell, ...)
└── common/             Everything we authored that isn't a shadcn primitive:
                          • generic compositions (DataTable, ConfirmDialog)
                          • app-level chrome (AppSidebar, SiteHeader)
providers/              App-wide React providers (theme, ...)
hooks/                  Generic React hooks
```

Placement under `shared/` is by **origin**, not by feature name. A file belongs in `shared/ui/` if and only if `pnpm dlx shadcn@latest add <name>` produced it (registry output — treat as vendored). Anything we author ourselves — including thin wrappers over primitives — belongs in `shared/common/` (compositions, `DataTable`, app chrome) or `shared/lib/` (pure helpers), never mixed into `shared/ui/`.

### Always use alias imports

Never use relative `./` or `../`. Always use the workspace alias roots:

| Alias           | Maps to                                |
| --------------- | -------------------------------------- |
| `@/app/*`       | `./app/*`                              |
| `@/views/*`     | `./views/*`                            |
| `@/shared/*`    | `./shared/*`                           |
| `@/providers/*` | `./providers/*`                        |
| `@/hooks/*`     | `./hooks/*`                            |
| `@/*`           | project root (fallback / legacy paths) |

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

`shared/common/` holds two kinds of files:

1. **Generic compositions** authored over shadcn primitives or other libraries (`DataTable`, dialogs). These stay app-agnostic: no imports from `views/` or `app/`, no feature-specific column types.
2. **App-level chrome** that hardcodes static app-wide concerns — brand, nav literals, header layout (`AppSidebar`, `SiteHeader`).

Both share **one rule**: no per-request data and no feature logic. The day a piece needs the current user, dynamic role-based nav, or feature data, it stops living here — it becomes part of a view or accepts props from a layout/route. Resist using `shared/common/` as a junk drawer for “stuff we’ll generalize later”.

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

### A shared component

Decide by origin:

- **shadcn primitive** (e.g., `pnpm dlx shadcn@latest add tabs`) → lands in `shared/ui/` per `components.json`. Treat the result as vendored — keep edits surgical so a future `shadcn add --overwrite` re-sync stays painless.
- **Anything else we author** (generic composition, app-level chrome) → `shared/common/` or `shared/lib/` as appropriate. Compositions over shadcn primitives belong outside `shared/ui/`.
