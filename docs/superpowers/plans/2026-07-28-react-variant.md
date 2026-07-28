# `/react` Variant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/react` entry point to `@vasekzdvihal/eslint-config` — Antfu's React preset plus AI-guardrail severity promotions, jsx-a11y on by default, and component size limits.

**Architecture:** `src/react.js` exports a factory `vasekReact(options, ...userConfigs)` that composes `vasek(...)` from `src/index.js` (never duplicates base rules), passing `react: true` to Antfu and appending three named flat-config layers scoped to `**/*.{jsx,tsx}`: `vasek/react` (severity promotions), `vasek/react-a11y` (jsx-a11y recommended, omitted when `react: { a11y: false }`), `vasek/react-files` (size limits). Spec: `docs/specs/2026-07-28-react-variant-design.md`.

**Tech Stack:** ESLint 9/10 flat config, `@antfu/eslint-config` ^9 (`react: true` wires `@eslint-react/eslint-plugin` renamed to `react/*`, plus `eslint-plugin-react-refresh`), `eslint-plugin-jsx-a11y`, `node --test` smoke tests.

## Global Constraints

- Node `>=22.0.0`; package is ESM (`"type": "module"`).
- `@antfu/eslint-config` stays pinned to major `^9.0.0` — do not bump.
- Never add Prettier.
- Package manager is **npm** (repo has `package-lock.json`; CLAUDE.md commands use npm).
- Every added/changed lint rule gets a smoke-test assertion (repo rule — no silent regressions).
- Do not run `npm publish`; releases are workflow-driven.
- `src/vue.js`/`src/strict.js`/`src/react.js` MUST compose by calling `vasek(...)` from `index.js`.
- Antfu renames `@typescript-eslint/*` → `ts/*` and `@eslint-react/*` → `react/*`. jsx-a11y is NOT renamed — rule IDs stay `jsx-a11y/*`.
- Test commands: `npm test` (all smoke tests), `npm run lint` (dogfoods the config on `src` + `tests`).
- Base config passes `type: 'lib'` to Antfu, which enables `ts/explicit-function-return-type` (with `allowExpressions: true`) — fixture `function` declarations in `.ts`/`.tsx` need explicit return types.
- Execution happens in an isolated workspace (user preference: `cmux-create` skill), branch `feat/react-variant`.

## File Structure

- Create: `src/react.js` — the whole variant (factory + three layers), ~65 lines, mirrors `src/vue.js`.
- Create: `tests/fixtures/react/eslint.config.js`, `good.tsx`, `bad.tsx`, `bad-long.tsx`.
- Modify: `package.json` (exports, dependencies, keywords), `tests/smoke.test.js` (react test block), `README.md`, `CLAUDE.md`.

---

### Task 1: Dependencies, minimal `src/react.js`, clean fixture

**Files:**
- Create: `src/react.js`
- Create: `tests/fixtures/react/eslint.config.js`
- Create: `tests/fixtures/react/good.tsx`
- Modify: `package.json` (dependencies, exports, keywords)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `vasek(options, ...userConfigs)` from `src/index.js` (default export; returns Antfu `FlatConfigComposer`).
- Produces: `vasekReact(options = {}, ...userConfigs)` default-exported from `src/react.js`, returning the composer. Tasks 2–4 add flat-config blocks inside this factory. Fixture dir name `react` used by `lintFile('react', …)`.

- [ ] **Step 1: Install the two React plugins Antfu's `react: true` requires**

```bash
npm install @eslint-react/eslint-plugin@^5.6.0 eslint-plugin-react-refresh@^0.5.2
```

These are runtime `dependencies` (not dev) — consumers must get them transitively, same pattern as `eslint-plugin-vuejs-accessibility` for `/vue`. Verify they landed under `"dependencies"` in `package.json`; move them there if npm put them elsewhere.

- [ ] **Step 2: Add the export and keyword to `package.json`**

In the `"exports"` map, after the `"./vue"` line, add:

```json
    "./react": "./src/react.js",
```

In `"keywords"`, after `"nuxt"`, add `"react"`.

