// Enforces the Conventional Commits specification on every commit message.
// See CONTRIBUTING.md for the allowed types and format.

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
};

export default config;
