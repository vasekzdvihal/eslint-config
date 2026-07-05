import antfu from '@antfu/eslint-config';

/** Source files the style/guardrail layers apply to — keeps them off Antfu's JSON/YAML/Markdown virtual files. */
export const srcFiles = ['**/*.?([cm])[jt]s?(x)', '**/*.vue'];

const styleRules = {
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
};

const aiGuardrails = {
  'complexity': ['error', 10],
  'max-depth': ['error', 4],
  'max-params': ['error', 4],
  'no-magic-numbers': ['error', {
    ignore: [0, 1, -1, 2],
    ignoreArrayIndexes: true,
    enforceConst: true,
    detectObjects: false,
  }],
  'id-length': ['error', {
    min: 2,
    exceptions: ['_', 'i', 'j', 'x', 'y'],
  }],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': 'error',
};

const typescriptRules = {
  'ts/no-explicit-any': 'warn',
  'ts/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
};

/**
 * Base config: Antfu (`type: 'lib'`, TypeScript, stylistic semi/single-quotes/2-space indent)
 * plus style overrides and AI guardrails.
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the defaults. `stylistic: false` disables all formatting rules;
 *   a `stylistic` object is merged over the semi/single-quotes/2-space defaults.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof antfu>} Antfu's `FlatConfigComposer` — `.override()` etc. chain on it.
 */
export default function vasek(options = {}, ...userConfigs) {
  const { stylistic: stylisticOption, ...rest } = options;

  const stylistic = stylisticOption === false
    ? false
    : {
        semi: true,
        quotes: 'single',
        indent: 2,
        ...stylisticOption,
      };

  return antfu(
    {
      type: 'lib',
      typescript: true,
      stylistic,
      ...rest,
    },
    {
      name: 'vasek/style',
      files: srcFiles,
      rules: styleRules,
    },
    {
      name: 'vasek/ai-guardrails',
      files: srcFiles,
      rules: aiGuardrails,
    },
    {
      name: 'vasek/typescript',
      files: ['**/*.{ts,tsx,vue}'],
      rules: typescriptRules,
    },
    ...userConfigs,
  );
}
