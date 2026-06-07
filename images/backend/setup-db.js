const { initDatabase } = require('./database');

console.log('🔧 Setting up database...\n');
initDatabase();
console.log('\n✅ Setup complete! You can now start the server with: npm start');
