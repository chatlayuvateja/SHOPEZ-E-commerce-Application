const fs = require('fs');
const path = require('path');

const loadEnv = (envPath) => {
  const resolvedPath = path.resolve(envPath || '.env');
  
  try {
    const data = fs.readFileSync(resolvedPath, 'utf8');
    data.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;
      
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (err) {
    // .env file not found, just continue
  }
};

module.exports = { loadEnv };
