# @vasekzdvihal/eslint-config

Shared ESLint flat config for my Vue/Nuxt/TS projects. Wraps [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) and layers on personal style choices plus AI guardrails.

## Why

One source of truth for ESLint across projects. Style rules and AI guardrails (complexity, function size, magic numbers) are enforced mechanically — no relying on CLAUDE.md prompts. Limits like `complexity: 10` and `max-params: 4` exist to keep AI-generated code reviewable: small functions, shallow nesting, no unexplained constants. Full rationale lives in [the design brief](docs/specs/2026-05-27-eslint-config-design.md).

## Install

```bash
npm i -D @vasekzdvihal/eslint-config eslint
```

Requires Node `>=22` and ESLint `^9.10.0 || ^10`. Heads-up: wrapping Antfu means a sizeable transitive install (~330 packages) — enable npm caching in CI.

## Usage

Flat config only. Pick a variant:

### Base (TypeScript projects)

```js
// eslint.config.js
import vasek from '@vasekzdvihal/eslint-config';

export default vasek();
```

### Vue / Nuxt

```js
import vasek from '@vasekzdvihal/eslint-config/vue';

export default vasek();
```

Accessibility rules (`eslint-plugin-vuejs-accessibility` — alt text, keyboard handlers on clickable elements, form labels…) are **on by default**. They surface as `vue-a11y/*` rule IDs. Opt out with `vasek({ vue: { a11y: false } })`.

### Strict (opt-in)

Adds harder size/complexity limits on top of the base. Use for new projects.

```js
import vasek from '@vasekzdvihal/eslint-config/strict';

export default vasek();
```

Variants don't stack — pick one entry point. For a strict Vue project, use `/vue` and add the limits as an extra config block:

```js
import vasek from '@vasekzdvihal/eslint-config/vue';

export default vasek({}, {
  files: ['**/*.{ts,vue}'],
  rules: {
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-lines': ['error', { max: 250, skipBlankLines: true }],
    'max-statements': ['error', 20],
    'max-classes-per-file': ['error', 1],
  },
});
```

## Customising

The factory accepts Antfu's options as the first arg and any number of additional flat-config blocks after:

```js
import vasek from '@vasekzdvihal/eslint-config/vue';

export default vasek(
  { stylistic: { indent: 4 } },
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
);
```

The returned object is Antfu's `FlatConfigComposer`, so `.override()` and `.renamePlugins()` work too.

Defaults passed to Antfu: `type: 'lib'`, `typescript: true`, and stylistic semi/single-quotes/2-space-indent. Any Antfu option can be overridden — e.g. `vasek({ type: 'app' })` for application code, or `vasek({ stylistic: false })` to drop the formatting rules.

Note: Antfu renames plugin prefixes. Override the short names — `ts/no-explicit-any`, `style/semi`, `vue-a11y/alt-text` — not `@typescript-eslint/…`/`@stylistic/…` long forms (those silently do nothing).

## What's in each variant

| Rule group                                                      | base | /vue | /strict |
|------------------------------------------------------------------|:----:|:----:|:-------:|
| Antfu base (TS, stylistic)                                       |  ✓   |  ✓   |    ✓    |
| Vue / Nuxt support                                               |      |  ✓   |         |
| `curly`, `eqeqeq`                                                |  ✓   |  ✓   |    ✓    |
| `complexity: 10`, `max-depth: 4`                                 |  ✓   |  ✓   |    ✓    |
| `max-params: 4`, `id-length: 2`                                  |  ✓   |  ✓   |    ✓    |
| `no-magic-numbers` (ignores 0,1,-1,2)                            |  ✓   |  ✓   |    ✓    |
| `no-console: warn`, `no-debugger`                                |  ✓   |  ✓   |    ✓    |
| `ts/no-explicit-any: warn`, `ts/no-unused-vars` (`_` ignored)    |  ✓   |  ✓   |    ✓    |
| `script-setup` enforced (Vue only)                               |      |  ✓   |         |
| Vue: `block-order`, `define-macros-order`, `no-unused-refs`, `require-explicit-emits`, `multi-word-component-names: off` | | ✓ | |
| Accessibility (`vue-a11y/*`, on by default)                      |      |  ✓   |         |
| Vue files: 100 lines/fn, 400 lines                               |      |  ✓   |         |
| `max-lines-per-function: 50`                                     |      |      |    ✓    |
| `max-lines: 250`, `max-statements: 20`                           |      |      |    ✓    |
| `max-classes-per-file: 1`                                        |      |      |    ✓    |

The style/guardrail layers apply to source files (`.js`/`.ts`/`.tsx`/`.vue` and friends) only — JSON, YAML, and Markdown files linted by Antfu's presets are not subject to them.

Style: single quotes, semicolons, 2-space indent (all driven by Antfu's stylistic plugin).

## Migrating an existing project

### From `@nuxt/eslint-config`

It also wraps Antfu under the hood, so the cleanest path is to replace it rather than stack the two:

```diff
- import { createConfigForNuxt } from '@nuxt/eslint-config';
+ import vasek from '@vasekzdvihal/eslint-config/vue';

- export default createConfigForNuxt({ ... });
+ export default vasek();
```

Run `npm run lint` and fix anything that fires. Expect a lot of style/quote/semi auto-fixes the first time — `eslint --fix` handles those.

### From a plain Antfu config

Just swap the import:

```diff
- import antfu from '@antfu/eslint-config';
+ import vasek from '@vasekzdvihal/eslint-config';

- export default antfu({ typescript: true });
+ export default vasek();
```

## Local development

```bash
npm install
npm test          # runs fixture-based smoke tests
npm run lint      # lints src + tests
```

The package is dogfooded — `src/` and `tests/` are themselves linted with the local config.

To try the package in a real project before publishing:

```bash
# in this repo
npm link

# in your consumer project
npm link @vasekzdvihal/eslint-config
```

See `examples/consumer-project/` for a minimal working setup — it references this package via `file:../..`, so a plain `npm install` there resolves to the local source.

## License

MIT