- [ ] **Step 3: Create the fixture config**

`tests/fixtures/react/eslint.config.js`:

```js
import vasek from '../../../src/react.js';

export default vasek();
```

- [ ] **Step 4: Create the clean fixture**

`tests/fixtures/react/good.tsx` — must satisfy every base guardrail (no magic numbers, `id-length` ≥ 2, explicit return type because of `type: 'lib'`, single quotes/semicolons/2-space indent) AND every React layer added in later tasks (correct deps array, cleanup returned from the effect, no index keys, alt text n/a, function under 100 lines):

```tsx
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 1000;

interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return <p>Hello, {name}</p>;
}
```

- [ ] **Step 5: Write the failing test**

In `tests/smoke.test.js`, after the vue test block, add:

```js
it('react: good.tsx passes clean', async () => {
  assertClean(await lintFile('react', 'good.tsx'));
});
```

(`lintFile`, `assertClean` already exist in this file.)

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test`
Expected: the new test FAILS — ESLint in the fixture cwd can't load `../../../src/react.js` (module not found). All pre-existing tests still pass.

- [ ] **Step 7: Write the minimal factory**

`src/react.js`:

```js
import vasek from './index.js';

/**
 * React variant: composes the base config with Antfu's `react: true`
 * (`@eslint-react/eslint-plugin` renamed to `react/*`, plus `eslint-plugin-react-refresh`).
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the defaults.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof vasek>} Antfu's `FlatConfigComposer`.
 */
