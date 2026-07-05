# Shared ESLint Config — Design (2026-05-27)

Canonical brief for `@vasekzdvihal/eslint-config`. Decisions captured here so the package doesn't drift from intent.

## Goal

One ESLint config to use across all my Vue/Nuxt projects (and a few non-Vue ones). Stops rule duplication across repos and enforces style + AI guardrails mechanically instead of relying on CLAUDE.md.

## Stack context

- Frontend dev at Newton Media. Stack is Vue 3 + Nuxt 3/4 + Quasar, occasional plain TypeScript libraries.
- Deployment is Windows IIS via on-prem Azure DevOps. Config must install cleanly in CI — no weird native deps.
- I use Claude Code heavily. The config exists to give Claude hard rules it cannot bypass.

## Decisions

- **Wrap `@antfu/eslint-config`** rather than build from scratch. Inherit Vue/TS/Stylistic.
- **Scoped npm package**: `@vasekzdvihal/eslint-config`.
- **Three entry points**: default (TS base), `/vue`, `/strict`.
- **ESLint 9 flat config only.** No legacy `.eslintrc`.
- **Semicolons on, single quotes, 2-space indent.** Override Antfu defaults via `stylistic:` option.
- **Local-first development.** `npm link` into real projects, publish to npm only when ready.
- **Node target**: `>=22.0.0`. (Originally `>=20`, amended 2026-07-05 — see Amendments.)
- **No Tailwind plugin** (don't use it at work). Can add `/tailwind` variant later if needed.
- **No Prettier dependency.** Antfu's Stylistic handles formatting.
- **Minimal CI**: install + lint + test on Node 20, PR + main push.

## Pinned versions

- `@antfu/eslint-config`: `^9.0.0` (latest stable as of 2026-05).
- `eslint` peer: `^9.10.0 || ^10.0.0` (required by Antfu v9).

## Project structure

```
eslint-config/
├── package.json
├── README.md
├── LICENSE                 (MIT)
├── .gitignore
├── .npmignore
├── .github/workflows/test.yml
├── src/
│   ├── index.js            (default: TS base + AI guardrails core)
│   ├── vue.js              (Vue/Nuxt variant)
│   └── strict.js           (full AI guardrails — opt-in stricter limits)
├── tests/
│   ├── fixtures/{base,vue,strict}/   (per-variant good.* + bad.* + eslint.config.js)
│   └── smoke.test.js
├── examples/consumer-project/
└── docs/specs/             (this file)
```

## Rules

### Base (`src/index.js`)

- Passes to Antfu: `type: 'lib'`, `typescript: true`, `stylistic: { semi: true, quotes: 'single', indent: 2 }`.
- Style overrides on top: `curly: ['error', 'all']`, `eqeqeq: ['error', 'always']`. (`semi`/`quotes` handled via Antfu's stylistic option.)
- AI guardrails (always-on):
  - `complexity: ['error', 10]`
  - `max-depth: ['error', 4]`
  - `max-params: ['error', 4]`
  - `no-magic-numbers: ['error', { ignore: [0, 1, -1, 2], ignoreArrayIndexes: true, enforceConst: true, detectObjects: false }]`
  - `id-length: ['error', { min: 2, exceptions: ['_', 'i', 'j', 'x', 'y'] }]`
  - `no-console: ['warn', { allow: ['warn', 'error'] }]`
  - `no-debugger: 'error'`
- TypeScript (scoped to `**/*.{ts,tsx,vue}` — note Antfu renames `@typescript-eslint/*` to `ts/*`):
  - `ts/no-explicit-any: 'warn'`
  - `ts/no-unused-vars: ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]`

### Vue (`src/vue.js`)

Composes base with `vue: true` passed to Antfu, then adds:

- `vue/component-api-style: ['error', ['script-setup']]`
- `vue/multi-word-component-names: 'off'`
- `vue/no-unused-refs: 'error'`
- `vue/require-explicit-emits: 'error'`
- `vue/define-macros-order: ['error', { order: ['defineProps', 'defineEmits'] }]`
- `vue/block-order: ['error', { order: ['script', 'template', 'style'] }]`
- `.vue` files only: `max-lines-per-function: 100`, `max-lines: 400` (looser than base, since Vue setup naturally is larger).

### Strict (`src/strict.js`)

Composes base, then adds:

- `max-lines-per-function: ['error', { max: 50, skipBlankLines: true, skipComments: true }]`
- `max-lines: ['error', { max: 250, skipBlankLines: true }]`
- `max-statements: ['error', 20]`
- `max-classes-per-file: ['error', 1]`

Deliberately separated so base can be adopted in legacy projects without exploding everything; opt into `/strict` for new projects.

## Tests

- Fixture-based smoke tests using ESLint Node API + `node --test`.
- One pair per variant: `good.*` asserts 0 errors; `bad.*` asserts specific rule IDs present.
- No Jest/Vitest, no extra deps.

## Workflow

1. Plan first → file tree + package.json → wait for OK.
2. Then create files in this order: `package.json` → ignores → `src/*` → fixtures → tests → README → examples → CI.
3. Run `npm install` and tests after each major step. Show pass/fail.
4. Once green locally: walk through `npm link` into a real project, migrate that project's `eslint.config.js`, run lint on real code.
5. Only after testing in a real project: talk about `npm publish`.

## Out of scope

- No `no-comments` ban — comments stay allowed.
- No Prettier dependency.
- No auto-publish.
- No CLAUDE.md for the package itself until we know what's worth pinning.

## Amendments (2026-07-05, post-review)

Decisions changed after the five-perspective codebase review:

- **Node target raised to `>=22.0.0`.** Antfu v9's dependency chain uses `Object.groupBy` (Node 21+), so the original `>=20` promise crashed at runtime — CI was red on Node 20. Engines, both workflows, and the README now say 22.
- **Accessibility on by default in `/vue`.** `vue: { a11y: true }` wires in `eslint-plugin-vuejs-accessibility` (shipped as a dependency). Antfu renames the rule prefix to `vue-a11y/*`. Opt out per project with `vasek({ vue: { a11y: false } })`. Rationale: missing alt text and click-handlers-on-divs are exactly the mistakes AI-generated Vue templates make; fits the "hard rules Claude can't bypass" goal.
- **Style/guardrail layers scoped to source files.** The `vasek/style`, `vasek/ai-guardrails`, and `vasek/strict` layers carry `files: ['**/*.?([cm])[jt]s?(x)', '**/*.vue']` so rules like `max-lines` can't fire on JSON/YAML/Markdown files linted by Antfu's presets (e.g. large locale JSONs).
- **`stylistic: false` is honored.** The base factory previously spread the consumer's `stylistic` value into the defaults object, silently discarding `false`; it now passes `false` through to Antfu.
- **Config block names standardized** to `vasek/style`, `vasek/ai-guardrails`, `vasek/typescript`, `vasek/vue`, `vasek/vue-files`, `vasek/strict` (consumer-facing via `.override()`; renamed pre-1.0).
- **Publish switched to token-driven on tag push.** Replaced the OIDC/trusted-publisher workflow (triggered on GitHub Release published, with `--provenance`) with a simpler `publish.yml` that fires on pushing a `v*` tag and authenticates via the `NPM_TOKEN` repo secret (`NODE_AUTH_TOKEN`). The workflow verifies the tag matches `package.json` version, then lints, tests, and runs `npm publish`. Provenance and `id-token: write` were dropped — provenance requires OIDC, which is what we removed. Release flow is now just `npm version …` → `git push --follow-tags`; no GitHub Release step. Supersedes the earlier "No auto-publish" out-of-scope note and the trusted-publisher setup.

## References

- ESLint shareable configs: https://eslint.org/docs/latest/extend/shareable-configs
- Antfu's config: https://github.com/antfu/eslint-config
- Wrapper examples for shape inspiration: `@alvarosabu/eslint-config`, `@stefanobartoletti/eslint-config`
