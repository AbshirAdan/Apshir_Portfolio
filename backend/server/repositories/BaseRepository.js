/**
 * BaseRepository — abstract data-access layer.
 * All table-specific repositories extend this class.
 * Keeps SQL out of services/controllers (Repository Pattern).
 *
 * Phase 3: create UserRepository, ProjectRepository, etc.
 */
class BaseRepository {
  constructor(pool, tableName) {
    if (new.target === BaseRepository) {
      throw new Error('BaseRepository cannot be instantiated directly');
    }
    this.pool = pool;
    this.tableName = tableName;
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async findById(id) {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findAll(orderBy = 'created_at DESC') {
    const { rows } = await this.query(
      `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`
    );
    return rows;
  }

  async deleteById(id) {
    const { rows } = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0] || null;
  }

  async count() {
    const { rows } = await this.query(
      `SELECT COUNT(*)::int AS count FROM ${this.tableName}`
    );
    return rows[0].count;
  }
}

module.exports = BaseRepository;
