/**
 * Validator index — import all rule sets from one place.
 */
module.exports = {
  ...require('./auth.validator'),
  ...require('./project.validator'),
  ...require('./skill.validator'),
  ...require('./blog.validator'),
  ...require('./contact.validator'),
  ...require('./certificate.validator'),
  ...require('./settings.validator'),
  ...require('./education.validator'),
  ...require('./experience.validator'),
  ...require('./socialLink.validator'),
  ...require('./profile.validator'),
  ...require('./common.validator'),
};
