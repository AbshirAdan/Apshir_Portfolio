const UserRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/bcrypt');
const config = require('../config');
const ROLES = require('../constants/roles');

/**
 * Seeds the first admin account from environment variables.
 * Runs once — skips if admin email already exists.
 *
 * Required env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME
 */
const seedAdmin = async () => {
  const { email, password, fullName } = config.adminSeed;

  if (!email || !password || !fullName) {
    console.warn('[Seed] Skipped — set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME in .env');
    return;
  }

  const userRepo = new UserRepository();
  const existing = await userRepo.findByEmail(email);

  if (existing) {
    console.log('[Seed] Admin account already exists');
    return;
  }

  const hashed = await hashPassword(password);
  await userRepo.createAdmin({
    full_name: fullName,
    email,
    password: hashed,
    role: ROLES.ADMIN,
  });

  console.log(`[Seed] Admin account created: ${email}`);
};

module.exports = { seedAdmin };
