// Carga la configuración desde fqr.config.json en el directorio actual
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const CONFIG_FILENAME = 'fqr.config.json';

export function loadConfig(targetDirectory) {
  const searchPaths = [
    join(targetDirectory, CONFIG_FILENAME),
    join(process.cwd(), CONFIG_FILENAME),
  ];

  for (const configPath of searchPaths) {
    if (existsSync(resolve(configPath))) {
      try {
        const raw = readFileSync(resolve(configPath), 'utf-8');
        return JSON.parse(raw);
      } catch {
        console.error(`⚠️  Error al leer ${configPath}, se usará la configuración por defecto.`);
      }
    }
  }

  return {};
}
