import vasek from './index.js';

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

export default function vasekStrict(options = {}, ...userConfigs) {
  return vasek(
    options,
    {
      name: 'vasek/strict-limits',
      rules: strictLimits,
    },
    ...userConfigs,
  );
}
