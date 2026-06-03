const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const { scanDirectory, exportResults } = require('./scanner');

const app = express();
const PORT = 3001;
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
const RESULTS_FILE = path.join(OUTPUTS_DIR, 'results.json');

// Middleware
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
}));
app.use(express.json());

// POST /api/scan
app.post('/api/scan', async (req, res) => {
  try {
    const { path: scanPath } = req.body;

    if (!scanPath) {
      return res.status(400).json({ error: 'Se requiere el campo "path" en el body' });
    }

    const results = await scanDirectory(scanPath);

    // Save results to outputs/results.json
    await fs.mkdir(OUTPUTS_DIR, { recursive: true });
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');

    res.json(results);
  } catch (error) {
    if (error.message.includes('does not exist') || error.message.includes('not a directory')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/results
app.get('/api/results', async (req, res) => {
  try {
    const data = await fs.readFile(RESULTS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'No hay resultados previos' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
