/**
 * Domain entity definitions — maps 1:1 to PostgreSQL tables.
 * Used as JSDoc reference for Phase 3 services and repositories.
 *
 * @typedef {Object} User
 * @property {string} id          - UUID
 * @property {string} full_name
 * @property {string} email
 * @property {string} password    - bcrypt hash (never returned in API)
 * @property {'admin'|'editor'} role
 * @property {string|null} avatar
 * @property {string|null} phone
 * @property {string|null} bio
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} Project
 * @property {string} id          - UUID
 * @property {string} user_id     - FK → users
 * @property {string} title
 * @property {string} slug
 * @property {string|null} short_description
 * @property {string|null} full_description
 * @property {string[]} technologies
 * @property {string|null} github_url
 * @property {string|null} live_demo_url
 * @property {string|null} thumbnail
 * @property {boolean} featured
 * @property {'draft'|'published'|'archived'} status
 *
 * @typedef {Object} ProjectImage
 * @property {string} id          - UUID
 * @property {string} project_id  - FK → projects (CASCADE)
 * @property {string} image
 *
 * @typedef {Object} Skill
 * @property {string} id
 * @property {string} name
 * @property {number} percentage  - 0–100
 * @property {string|null} icon
 * @property {string|null} category
 * @property {number} display_order
 *
 * @typedef {Object} Certificate
 * @property {string} id
 * @property {string} title
 * @property {string|null} organization
 * @property {string|null} issue_date
 * @property {string|null} credential_url
 * @property {string|null} image
 *
 * @typedef {Object} Education
 * @property {string} id
 * @property {string|null} user_id
 * @property {string} school
 * @property {string|null} degree
 * @property {string|null} field
 * @property {string|null} start_date
 * @property {string|null} end_date
 *
 * @typedef {Object} Experience
 * @property {string} id
 * @property {string|null} user_id
 * @property {string} company
 * @property {string|null} position
 * @property {string|null} start_date
 * @property {string|null} end_date
 * @property {string|null} description
 *
 * @typedef {Object} Blog
 * @property {string} id
 * @property {string|null} user_id
 * @property {string} title
 * @property {string} slug
 * @property {string|null} cover_image
 * @property {string} content
 * @property {boolean} published
 *
 * @typedef {Object} ContactMessage
 * @property {string} id
 * @property {string} full_name
 * @property {string} email
 * @property {string|null} subject
 * @property {string} message
 * @property {boolean} is_read
 *
 * @typedef {Object} SocialLink
 * @property {string} id
 * @property {string} platform
 * @property {string} url
 * @property {string|null} icon
 *
 * @typedef {Object} Resume
 * @property {string} id
 * @property {string} file_url
 * @property {string} version
 *
 * @typedef {Object} VisitorLog
 * @property {string} id
 * @property {string|null} ip_address
 * @property {string|null} browser
 * @property {string|null} operating_system
 * @property {string|null} country
 * @property {string|null} device
 * @property {string|null} page
 * @property {string} visited_at
 *
 * @typedef {Object} Settings
 * @property {string} id
 * @property {string|null} site_title
 * @property {string|null} hero_title
 * @property {string|null} hero_description
 * @property {string|null} logo
 * @property {string|null} favicon
 * @property {string|null} primary_color
 */

module.exports = {};
