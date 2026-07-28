const VisitorLogRepository = require('../repositories/visitorLog.repository');

const repo = new VisitorLogRepository();

const track = async (body, req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;

  return repo.create({
    ip_address: ip,
    browser: body.browser || null,
    operating_system: body.operating_system || null,
    country: body.country || null,
    device: body.device || null,
    page: body.page || null,
    referrer: body.referrer || req.headers.referer || null,
  });
};

module.exports = { track };
