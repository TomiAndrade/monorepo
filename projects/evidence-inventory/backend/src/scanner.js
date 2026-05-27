const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const csv = require('fast-csv');

/**
 * Scan a directory recursively and collect file statistics
 * @param {string} rootPath - The root directory path to scan
 * @returns {Promise<Object>} - Scan results object
 */
async function scanDirectory(rootPath) {
  try {
    // Check if path exists
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${rootPath}`);
    }

    const results = {
      scannedPath: rootPath,
      totalFiles: 0,
      totalSizeBytes: 0,
      emptyFolders: [],
      byExtension: {}
    };

    const emptyFolders = new Set();

    // Recursive scan function
    async function scanDir(dirPath, relativePath = '') {
      let hasFiles = false;
      let hasSubfolders = false;

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const entryRelativePath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            hasSubfolders = true;
            await scanDir(fullPath, entryRelativePath);
          } else if (entry.isFile()) {
            hasFiles = true;
            const fileStats = await fs.stat(fullPath);
            const ext = path.extname(entry.name).toLowerCase() || '.no-extension';
            const fileSize = fileStats.size;

            // Update totals
            results.totalFiles++;
            results.totalSizeBytes += fileSize;

            // Group by extension
            if (!results.byExtension[ext]) {
              results.byExtension[ext] = {
                count: 0,
                totalSizeBytes: 0,
                totalSizeMB: 0
              };
            }

            results.byExtension[ext].count++;
            results.byExtension[ext].totalSizeBytes += fileSize;
          }
        }

        // Check if folder is empty (no files and no subfolders with files)
        if (!hasFiles && !hasSubfolders) {
          emptyFolders.add(relativePath);
        }
      } catch (error) {
        if (error.code === 'EACCES' || error.code === 'EPERM') {
          console.warn(`Permission denied: ${dirPath}`);
        } else {
          throw error;
        }
      }
    }

    await scanDir(rootPath);

    // Convert Set to array and sort
    results.emptyFolders = Array.from(emptyFolders).sort();

    // Calculate MB for each extension
    for (const ext in results.byExtension) {
      results.byExtension[ext].totalSizeMB = parseFloat(
        (results.byExtension[ext].totalSizeBytes / (1024 * 1024)).toFixed(2)
      );
    }

    return results;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Path does not exist: ${rootPath}`);
    }
    throw error;
  }
}

/**
 * Export scan results to JSON and CSV files
 * @param {Object} results - The scan results object
 * @param {string} outputPath - The output directory path
 */
async function exportResults(results, outputPath) {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Export JSON
    const jsonPath = path.join(outputPath, 'scan-results.json');
    await fs.writeFile(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

    // Export CSV
    const csvPath = path.join(outputPath, 'scan-results.csv');
    const csvData = [];

    for (const [extension, data] of Object.entries(results.byExtension)) {
      csvData.push({
        extension: extension,
        fileCount: data.count,
        totalSizeBytes: data.totalSizeBytes,
        totalSizeMB: data.totalSizeMB
      });
    }

    // Sort by extension
    csvData.sort((a, b) => a.extension.localeCompare(b.extension));

    await new Promise((resolve, reject) => {
      const ws = fsSync.createWriteStream(csvPath);
      csv.write(csvData, { headers: true })
        .pipe(ws)
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log(`Results exported to: ${jsonPath}`);
    console.log(`Results exported to: ${csvPath}`);
  } catch (error) {
    throw new Error(`Failed to export results: ${error.message}`);
  }
}

module.exports = {
  scanDirectory,
  exportResults
};
