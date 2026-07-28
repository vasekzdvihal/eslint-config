# Project: @vasekzdvihal/eslint-config

Shared ESLint flat config that wraps `@antfu/eslint-config` with personal style + AI guardrails. Published to npm, used in Vasek's Vue/Nuxt/TS projects. Four entry points: default (TS base), `/vue`, `/react`, `/strict`. Requires Node >=22 — Antfu v9's deps use `Object.groupBy` (Node 21+), so Node 20 crashes at runtime.

## Commands

- `npm test` — runs the fixture-based smoke tests. Uses `node --test` with a glob (Node 24+ rejects bare `tests/` dir).
- `npm run lint:fix` — dogfoods the config on its own source.
- Do NOT run `npm publish` locally for routine releases. Publish is release-driven via `.github/workflows/publish.yml` using npm OIDC. Manual local publish only worked once for the initial package claim.

## Architecture

- `src/index.js` is the single source of truth for the base layer. `src/vue.js`, `src/react.js`, and `src/strict.js` MUST compose by calling `vasek(...)` from `index.js` — never duplicate base rules.
- Each variant exports a factory function returning Antfu's `FlatConfigComposer`. Signature: `(options, ...userConfigs)`. Don't change the return shape — consumers chain `.override()` on it.
- Antfu renames `@typescript-eslint/*` to `ts/*`, `@eslint-react/*` to `react/*`, and `vuejs-accessibility/*` to `vue-a11y/*`. Use the short forms.
- `/vue` enables `vue: { a11y: true }` by default — `eslint-plugin-vuejs-accessibility` is a runtime dependency, don't remove it.
- `/react` enables jsx-a11y by default via the maintained `eslint-plugin-jsx-a11y-x` fork (the original peer-supports only ESLint ≤9 and ERESOLVE-fails on ESLint 10) — it's a runtime dependency, don't remove it or swap back without checking peers. `src/react.js` registers it under the familiar `jsx-a11y/*` rule IDs. Opt-out is `react: { a11y: false }` — the `a11y` key is ours, stripped before forwarding to Antfu.
- The style/guardrail/strict layers are scoped to `srcFiles` (exported from `src/index.js`) so they never hit Antfu's JSON/YAML/Markdown virtual files.
- Antfu's stylistic plugin provides `style/semi`, `style/quotes`, `style/indent`. Don't add the core ESLint equivalents — they're not registered in flat config and will error.

## Code style

- This repo is linted by its own config (`eslint.config.js` imports `./src/index.js`). Two self-targeted overrides exist and are intentional: `no-magic-numbers` is off for `src/**` (the rule values ARE config), and `test/no-import-node-test` is off for `tests/**` (we use `node:test`, not Vitest).

## Gotchas

- `publishConfig.provenance: true` in `package.json` BREAKS local `npm publish` ("provider: null" error). Provenance is set via the `--provenance` flag in the publish workflow only.
- Smoke tests use `new ESLint({ cwd: fixtureDir })`. Each fixture dir has its own `eslint.config.js` pointing at the corresponding variant via relative path.
- When adding a fixture, also add its `eslint.config.js` — ESLint won't fall back to the repo-root config.

## Rules for editing this repo

- **YOU MUST add a smoke-test assertion when adding or changing a lint rule.** No silent regressions.
- **Do NOT propose new rules without asking the user first.** Matches the original brief.
- **Pin `@antfu/eslint-config` to the current major.** Don't bump majors without testing — Antfu majors introduce rule churn.
- **Never add Prettier.** Antfu's stylistic plugin handles formatting.

## Workflow

- Branch only for non-trivial changes. Tiny fixes can go straight to `main`.
- Release: `npm version patch|minor|major` → `git push --follow-tags` → draft a GitHub Release against the new tag → `publish.yml` fires.
- npm trusted publisher is configured on the package page (`@vasekzdvihal/eslint-config` → Settings → Publishing access). Repo `vasekzdvihal/eslint-config`, workflow `publish.yml`.

## Imports

- See @docs/specs/2026-05-27-eslint-config-design.md for the canonical design brief and rationale.
