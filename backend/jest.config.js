/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['server/utils/**/*.js', 'server/middlewares/**/*.js'],
  coverageDirectory: 'coverage',
  verbose: true,
};
