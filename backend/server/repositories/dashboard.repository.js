const { pool } = require('../config/db');
const TABLES = require('../database/tables');

class DashboardRepository {
  constructor() {
    this.pool = pool;
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async getStats() {
    const countQuery = (table) =>
      `SELECT COUNT(*)::int AS count FROM ${table}`;

    const [
      projects,
      skills,
      certificates,
      education,
      experience,
      blogs,
      messages,
      socialLinks,
      resumes,
      unreadMessages,
    ] = await Promise.all([
      this.query(countQuery(TABLES.PROJECTS)),
      this.query(countQuery(TABLES.SKILLS)),
      this.query(countQuery(TABLES.CERTIFICATES)),
      this.query(countQuery(TABLES.EDUCATION)),
      this.query(countQuery(TABLES.EXPERIENCE)),
      this.query(countQuery(TABLES.BLOGS)),
      this.query(countQuery(TABLES.CONTACT_MESSAGES)),
      this.query(countQuery(TABLES.SOCIAL_LINKS)),
      this.query(countQuery(TABLES.RESUMES)),
      this.query(`SELECT COUNT(*)::int AS count FROM ${TABLES.CONTACT_MESSAGES} WHERE is_read = false`),
    ]);

    const { rows: recentActivity } = await this.query(
      `(SELECT 'project' AS type, id, title AS label, created_at FROM ${TABLES.PROJECTS})
       UNION ALL
       (SELECT 'blog' AS type, id, title AS label, created_at FROM ${TABLES.BLOGS})
       UNION ALL
       (SELECT 'message' AS type, id, COALESCE(subject, full_name) AS label, created_at FROM ${TABLES.CONTACT_MESSAGES})
       UNION ALL
       (SELECT 'certificate' AS type, id, title AS label, created_at FROM ${TABLES.CERTIFICATES})
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return {
      counts: {
        projects: projects.rows[0].count,
        skills: skills.rows[0].count,
        certificates: certificates.rows[0].count,
        education: education.rows[0].count,
        experience: experience.rows[0].count,
        blogs: blogs.rows[0].count,
        messages: messages.rows[0].count,
        unreadMessages: unreadMessages.rows[0].count,
        socialLinks: socialLinks.rows[0].count,
        resumes: resumes.rows[0].count,
      },
      recentActivity,
    };
  }
}

module.exports = DashboardRepository;
