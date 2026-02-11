require('dotenv').config();
const cleanOrphanFiles = require('../utils/orphanCleaner');

cleanOrphanFiles().then(() => process.exit());
