import vasek, { srcFiles } from './index.js';

const strictLimits = {
  'max-lines-per-function': ['error', {
    max: 50,
    skipBlankLines: true,
    skipComments: true,
  }],
  'max-lines': ['error', {
    max: 250,
    skipBlankLines: true,
  }],
  'max-statements': ['error', 20],
  'max-classes-per-file': ['error', 1],
};

/**
 * Strict variant: composes the base config with hard size/complexity limits.
 * Opt-in for new projects; the base stays adoptable in legacy code.
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the base defaults.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof vasek>} Antfu's `FlatConfigComposer`.
 */
export default function vasekStrict(options = {}, ...userConfigs) {
  return vasek(
    options,
    {
      name: 'vasek/strict',
      files: srcFiles,
      rules: strictLimits,
    },
    ...userConfigs,
  );
}
