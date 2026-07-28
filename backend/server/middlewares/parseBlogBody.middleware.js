const parseBlogBody = (req, _res, next) => {
  if (req.body.published !== undefined) {
    req.body.published = req.body.published === true || req.body.published === 'true';
  }
  if (req.body.featured !== undefined) {
    req.body.featured = req.body.featured === true || req.body.featured === 'true';
  }
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch {
      req.body.tags = req.body.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  if (req.body.reading_time !== undefined && req.body.reading_time !== '') {
    req.body.reading_time = Number(req.body.reading_time);
  }
  if (req.body.status === 'published') {
    req.body.published = true;
  }
  if (req.body.status === 'draft') {
    req.body.published = false;
  }
  next();
};

module.exports = parseBlogBody;
