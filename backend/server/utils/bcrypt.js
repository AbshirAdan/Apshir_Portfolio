/**
 * bcrypt password hashing — Phase 3 auth service will use these.
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword, SALT_ROUNDS };
