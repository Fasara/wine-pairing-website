module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', diagnostics: { ignoreCodes: [151002] } }] },
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/*.module.ts', '!database/migrate.ts', '!database/seed.ts', '!**/*.spec.ts'],
  coverageDirectory: '../coverage',
  coverageThreshold: { global: { lines: 80, statements: 80, functions: 80, branches: 70 } },
  testEnvironment: 'node',
};
