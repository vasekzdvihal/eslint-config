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
