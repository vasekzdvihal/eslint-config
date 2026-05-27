import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = name => resolve(here, 'fixtures', name);

async function lintFile(cwd, file) {
  const eslint = new ESLint({ cwd, errorOnUnmatchedPattern: false });
  const [result] = await eslint.lintFiles([file]);
  return result;
}

function ruleIds(result) {
  return new Set((result.messages || []).map(msg => msg.ruleId).filter(Boolean));
}

it('base: good.ts passes clean', async () => {
  const result = await lintFile(fixtureDir('base'), 'good.ts');
  assert.equal(result.errorCount, 0, `expected 0 errors, got messages: ${JSON.stringify(result.messages, null, 2)}`);
});

it('base: bad.ts triggers expected rules', async () => {
  const result = await lintFile(fixtureDir('base'), 'bad.ts');
  const rules = ruleIds(result);
  const expected = [
    'eqeqeq',
    'style/quotes',
    'style/semi',
    'curly',
    'no-console',
  ];
  for (const rule of expected) {
    assert.ok(rules.has(rule), `expected rule "${rule}" to fire. Got: ${[...rules].join(', ')}`);
  }
});

it('vue: good.vue passes clean', async () => {
  const result = await lintFile(fixtureDir('vue'), 'good.vue');
  assert.equal(result.errorCount, 0, `expected 0 errors, got messages: ${JSON.stringify(result.messages, null, 2)}`);
});

it('vue: bad.vue triggers component-api-style', async () => {
  const result = await lintFile(fixtureDir('vue'), 'bad.vue');
  const rules = ruleIds(result);
  assert.ok(rules.has('vue/component-api-style'), `expected vue/component-api-style. Got: ${[...rules].join(', ')}`);
});

it('strict: good.ts passes clean', async () => {
  const result = await lintFile(fixtureDir('strict'), 'good.ts');
  assert.equal(result.errorCount, 0, `expected 0 errors, got messages: ${JSON.stringify(result.messages, null, 2)}`);
});

it('strict: bad.ts triggers size limits', async () => {
  const result = await lintFile(fixtureDir('strict'), 'bad.ts');
  const rules = ruleIds(result);
  const expected = ['max-lines-per-function', 'max-statements'];
  for (const rule of expected) {
    assert.ok(rules.has(rule), `expected rule "${rule}" to fire. Got: ${[...rules].join(', ')}`);
  }
});
