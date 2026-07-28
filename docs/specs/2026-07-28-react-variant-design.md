# `/react` Variant — Design (2026-07-28)

Approved design for the fourth entry point of `@vasekzdvihal/eslint-config`. Same philosophy as `/vue`: hard rules AI can't bypass, composed on top of the base config. Companion to the canonical brief in `2026-05-27-eslint-config-design.md`.

## Goal

One `/react` entry usable across React projects (Vite SPA now, possibly Next.js later) that inherits the base AI guardrails and adds React-specific ones. Framework-neutral: Antfu auto-detects `next`, `react-router`/Remix, and `vite` in the consumer project and adjusts `react-refresh/only-export-components` allowances — nothing to configure per framework.

## Decisions

- **`src/react.js` composes `vasek(...)` from `index.js`** — never duplicates base rules — passing `react: true` to Antfu, exactly the pattern `src/vue.js` uses.
- **Factory signature**: `vasekReact(options, ...userConfigs)` returning Antfu's `FlatConfigComposer`. Consumers import `@vasekzdvihal/eslint-config/react`.
- **Upstream foundation**: Antfu's `react: true` wires `@eslint-react/eslint-plugin` (renamed `@eslint-react/*` → `react/*`) and `eslint-plugin-react-refresh`. Its recommended preset (65 rules) already ships the critical guardrails: `react/rules-of-hooks: error`, `react/no-missing-key: error`, `react/set-state-in-render: error`, `react/no-nested-component-definitions: error`, and the `web-api` leak-detection group.
- **Thin custom layer** (YAGNI): only severity promotions, a11y, and size limits on top of recommended. Extra off-by-default rules (naming conventions, conditional-rendering complexity, …) are added later only when a real AI mistake shows the gap — and per repo rules, only after asking first.
- **Accessibility on by default** via `eslint-plugin-jsx-a11y` (rule prefix stays `jsx-a11y/*`; Antfu does not wire or rename it). Rationale as in the Vue amendment: missing alt text and click-handlers-on-divs are exactly the mistakes AI-generated markup makes.
- **A11y opt-out mirrors the Vue API**: `vasekReact({ react: { a11y: false } })`. The `a11y` key is ours — strip it before forwarding the remaining `react` sub-options to Antfu (which doesn't know it). If sub-options remain, forward the object; otherwise forward `true`.
- **New runtime dependencies** (Antfu's recommended ranges): `@eslint-react/eslint-plugin ^5.6.0`, `eslint-plugin-react-refresh ^0.5.2`, `eslint-plugin-jsx-a11y ^6.10.0` — shipped as dependencies, same pattern as `eslint-plugin-vuejs-accessibility` for `/vue`.

## Config layers

All three custom layers apply to `**/*.{jsx,tsx}` only (base layers already carry their own `srcFiles` scoping).

### `vasek/react` — severity promotions

@eslint-react's recommended preset leaves these at `warn`; AI ignores warnings. All promoted to `error`:

| Rule(s) | AI failure blocked |
| --- | --- |
| `react/exhaustive-deps` | Wrong/missing dependency arrays in `useEffect`/`useMemo`/`useCallback`. Intentional partial deps need a visible `eslint-disable` in the diff. |
| `react/no-array-index-key` | `key={index}` in lists → state bleeding on reorder. |
| `react/dom-no-dangerously-set-innerhtml` | XSS via innerHTML. |
| `react/web-api-no-leaked-timeout`, `-interval`, `-event-listener`, `-fetch`, `-intersection-observer`, `-resize-observer` | Effects that set up timers/listeners/observers/fetches without returning cleanup. |

### `vasek/react-a11y` — jsx-a11y recommended

`eslint-plugin-jsx-a11y` flat recommended preset (~35 rules: `alt-text`, `click-events-have-key-events`, `no-static-element-interactions`, `anchor-is-valid`, `label-has-associated-control`, …). Omitted entirely when `react: { a11y: false }`.

### `vasek/react-files` — size limits

Mirrors `vasek/vue-files`:

- `max-lines-per-function: ['error', { max: 100, skipBlankLines: true, skipComments: true }]`
- `max-lines: ['error', { max: 400, skipBlankLines: true }]`

Components are plain functions, so this is the layer that stops 500-line components. It applies to every function in `.jsx`/`.tsx` files (same trade-off as the Vue variant); plain `.ts` util files stay uncapped — that's `/strict`'s job.

## Type-aware opt-in (documented, not defaulted)

`react/no-leaked-conditional-rendering` (the `{count && <div/>}` renders-`0` bug) is type-aware and only activates when the consumer passes `react: { tsconfigPath: 'tsconfig.json' }` (forwarded to Antfu untouched). It can't be on by default — we don't know the consumer's tsconfig. README documents it as a recommended opt-in.

## Tests

- `tests/fixtures/react/` with `good.tsx` (clean component, 0 errors), `bad.tsx`, and its own `eslint.config.js` pointing at `../../../src/react.js` (fixtures don't fall back to the repo-root config).
- `bad.tsx` must trigger at least: `react/exhaustive-deps`, `react/no-array-index-key`, `react/web-api-no-leaked-timeout`, `react/dom-no-dangerously-set-innerhtml`, `jsx-a11y/alt-text`, `max-lines-per-function` — each asserted at **error** severity, so a silent demotion back to warn fails the suite.

## Packaging & docs

- `package.json`: add `"./react": "./src/react.js"` to exports, the three new dependencies, and a `react` keyword.
- README: `/react` section incl. the `tsconfigPath` opt-in note and a11y opt-out.
- CLAUDE.md: three entry points → four.
- CI: unchanged — existing install + lint + test workflow covers the new fixture automatically.

## Known limitation (unchanged from today)

Variants don't stack: `/react` can't be combined with `/strict`, same as `/vue` + `/strict` today. Fixing that is a separate design if ever wanted.

## Risk to verify during implementation

Whether the fixture needs `react` itself installed for @eslint-react's version detection. If the smoke test fails without it, add a minimal `react` devDependency to the repo (fixtures resolve from the repo root), matching how real consumers look anyway.
