const fs = require('fs/promises');
const path = require('path');

const OUTPUTS_DIR = path.join(__dirname, '../../outputs');
const LOG_FILE = path.join(OUTPUTS_DIR, 'pipeline.log');

function formatLine(level, message) {
  return `[${new Date().toISOString()}] [Pipeline][${level}] ${message}`;
}

async function persist(line) {
  try {
    await fs.mkdir(OUTPUTS_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, line + '\n', 'utf-8');
  } catch {
    // Logging failures never break the pipeline
  }
}

function info(message) {
  const line = formatLine('INFO', message);
  console.log(line);
  persist(line);
}

function warn(message) {
  const line = formatLine('WARN', message);
  console.warn(line);
  persist(line);
}

function error(message) {
  const line = formatLine('ERROR', message);
  console.error(line);
  persist(line);
}

module.exports = { info, warn, error };
