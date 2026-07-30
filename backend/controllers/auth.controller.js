const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const config = require('../config');

const login = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const signIn = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, req.file);
  res.status(201).json(new ApiResponse(true, 'Account created successfully', user));
});

const userLogin = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);
  res.status(200).json(new ApiResponse(true, 'Login successful', result));
});

const logout = asyncHandler(async (_req, res) => {
  const result = await authService.logout();
  res.status(200).json(new ApiResponse(true, result.message, null));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json(new ApiResponse(true, 'Profile fetched', user));
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user.id, req.body);
  res.status(200).json(new ApiResponse(true, 'Password changed successfully', user));
});

const refreshToken = asyncHandler(async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.body.token;
  const result = await authService.refreshToken(token);
  res.status(200).json(new ApiResponse(true, 'Token refreshed', result));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  res.status(200).json(new ApiResponse(true, result.message, result));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(new ApiResponse(true, result.message, null));
});

// ==========================================
// OAuth Handlers (Google & GitHub)
// ==========================================

const googleLogin = asyncHandler(async (req, res) => {
  const redirectUri = `${config.apiUrl}/auth/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=profile email`;
  res.redirect(url);
});

const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${config.apiUrl}/auth/google/callback`;

  // 1. Get Access Token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.redirect(`${config.frontendUrl}/login?error=Google_OAuth_Failed`);

  // 2. Get User Profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = await profileRes.json();

  // 3. Process Login
  const result = await authService.oauthLogin({
    provider: 'google',
    provider_id: profileData.id,
    email: profileData.email,
    full_name: profileData.name,
    avatar: profileData.picture,
  });

  res.redirect(`${config.frontendUrl.replace(/\/$/, '')}/signin?token=${result.token}`);
});

const githubLogin = asyncHandler(async (req, res) => {
  const redirectUri = `${config.apiUrl}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(url);
});

const githubCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const redirectUri = `${config.apiUrl}/auth/github/callback`;

  // 1. Get Access Token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.redirect(`${config.frontendUrl}/login?error=GitHub_OAuth_Failed`);

  // 2. Get User Profile
  const profileRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = await profileRes.json();

  // 3. Get Emails (GitHub hides email in primary profile if it's private)
  let email = profileData.email;
  if (!email) {
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const emails = await emailRes.json();
    const primary = emails.find((e) => e.primary) || emails[0];
    if (primary) email = primary.email;
  }

  // 4. Process Login
  const result = await authService.oauthLogin({
    provider: 'github',
    provider_id: profileData.id.toString(),
    email,
    full_name: profileData.name || profileData.login,
    avatar: profileData.avatar_url,
  });

  res.redirect(`${config.frontendUrl.replace(/\/$/, '')}/signin?token=${result.token}`);
});

module.exports = {
  login,
  signIn,
  register,
  userLogin,
  logout,
  getProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
};
