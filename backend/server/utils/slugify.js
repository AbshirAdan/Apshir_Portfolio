/**
 * URL-safe slug generator for projects and blogs.
 * Phase 3 services will call this during create/update.
 */
const slugify = (text) =>
  String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

module.exports = slugify;
