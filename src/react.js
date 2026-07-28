import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import vasek from './index.js';

/** JSX/TSX files the React layers apply to. */
const reactFiles = ['**/*.{jsx,tsx}'];

/**
 * The maintained `eslint-plugin-jsx-a11y-x` fork (the original tops out at ESLint 9),
 * registered under the familiar `jsx-a11y/*` rule IDs.
 */
const jsxA11yRules = Object.fromEntries(
  Object.entries(jsxA11y.configs.recommended.rules)
    .map(([id, value]) => [id.replace('jsx-a11y-x/', 'jsx-a11y/'), value]),
);

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
          rules: jsxA11yRules,
        }]
      : []),
    ...userConfigs,
  );
}
