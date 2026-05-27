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

const vueFileOverrides = {
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

export default function vasekVue(options = {}, ...userConfigs) {
  return vasek(
    { vue: true, ...options },
    {
      name: 'vasek/vue-rules',
      files: ['**/*.vue'],
      rules: vueRules,
    },
    {
      name: 'vasek/vue-file-overrides',
      files: ['**/*.vue'],
      rules: vueFileOverrides,
    },
    ...userConfigs,
  );
}
