import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import vasek from '../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = name => resolve(here, 'fixtures', name);

const ERROR = 2;
const WARN = 1;

const eslintCache = new Map();
function getESLint(cwd) {
  if (!eslintCache.has(cwd)) {
    eslintCache.set(cwd, new ESLint({ cwd }));
  }
  return eslintCache.get(cwd);
}

async function lintFile(fixture, file) {
  const cwd = fixtureDir(fixture);
  const [result] = await getESLint(cwd).lintFiles([file]);
  assert.ok(result, `fixture file "${file}" not found in ${cwd}`);
  return result;
}

function ruleSeverities(result) {
  const severities = new Map();
  for (const msg of result.messages || []) {
    if (msg.ruleId) {
      severities.set(msg.ruleId, Math.max(severities.get(msg.ruleId) ?? 0, msg.severity));
    }
  }
  return severities;
}

function assertClean(result) {
  assert.equal(result.errorCount, 0, `expected 0 errors, got messages: ${JSON.stringify(result.messages, null, 2)}`);
  assert.equal(result.warningCount, 0, `expected 0 warnings, got messages: ${JSON.stringify(result.messages, null, 2)}`);
}

function assertFires(result, expected) {
  const severities = ruleSeverities(result);
  for (const [rule, severity] of Object.entries(expected)) {
    assert.ok(severities.has(rule), `expected rule "${rule}" to fire. Got: ${[...severities.keys()].join(', ')}`);
    assert.equal(severities.get(rule), severity, `expected "${rule}" at severity ${severity}, got ${severities.get(rule)}`);
  }
}

it('base: good.ts passes clean', async () => {
  assertClean(await lintFile('base', 'good.ts'));
});

it('base: bad.ts triggers style rules and AI guardrails', async () => {
  const result = await lintFile('base', 'bad.ts');
  assertFires(result, {
    'eqeqeq': ERROR,
    'style/quotes': ERROR,
    'style/semi': ERROR,
    'curly': ERROR,
    'complexity': ERROR,
    'max-depth': ERROR,
    'max-params': ERROR,
    'no-magic-numbers': ERROR,
    'id-length': ERROR,
    'no-debugger': ERROR,
    'ts/no-unused-vars': ERROR,
    'no-console': WARN,
    'ts/no-explicit-any': WARN,
  });
});

it('base: stylistic: false disables formatting rules', async () => {
  const configs = await vasek({ stylistic: false });
  const rules = new Set(configs.flatMap(cfg => Object.keys(cfg.rules || {})));
  for (const rule of ['style/semi', 'style/quotes', 'style/indent']) {
    assert.ok(!rules.has(rule), `expected "${rule}" to be absent with stylistic: false`);
  }
});

it('vue: good.vue passes clean', async () => {
  assertClean(await lintFile('vue', 'good.vue'));
});

it('vue: bad.vue triggers component-api-style', async () => {
  const result = await lintFile('vue', 'bad.vue');
  assertFires(result, { 'vue/component-api-style': ERROR });
});

it('vue: bad-setup.vue triggers SFC and accessibility rules', async () => {
  const result = await lintFile('vue', 'bad-setup.vue');
  assertFires(result, {
    'vue/block-order': ERROR,
    'vue/define-macros-order': ERROR,
    'vue/no-unused-refs': ERROR,
    'vue/require-explicit-emits': ERROR,
    'vue-a11y/alt-text': ERROR,
    'vue-a11y/click-events-have-key-events': ERROR,
  });
});

it('vue: bad-long.vue triggers size limits for .vue files', async () => {
  const result = await lintFile('vue', 'bad-long.vue');
  assertFires(result, {
    'max-lines-per-function': ERROR,
    'max-lines': ERROR,
  });
});

it('strict: good.ts passes clean', async () => {
  assertClean(await lintFile('strict', 'good.ts'));
});

it('strict: bad.ts triggers size limits', async () => {
  const result = await lintFile('strict', 'bad.ts');
  assertFires(result, {
    'max-lines-per-function': ERROR,
    'max-statements': ERROR,
    'max-lines': ERROR,
    'max-classes-per-file': ERROR,
  });
});

it('strict: big.json is not hit by size limits', async () => {
  assertClean(await lintFile('strict', 'big.json'));
});
