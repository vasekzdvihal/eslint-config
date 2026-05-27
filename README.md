# @vasekzdvihal/eslint-config

Shared ESLint flat config for my Vue/Nuxt/TS projects. Wraps [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) and layers on personal style choices plus AI guardrails.

## Why

One source of truth for ESLint across projects. Style rules and AI guardrails (complexity, function size, magic numbers) are enforced mechanically — no relying on CLAUDE.md prompts.

## Install

```bash
npm i -D @vasekzdvihal/eslint-config eslint
```

Requires Node `>=20` and ESLint `^9.10.0 || ^10`.

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

### Strict (opt-in)

Adds harder size/complexity limits on top of the base. Use for new projects.

```js
import vasek from '@vasekzdvihal/eslint-config/strict';

export default vasek();
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

## What's in each variant

| Rule group                            | base | /vue | /strict |
|---------------------------------------|:----:|:----:|:-------:|
| Antfu base (TS, stylistic)            |  ✓   |  ✓   |    ✓    |
| Vue / Nuxt support                    |      |  ✓   |         |
| `curly`, `eqeqeq`                     |  ✓   |  ✓   |    ✓    |
| `complexity: 10`, `max-depth: 4`      |  ✓   |  ✓   |    ✓    |
| `max-params: 4`, `id-length: 2`       |  ✓   |  ✓   |    ✓    |
| `no-magic-numbers` (ignores 0,1,-1,2) |  ✓   |  ✓   |    ✓    |
| `no-console: warn`, `no-debugger`     |  ✓   |  ✓   |    ✓    |
| `script-setup` enforced (Vue only)    |      |  ✓   |         |
| Vue files: 100 lines/fn, 400 lines    |      |  ✓   |         |
| `max-lines-per-function: 50`          |      |      |    ✓    |
| `max-lines: 250`, `max-statements: 20`|      |      |    ✓    |
| `max-classes-per-file: 1`             |      |      |    ✓    |

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

See `examples/consumer-project/` for a minimal working setup.

## License

MIT
