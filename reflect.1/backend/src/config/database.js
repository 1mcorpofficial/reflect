// Database configuration
// (Placeholder for future MongoDB integration)

const initDB = async () => {
  try {
    console.log('Database initialized (no DB configured yet)');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { initDB };
