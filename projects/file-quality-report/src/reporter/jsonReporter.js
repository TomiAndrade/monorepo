// Guarda el reporte formateado como archivo JSON

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

export function saveJsonReport(formattedReport, outputPath) {
  const absolutePath = resolve(outputPath);

  // Crear directorio si no existe
  const dir = dirname(absolutePath);
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    throw new Error(`No se pudo crear el directorio de salida: ${dir}\n${err.message}`);
  }

  // Agregar metadatos
  const reportWithMeta = {
    ...formattedReport,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  // Guardar archivo
  try {
    writeFileSync(absolutePath, JSON.stringify(reportWithMeta, null, 2), 'utf-8');
  } catch (err) {
    throw new Error(`No se pudo escribir el archivo: ${absolutePath}\n${err.message}`);
  }

  return absolutePath;
}
