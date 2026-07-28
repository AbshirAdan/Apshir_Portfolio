const fs = require('fs');
const path = require('path');

/**
 * Migration runner — applies SQL files in order.
 * Tracks applied migrations in schema_migrations table.
 * Phase 2: schema only, no seed data.
 */
class MigrationRunner {
  constructor(pool) {
    this.pool = pool;
    this.migrationsDir = path.join(__dirname, 'migrations');
  }

  async ensureMigrationTable(client) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);
  }

  async getApplied(client) {
    const { rows } = await client.query('SELECT filename FROM schema_migrations');
    return new Set(rows.map((r) => r.filename));
  }

  async run() {
    const client = await this.pool.connect();

    try {
      await this.ensureMigrationTable(client);
      const applied = await this.getApplied(client);

      const files = fs
        .readdirSync(this.migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (applied.has(file)) continue;

        const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[Migration] Applied: ${file}`);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = MigrationRunner;
