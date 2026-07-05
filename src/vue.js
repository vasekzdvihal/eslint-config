import vasek from './index.js';

const vueRules = {
  'vue/component-api-style': ['error', ['script-setup']],
  'vue/multi-word-component-names': 'off',
  'vue/no-unused-refs': 'error',
  'vue/require-explicit-emits': 'error',
  'vue/define-macros-order': ['error', {
    order: ['defineProps', 'defineEmits'],
  }],
  'vue/block-order': ['error', {
    order: ['script', 'template', 'style'],
  }],
};

const vueFileLimits = {
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

/**
 * Vue/Nuxt variant: composes the base config with `vue: { a11y: true }`
 * (accessibility rules via `eslint-plugin-vuejs-accessibility`), Vue SFC rules,
 * and looser size limits for `.vue` files.
 *
 * @param {import('@antfu/eslint-config').OptionsConfig & Omit<import('@antfu/eslint-config').TypedFlatConfigItem, 'files'>} [options]
 *   Antfu options, merged over the defaults. Pass `vue: { a11y: false }` to opt out of
 *   accessibility rules while keeping Vue support.
 * @param {...import('@antfu/eslint-config').TypedFlatConfigItem} userConfigs
 *   Extra flat-config blocks appended last, so they win over everything here.
 * @returns {ReturnType<typeof vasek>} Antfu's `FlatConfigComposer`.
 */
export default function vasekVue(options = {}, ...userConfigs) {
  return vasek(
    { vue: { a11y: true }, ...options },
    {
      name: 'vasek/vue',
      files: ['**/*.vue'],
      rules: vueRules,
    },
    {
      name: 'vasek/vue-files',
      files: ['**/*.vue'],
      rules: vueFileLimits,
    },
    ...userConfigs,
  );
}
