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

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `pnpm dev`        | Dev server with Turbopack                                 |
| `pnpm build`      | Production build                                          |
| `pnpm start`      | Serve the production build                                |
| `pnpm lint`       | ESLint (includes import-boundary rules)                   |
| `pnpm format`     | Write Prettier formatting                                 |
| `pnpm format:check` | Check formatting only                                   |
| `pnpm typecheck`  | TypeScript `--noEmit`                                     |
| `pnpm ready`      | Format, lint, typecheck, then build (local convenience) |
| `pnpm ready:ci`   | Same as `ready` but `format:check` instead of write       |

### Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

New primitives land under the paths configured in `components.json` (mapped via `@/shared/ui/*` in this workspace). Custom compositions belong in `shared/common/` or `views/`, not alongside vendored shadcn files — see [Architecture](#architecture).

## Dashboard & editable table

### Data source

The **Users** page does **not** call a public HTTP API. It uses a **single-process, in-memory mock** that simulates a workspace directory:

- **Core mock**: `shared/lib/mock-workspace-users.ts` — holds the user list, applies sorting/filtering/search, paginates results, and exposes async functions with **simulated network latency** so loading states behave realistically.
- **View-facing surface**: `views/users/api/users-data.ts` re-exports `fetchWorkspaceUsersPage`, `updateUser`, `deleteUser`, role/status helpers, and shared query types. The users UI imports only from here (or hooks that wrap these calls).
- **Session behavior**: `updateUser` / `deleteUser` mutate the in-memory store for the lifetime of the dev server process (until restart). That makes **optimistic updates**, **rollback on failure**, and **toast feedback** (`views/users/_components/users-table/_hooks/use-user-save.ts`, `use-user-delete.ts`) meaningful without a backend.

If you replace the mock with a real API, keep the same boundaries: implement fetch/mutation in `views/users/api/` (or route handlers) and keep `shared/common/data-table` free of view-specific imports.

### Feature checklist (reference implementation)

The reusable table lives under **`shared/common/data-table/`** (`DataTable`, cell editors, types). The **Users** table (`views/users/_components/users-table/`) demonstrates:

| Area | Notes |
| ---- | ----- |
| Layout & nav | Responsive shell `shared/layout/app-shell.tsx`, sidebar `shared/common/app-sidebar.tsx`; table route `/users`. |
| Columns & data | Props-driven `ColumnDef`s; demo: `views/users/_components/users-table/_components/user-table-columns.tsx`. |
| Editing | View vs edit modes; row and/or cell editing via `editMode` (e.g. `row`, `cell`, `both`). Clear **Save** / **Cancel**; drafts use React Hook Form — originals are not overwritten until save succeeds. |
| Callbacks | `DataTable` accepts **`onEdit`**, **`onSave`**, **`onDelete`**; Users wires save/delete (see note below for `onEdit`). |
| Validation | Zod schema `views/users/_components/users-table/api/user-draft.ts`; inline errors in editors (`role="alert"`). |
| Sorting / filters / search | Column sorting; per-column filters (text/select); global search with **debounce** (`debounceGlobalSearchMs` on `DataTable`). |
| Pagination | **Server-style** on the mock: `manualPagination` + `manualSorting` + `manualFiltering`, `rowCount`, and `onQueryChange` → `useUsersRemoteQuery` → `fetchWorkspaceUsersPage`. |
| Column resize | Enabled on the table; resize handles expose ARIA on the separator. |
| Field types | Built-ins: text, number, select, checkbox, switch, date, phone, currency, percentage — extensible via `customEditors` / `ColumnMeta.renderEditor` (`shared/common/data-table/types.ts`). |
| Formatting | Parsing/normalization: `shared/lib/parse-field-input.ts`; currency/phone/percentage editors in `shared/common/data-table/cell-editors.tsx`. |
| Persistence | Table UI state (sort, filters, pagination, column visibility, global filter draft) → **`localStorage`** when `persistenceKey` is set (`shared/lib/table-persistence.ts`). **Not** synced to the URL. |
| Extras | Column visibility menu (default on); light/dark via `providers/theme-provider.tsx` (`next-themes`); optimistic saves with rollback + Sonner toasts. |

### Intentionally not used / gaps vs some briefs

| Topic | This repo |
| ----- | --------- |
| **React Query / SWR** | Optional elsewhere; here data is loaded with React state + callbacks (`use-users-remote-query.ts`). |
| **URL query persistence** | Not implemented; only **localStorage** for table state (see above). |
| **`onEdit` on Users** | The prop exists on `DataTable` for consumers; the Users demo does **not** pass `onEdit` (save/delete illustrate persistence). |
| **Keyboard-first spreadsheet UX** | Focus management and ARIA on controls and live regions are in place; full grid keyboard navigation is not a goal of this demo. |

### Folder map (brief vs this repo)

Take-home specs often suggest `/components/table` and `/pages/...`. Here the same roles appear as:

| Typical brief | This codebase |
| ------------- | ------------- |
| Shared table UI | `shared/common/data-table/` |
| Dashboard layout / sidebar | `shared/layout/app-shell.tsx`, `shared/common/app-sidebar.tsx` |
| App routes | `app/(dashboard)/...` |
| Page UI | `views/<feature>/` |

## Architecture decisions

High-level choices behind this codebase (detail lives in [Architecture](#architecture) below).

- **Routing vs implementation**: `app/` stays thin (metadata, optional server fetch, render a view). All page UI and feature composition live under `views/<feature>/` so routes do not accumulate JSX or domain logic.
- **Shared vs feature code**: `shared/common/` holds reusable UI such as `DataTable` with **no imports from `views/` or `app/`**. Feature-specific columns, Zod drafts, and mutations stay next to the Users feature. ESLint `no-restricted-paths` enforces the split.
- **One recursive folder shape**: Features use the same pattern at every depth (`<thing>.tsx`, optional `api/`, `entities/`, `_components/`, nested sub-features). The aim is safe deletion and predictable navigation.
- **Client boundaries**: Server components by default; `"use client"` only on interactive leaves (table, sidebar, hooks). The editable grid needs the boundary anyway; keeping pages server-ready avoids unnecessary hydration.
- **Table editing model**: A single React Hook Form instance keyed by the active row keeps validation (Zod) and cancel/reset coherent. TanStack Table owns sorting/filtering/pagination state; optional persistence mirrors that state to `localStorage`, not the URL.
- **Data for the demo**: An in-memory mock with simulated latency exercises loading/error states and manual pagination without standing up a backend. Swap `views/users/api/` for HTTP while preserving the table API.

## Tradeoffs made

- **`DataTable` scope**: One component carries sorting, filtering, pagination, resizing, editing, persistence, and loading UI. That speeds up product consistency but increases file size and coupling; splitting the toolbar and pagination into smaller components would shrink the surface area later.
- **React Hook Form + Zod inside the grid**: Strong validation and accessible errors with minimal boilerplate, but generic typing across arbitrary row shapes is verbose (`FieldValues`, column meta). Hook Form per-cell would be lighter per editor but worse for row-level save/cancel.
- **Manual “remote” mode**: `manualPagination` / `manualSorting` / `manualFiltering` plus `onQueryChange` matches real backends. It is more wiring than pure client-side TanStack models but avoids double-filtering bugs when the server is authoritative.
- **localStorage over URL**: Sharable/bookmarkable filter state was traded off for simpler implementation and fewer hydration mismatches; deep-linking table state would need nuance with Next.js and defaults.
- **No TanStack Query**: Fewer dependencies and a smaller conceptual stack for a mock-only demo; cache invalidation, retries, and deduping would justify Query once a real API exists.
- **Optimistic updates without a formal patch queue**: Saves apply immediately to local row state and roll back on error — simple UX, but concurrent edits or offline queues are out of scope.

## What we would improve with more time

- **URL-synced table state**: Encode sort, filters, page, and visibility in `searchParams` (with migration from existing `localStorage` keys) for shareable links.
- **TanStack Query (or similar)** wired to real endpoints: standardized loading/error/retry, cache lifetimes, and mutation hooks replacing ad hoc `useEffect` fetch sequences.
- **Automated tests**: Component tests for `DataTable` interactions (edit/save/cancel), Zod edge cases for `user-draft`, and contract tests for `fetchWorkspaceUsersPage` query payloads.
- **Performance**: Virtualized body rows for large datasets; audit resize + horizontal scroll on small viewports.
- **Accessibility**: Dedicated keyboard model for moving between cells and activating edit mode (beyond labels and live regions).
- **Storybook or similar** for `DataTable` variants (`editMode`, loading, empty, error) to speed review and regression spotting.
- **Internationalization**: Locale-aware number/currency/date display and Radix directionality if the product leaves English-only demos.

## Architecture

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

The `components/ui/` ↔ `components/table/`, `components/dashboard/`, … split is by **origin**, not purpose. A file lives in `components/ui/` if and only if `shadcn add <name>` produced it (the file maps 1:1 with the shadcn registry). Anything we wrote ourselves — even a thin wrapper over a primitive — goes in `components/table/`, `components/dashboard/`, ….

### Always use alias imports

Never use relative `./` or `../`. Always use the workspace alias roots:

| Alias           | Maps to                             |
| --------------- | ----------------------------------- |
| `@/app/*`       | `./app/*`                           |
| `@/views/*`     | `./views/*`                         |
| `@/shared/*`    | `./components/* and ./lib/*`        |
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

- **Generic helpers** go in `@/lib/`. Helpers tightly coupled to a single fetcher live next to it inside that level's `api/`. There is no per-view `lib/` folder.
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

### `components/table/`, `components/dashboard/`, … discipline

`components/table/`, `components/dashboard/`, … holds two kinds of files:

1. **Generic compositions** we authored over shadcn primitives or other libraries (`DataTable`, `ConfirmDialog`). These are app-agnostic; nothing in them references a specific view, route, or piece of feature data.
2. **App-level chrome** that hardcodes app-wide static things — brand, nav literal, header layout (`AppSidebar`, `SiteHeader`).

Both share **one rule**: no per-request data and no feature logic. The day a piece needs the current user, dynamic role-based nav, or feature data, it stops being shared — it either becomes a view or accepts data via props from a layout/route. Resist the temptation to use `common/` as a junk drawer for "stuff we'll generalize later".

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

- **shadcn primitive** (e.g., `pnpm dlx shadcn@latest add tabs`) → lands in `components/ui/`. `components.json` is already configured for this; don't change it. Treat the result as vendored — keep edits surgical so a future `shadcn add --overwrite` re-sync stays painless.
- **Anything else we author** (generic composition, app-level chrome) → put it in `shared/common/<name>.tsx`. Compositions over shadcn primitives belong here, not in `components/ui/`.
