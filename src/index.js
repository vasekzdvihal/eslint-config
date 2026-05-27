import antfu from '@antfu/eslint-config';

const styleOverrides = {
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

const typescriptOverrides = {
  'ts/no-explicit-any': 'warn',
  'ts/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
};

export default function vasek(options = {}, ...userConfigs) {
  const { stylistic: stylisticOption, ...rest } = options;

  return antfu(
    {
      type: 'lib',
      typescript: true,
      stylistic: {
        semi: true,
        quotes: 'single',
        indent: 2,
        ...stylisticOption,
      },
      ...rest,
    },
    {
      name: 'vasek/style-overrides',
      rules: styleOverrides,
    },
    {
      name: 'vasek/ai-guardrails',
      rules: aiGuardrails,
    },
    {
      name: 'vasek/typescript-overrides',
      files: ['**/*.{ts,tsx,vue}'],
      rules: typescriptOverrides,
    },
    ...userConfigs,
  );
}
