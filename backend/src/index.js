const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');
const { runMigrations } = require('./database/migrate');
const { seed } = require('./database/seed');

const startServer = async () => {
  try {
    await connectDB();
    await runMigrations();
    if (config.env === 'development') {
      await seed();
    }

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} (${config.env})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
