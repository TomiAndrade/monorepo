const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const { scanDirectory, exportResults } = require('./scanner');
const logger = require('./pipeline/PipelineLogger');
const { generateSummary } = require('./pipeline/SummaryGenerator');

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
    const { path: scanPath, maxFileSizeMB, errorExtensions, allowedExtensions } = req.body;

    if (!scanPath) {
      return res.status(400).json({ error: 'Se requiere el campo "path" en el body' });
    }

    const qualityOptions = {
      ...(maxFileSizeMB != null && { maxFileSizeBytes: maxFileSizeMB * 1024 * 1024 }),
      ...(errorExtensions && { errorExtensions }),
      ...(allowedExtensions && { allowedExtensions }),
    };

    logger.info(`Scan iniciado: ${scanPath}`);

    const results = await scanDirectory(scanPath, qualityOptions);

    // Aggregate metadata warnings into pipeline errors for reporting
    const pipelineErrors = [];
    for (const file of results.files ?? []) {
      for (const w of file.metadata?.warnings ?? []) {
        pipelineErrors.push({
          stage: 'metadata',
          file: file.path,
          message: w,
          timestamp: new Date().toISOString(),
        });
      }
    }
    if (pipelineErrors.length > 0) {
      results.pipelineErrors = pipelineErrors;
      logger.warn(`${pipelineErrors.length} advertencia(s) de metadata durante el escaneo`);
    }

    const q = results.quality?.summary;
    logger.info(`Scan completado: ${results.totalFiles} archivos, calidad: ${q?.errors ?? 0} error(es), ${q?.warnings ?? 0} advertencia(s)`);

    // Save results to outputs/results.json
    await fs.mkdir(OUTPUTS_DIR, { recursive: true });
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');

    // Generate human-readable summary
    await generateSummary(results);

    res.json(results);
  } catch (error) {
    logger.error(error.message);
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
