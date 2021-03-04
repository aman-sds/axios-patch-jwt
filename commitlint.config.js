const Configuration = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: './parser-preset',
  formatter: '@commitlint/format',
  rules: {
    'type-enum': [2, 'always', ['FIX', 'FEATURE', 'TEST', 'REFACTOR']],
    'type-case': [2, 'always', 'upper-case'],
    'scope-case': [2, 'always', 'upper-case'],
    'scope-enum': [2, 'always', ['BE', 'FE', 'MOB']],
    'subject-case': [1, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 120]
  }
};

module.exports = Configuration;
