const parseProjectBody = (req, _res, next) => {
  if (req.body.technologies && typeof req.body.technologies === 'string') {
    try {
      req.body.technologies = JSON.parse(req.body.technologies);
    } catch {
      req.body.technologies = req.body.technologies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (req.body.featured !== undefined) {
    req.body.featured = req.body.featured === true || req.body.featured === 'true';
  }

  next();
};

module.exports = parseProjectBody;
