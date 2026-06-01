// Imprime el reporte formateado en consola con colores ANSI

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const SEVERITY_COLORS = {
  error: COLORS.red,
  warning: COLORS.yellow,
  info: COLORS.cyan,
};

export function printReport(formattedReport) {
  const { summary, sections, suggestedActions } = formattedReport;

  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}   FILE QUALITY REPORT${COLORS.reset}`);
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log();

  // Imprimir secciones
  for (const section of sections) {
    const color = SEVERITY_COLORS[section.severity] || COLORS.reset;
    const icon = section.severity === 'error' ? '✖' : section.severity === 'warning' ? '⚠' : 'ℹ';

    console.log(`${color}${COLORS.bold}${icon} ${section.title}${COLORS.reset}`);
    console.log(`${color}${'-'.repeat(section.title.length + 2)}${COLORS.reset}`);

    for (const item of section.items) {
      console.log(`  ${item}`);
    }
    console.log();
  }

  // Acciones sugeridas
  if (suggestedActions && suggestedActions.length > 0) {
    console.log(`${COLORS.bold}Acciones sugeridas:${COLORS.reset}`);
    for (const action of suggestedActions) {
      console.log(`  • ${action}`);
    }
    console.log();
  }

  // Resumen final
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}Resumen:${COLORS.reset}`);
  console.log(`  ${COLORS.red}Errores: ${summary.errors}${COLORS.reset}`);
  console.log(`  ${COLORS.yellow}Advertencias: ${summary.warnings}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}Informativos: ${summary.infos}${COLORS.reset}`);
  console.log(`  ${COLORS.bold}Total: ${summary.total}${COLORS.reset}`);
  console.log(`${COLORS.bold}═══════════════════════════════════════${COLORS.reset}`);
}