export default function vasekReact(options = {}, ...userConfigs) {
  return vasek(
    { react: true, ...options },
    ...userConfigs,
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, all tests green.

**Contingency (spec's known risk):** if the react test errors on React version detection (message from `@eslint-react` about resolving the React version), run `npm install --save-dev react`, re-run, and note the addition in the commit message. Do NOT add react as a runtime dependency.

- [ ] **Step 9: Lint the new source file**

Run: `npm run lint`
Expected: clean — `src/react.js` is dogfooded by the repo's own config.

- [ ] **Step 10: Commit**

```bash
git add src/react.js tests/fixtures/react package.json package-lock.json tests/smoke.test.js
git commit -m "feat: add /react entry point wrapping Antfu react preset"
```

---

### Task 2: `vasek/react` severity promotions

**Files:**
- Modify: `src/react.js`
- Create: `tests/fixtures/react/bad.tsx`
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `vasekReact` factory from Task 1; `lintFile`/`assertFires`/`ERROR` helpers in `tests/smoke.test.js`.
- Produces: config block named `vasek/react` with the promotion rules; `reactFiles` const (`['**/*.{jsx,tsx}']`) reused by Tasks 3–4.

- [ ] **Step 1: Create the violating fixture**

`tests/fixtures/react/bad.tsx` — one component violating each promoted rule: missing `count` in the deps array (`exhaustive-deps`), a `setTimeout` in an effect with no cleanup (`web-api-no-leaked-timeout`), `key={index}` (`no-array-index-key`), `dangerouslySetInnerHTML`, and an `img` with no alt (asserted in Task 3):

```tsx
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const TICK_MS = 500;

interface ListProps {
  items: string[];
  html: string;
}

export function BadList({ items, html }: ListProps): ReactNode {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setCount(count + 1), TICK_MS);
  }, []);

  return (
    <div>
      <img src="/logo.png" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <p>{count}</p>
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test**

In `tests/smoke.test.js`, after the react good test:

```js
it('react: bad.tsx triggers promoted React guardrails as errors', async () => {
  const result = await lintFile('react', 'bad.tsx');
  assertFires(result, {
    'react/exhaustive-deps': ERROR,
    'react/no-array-index-key': ERROR,
    'react/web-api-no-leaked-timeout': ERROR,
    'react/dom-no-dangerously-set-innerhtml': ERROR,
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — all four rules fire at severity 1 (upstream `warn`), and `assertFires` demands severity 2. This proves the fixture actually trips the rules AND that the promotion is what the next step adds.

- [ ] **Step 4: Add the promotion layer**

Update `src/react.js` to:

```js
import vasek from './index.js';

/** JSX/TSX files the React layers apply to. */
const reactFiles = ['**/*.{jsx,tsx}'];

/** Promotions from @eslint-react's recommended `warn` — AI ignores warnings. */
const reactRules = {
  'react/exhaustive-deps': 'error',
  'react/no-array-index-key': 'error',
  'react/dom-no-dangerously-set-innerhtml': 'error',
  'react/web-api-no-leaked-timeout': 'error',
  'react/web-api-no-leaked-interval': 'error',
  'react/web-api-no-leaked-event-listener': 'error',
  'react/web-api-no-leaked-fetch': 'error',
  'react/web-api-no-leaked-intersection-observer': 'error',
  'react/web-api-no-leaked-resize-observer': 'error',
};

/**
 * React variant: composes the base config with Antfu's `react: true`
 * (`@eslint-react/eslint-plugin` renamed to `react/*`, plus `eslint-plugin-react-refresh`)
 * and promotes the AI-critical recommended rules from warn to error.
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the defaults.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof vasek>} Antfu's `FlatConfigComposer`.
 */
export default function vasekReact(options = {}, ...userConfigs) {
  return vasek(
    { react: true, ...options },
    {
      name: 'vasek/react',
      files: reactFiles,
      rules: reactRules,
    },
    ...userConfigs,
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — bad.tsx now reports the four rules at severity 2; good.tsx stays clean (its effect has a cleanup and a correct deps array).

- [ ] **Step 6: Commit**

```bash
git add src/react.js tests/fixtures/react/bad.tsx tests/smoke.test.js
git commit -m "feat(react): promote AI-critical React rules to error"
```

---

### Task 3: `vasek/react-a11y` layer with opt-out

**Files:**
- Modify: `src/react.js`
- Modify: `package.json` (jsx-a11y dependency)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `vasekReact` factory, `reactFiles` const, `bad.tsx` fixture (its `<img src="/logo.png" />` already violates `jsx-a11y/alt-text`).
- Produces: config block named `vasek/react-a11y`; option contract `vasekReact({ react: { a11y: false } })` — the `a11y` key is stripped before the remaining `react` sub-options are forwarded to Antfu.

- [ ] **Step 1: Install eslint-plugin-jsx-a11y**

First check peer compatibility with the repo's ESLint 10 dev dependency:

```bash
npm view eslint-plugin-jsx-a11y version peerDependencies
```

If the latest version's `peerDependencies.eslint` range includes `^10`, install it; otherwise install the newest version whose range does (and if none exists, install latest with the exact flag npm suggests, noting it in the commit message — the plugin is known to work on flat config):

```bash
npm install eslint-plugin-jsx-a11y@^6.10.0
```

Verify it landed under `"dependencies"`.

- [ ] **Step 2: Write the failing tests**

In `tests/smoke.test.js`: add `jsx-a11y/alt-text` to the existing bad.tsx assertion object:

```js
    'jsx-a11y/alt-text': ERROR,
```

And add an import at the top of the file, next to the `vasek` import:

```js
import vasekReact from '../src/react.js';
```

Then add a composer-level test (same pattern as the existing `stylistic: false` test):

```js
it('react: a11y is on by default and can be disabled', async () => {
  const withA11y = await vasekReact();
  assert.ok(
    withA11y.some(cfg => cfg.name === 'vasek/react-a11y'),
    'expected vasek/react-a11y block by default',
  );
  const withoutA11y = await vasekReact({ react: { a11y: false } });
  assert.ok(
    !withoutA11y.some(cfg => cfg.name === 'vasek/react-a11y'),
    'expected no vasek/react-a11y block with react: { a11y: false }',
  );
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL twice — bad.tsx reports no `jsx-a11y/alt-text` rule at all, and the composer test finds no `vasek/react-a11y` block.

- [ ] **Step 4: Add the a11y layer and option stripping**

Update `src/react.js` — new import at top, `a11y` extraction, conditional block (the `vasek/react` block from Task 2 stays as-is):

```js
import jsxA11y from 'eslint-plugin-jsx-a11y';
import vasek from './index.js';
```

Replace the factory function with:

```js
/**
 * React variant: composes the base config with Antfu's `react: true`
 * (`@eslint-react/eslint-plugin` renamed to `react/*`, plus `eslint-plugin-react-refresh`),
 * promotes the AI-critical recommended rules from warn to error, and enables
 * `eslint-plugin-jsx-a11y` recommended rules by default.
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the defaults. Pass `react: { a11y: false }` to opt out of
 *   accessibility rules while keeping React support; other `react` sub-options
 *   (e.g. `tsconfigPath`) are forwarded to Antfu untouched.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof vasek>} Antfu's `FlatConfigComposer`.
 */
export default function vasekReact(options = {}, ...userConfigs) {
  const { react: reactOption = {}, ...rest } = options;
  const { a11y = true, ...reactRest } = reactOption === true ? {} : reactOption;
  const react = Object.keys(reactRest).length > 0 ? reactRest : true;

  return vasek(
    { react, ...rest },
    {
      name: 'vasek/react',
      files: reactFiles,
      rules: reactRules,
    },
    ...(a11y
      ? [{
          name: 'vasek/react-a11y',
          files: reactFiles,
          plugins: { 'jsx-a11y': jsxA11y },
          rules: jsxA11y.flatConfigs.recommended.rules,
        }]
      : []),
    ...userConfigs,
  );
}
```

Note: `jsxA11y.flatConfigs.recommended` is the plugin's flat-config preset; we register the plugin ourselves and take only its `rules` so the block stays scoped to `reactFiles`. If the installed version exposes no `flatConfigs` (only legacy `configs.recommended`), use `jsxA11y.configs.recommended.rules` instead — rule IDs are identical.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — `jsx-a11y/alt-text` at severity 2 on bad.tsx, composer test green, good.tsx still clean.

- [ ] **Step 6: Lint and commit**

Run: `npm run lint`
Expected: clean.

```bash
git add src/react.js package.json package-lock.json tests/smoke.test.js
git commit -m "feat(react): enable jsx-a11y by default with react.a11y opt-out"
```

---

### Task 4: `vasek/react-files` size limits

**Files:**
- Modify: `src/react.js`
- Create: `tests/fixtures/react/bad-long.tsx` (generated)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `vasekReact` factory, `reactFiles` const.
- Produces: config block named `vasek/react-files` with `max-lines-per-function` 100 / `max-lines` 400 on `reactFiles`.

- [ ] **Step 1: Generate the oversized fixture**

```bash
node -e "
const lines = ['export function LongComponent() {'];
while (lines.length < 420) { lines.push('  console.warn(\'padding line\');'); }
lines.push('  return null;');
lines.push('}');
require('fs').writeFileSync('tests/fixtures/react/bad-long.tsx', lines.join('\n') + '\n');
"
```

Result: a 422-line file whose single function body is ~420 lines — over both limits. `console.warn` is allowed by the base `no-console` config, so the noise stays on the asserted rules.

- [ ] **Step 2: Write the failing test**

In `tests/smoke.test.js`, after the react a11y test:

```js
it('react: bad-long.tsx triggers size limits for component files', async () => {
  const result = await lintFile('react', 'bad-long.tsx');
  assertFires(result, {
    'max-lines-per-function': ERROR,
    'max-lines': ERROR,
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — neither rule fires (`max-lines-per-function`/`max-lines` are not enabled on `.tsx` outside `/strict`).

- [ ] **Step 4: Add the size-limit layer**

In `src/react.js`, add below `reactRules`:

```js
/** Looser than /strict — React components are plain functions and naturally run longer. */
const reactFileLimits = {
  'max-lines-per-function': ['error', {
    max: 100,
    skipBlankLines: true,
    skipComments: true,
  }],
  'max-lines': ['error', {
    max: 400,
    skipBlankLines: true,
  }],
};
```

And in the factory, insert after the a11y spread (before `...userConfigs`):

```js
    {
      name: 'vasek/react-files',
      files: reactFiles,
      rules: reactFileLimits,
    },
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — both limits fire at severity 2 on bad-long.tsx; good.tsx and bad.tsx are unaffected (both far under 100 lines).

- [ ] **Step 6: Commit**

```bash
git add src/react.js tests/fixtures/react/bad-long.tsx tests/smoke.test.js
git commit -m "feat(react): add component file size limits"
```

---

### Task 5: Docs — README, CLAUDE.md

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: everything shipped in Tasks 1–4 (option contract `react: { a11y: false }`, `tsconfigPath` pass-through, layer names).
- Produces: user-facing docs; no code.

- [ ] **Step 1: Add the README usage section**

In `README.md`, after the `### Vue / Nuxt` section (ends at line ~38) and before `### Strict (opt-in)`, insert:

````markdown
### React

```js
import vasek from '@vasekzdvihal/eslint-config/react';

export default vasek();
```

Wraps Antfu's React preset (`@eslint-react` — rule IDs surface as `react/*` — plus `eslint-plugin-react-refresh`) and promotes the AI-critical rules to errors: `exhaustive-deps`, `no-array-index-key`, `dangerouslySetInnerHTML`, and the effect-leak rules (timers, listeners, observers, fetches without cleanup). Framework-neutral: Next.js / React Router / Vite specifics are auto-detected.

Accessibility rules (`eslint-plugin-jsx-a11y` — alt text, keyboard handlers on clickable elements, form labels…) are **on by default** as `jsx-a11y/*`. Opt out with `vasek({ react: { a11y: false } })`.

Recommended opt-in: `vasek({ react: { tsconfigPath: 'tsconfig.json' } })` enables the type-aware `react/no-leaked-conditional-rendering` (the `{count && <div/>}` renders-`0` bug).
````

- [ ] **Step 2: Extend the variant table**

In the `## What's in each variant` table, add a `/react` column between `/vue` and `/strict` (✓ on all base rows: Antfu base, `curly`/`eqeqeq`, complexity/max-depth, max-params/id-length, no-magic-numbers, no-console/no-debugger, ts rules) and add these rows:

```markdown
| React support (`react/*`, react-refresh)                         |      |      |  ✓   |         |
| React guardrails as errors: `exhaustive-deps`, `no-array-index-key`, `dangerouslySetInnerHTML`, effect-leak rules | | | ✓ | |
| Accessibility (`jsx-a11y/*`, on by default)                      |      |      |  ✓   |         |
| React files: 100 lines/fn, 400 lines                             |      |      |  ✓   |         |
```

(All existing Vue-only and strict-only rows get an empty cell in the new column.)

- [ ] **Step 3: Update CLAUDE.md**

In `CLAUDE.md`:
- Header paragraph: change "Three entry points: default (TS base), `/vue`, `/strict`." to "Four entry points: default (TS base), `/vue`, `/react`, `/strict`."
- Architecture bullet: change "`src/vue.js` and `src/strict.js` MUST compose by calling `vasek(...)`" to "`src/vue.js`, `src/react.js`, and `src/strict.js` MUST compose by calling `vasek(...)`".
- Architecture bullet on renames: extend to "Antfu renames `@typescript-eslint/*` to `ts/*`, `@eslint-react/*` to `react/*`, and `vuejs-accessibility/*` to `vue-a11y/*`. `jsx-a11y/*` is not renamed."
- Add a bullet next to the `/vue` a11y one: "`/react` enables jsx-a11y by default — `eslint-plugin-jsx-a11y` is a runtime dependency, don't remove it. Opt-out is `react: { a11y: false }` (the `a11y` key is ours, stripped before forwarding to Antfu)."

- [ ] **Step 4: Full verification**

Run: `npm test && npm run lint`
Expected: everything green.

- [ ] **Step 5: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: document the /react variant"
```

---

## Done criteria

All spec sections implemented: factory + three layers (Tasks 1–4), option contract with a11y stripping (Task 3), `tsconfigPath` documented not defaulted (Task 5), fixtures asserting every promoted rule at error severity (Tasks 2–4), packaging (Task 1), docs (Task 5). Variants still don't stack (`/react` + `/strict`) — known limitation, out of scope per spec.
