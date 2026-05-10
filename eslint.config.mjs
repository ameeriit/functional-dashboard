import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript"
import importX from "eslint-plugin-import-x"
import { defineConfig, globalIgnores } from "eslint/config"

// Register every view here so the cross-view import ban below covers it.
const views = ["overview", "users"]

const crossViewZones = views.flatMap((target) =>
  views
    .filter((from) => from !== target)
    .map((from) => ({
      target: `./views/${target}/**`,
      from: `./views/${from}/**`,
      message:
        "Views are self-contained and cannot import from each other. Move shared code into `shared/`, `providers/`, or pass it via props from the route file.",
    }))
)

const sharedZones = [
  {
    target: [
      "./shared/ui/**/*",
      "./shared/lib/**/*",
      "./shared/layout/**/*",
      "./shared/common/**/*",
      "./providers/**/*",
      "./hooks/**/*",
    ],
    from: ["./views/**/*", "./app/**/*"],
    message:
      "Reusable infrastructure (shared/*, providers/*, hooks/*) cannot import from `views/` or `app/`. Pass values in via props or context instead.",
  },
]

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ project: "./tsconfig.json" }),
      ],
    },
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        { zones: [...sharedZones, ...crossViewZones] },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
