const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const { comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');

const login = async ({ email, password }) => {
  const admin = await Admin.findByEmail(email);
  if (!admin) throw new ApiError(401, 'Invalid email or password');

  const valid = await comparePassword(password, admin.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: admin.id, email: admin.email });
  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
};

const getMe = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');
  return admin;
};

module.exports = { login, getMe };
