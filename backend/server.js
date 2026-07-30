const app = require('./app');
const config = require('./config');
const { connectDB, pool } = require('./config/db');
const MigrationRunner = require('./database/migrate');
const { seedAdmin } = require('./database/seedAdmin');
const { initSocket } = require('./socket');

const startServer = async () => {
  try {
    if (config.env === 'production') {
      if (!config.jwt.secret || config.jwt.secret.length < 32) {
        throw new Error('[Server] JWT_SECRET must be at least 32 characters in production');
      }
      if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
        throw new Error('[Server] Either DATABASE_URL or DB_PASSWORD is required in production');
      }
    }

    await connectDB();

    const migrator = new MigrationRunner(pool);
    await migrator.run();

    await seedAdmin();

    const server = app.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port} (${config.env})`);
      console.log(`[Server] API base: http://localhost:${config.port}/api`);
      console.log(`[Server] Health:   http://localhost:${config.port}/api/health`);
    });

    initSocket(server);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${config.port} is already in use.`);
        console.error('[Server] Stop the other process first:');
        console.error(`  Get-NetTCPConnection -LocalPort ${config.port} | Select OwningProcess`);
        console.error('  Stop-Process -Id <PID> -Force');
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
