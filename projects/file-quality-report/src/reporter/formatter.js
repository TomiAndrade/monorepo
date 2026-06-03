// Formatea los resultados del analyzer en un objeto estructurado para reporte

// Remapea severidades según especificación:
// ERROR → empty, duplicate, unexpected_extension (si errorExtensions lo marca)
// WARNING → unexpected_extension (por defecto), too_large, no_extension, invalid_date
// INFO → too_small
function remapSeverity(result) {
  const severityMap = {
    empty: 'error',
    duplicate: 'error',
    too_large: 'warning',
    too_small: 'info',
    no_extension: 'warning',
    invalid_date: 'warning',
  };
  // unexpected_extension usa la severidad del analyzer (puede ser 'error' o 'warning' según config)
  return severityMap[result.type] ?? result.severity;
}

export function formatReport(results) {
  // Aplicar remapeo de severidades
  const remappedResults = results.map(r => ({
    ...r,
    severity: remapSeverity(r),
  }));

  const errors = remappedResults.filter(r => r.severity === 'error');
  const warnings = remappedResults.filter(r => r.severity === 'warning');
  const infos = remappedResults.filter(r => r.severity === 'info');

  const sections = [];
  const suggestedActions = [];

  // Errores
  if (errors.length > 0) {
    const errorItems = errors.map(r => `${r.file}: ${r.message}`);
    sections.push({
      title: 'Errores',
      severity: 'error',
      items: errorItems,
    });
  }

  // Generar acciones sugeridas basadas en tipos de todos los resultados
  const hasEmptyFiles = remappedResults.some(r => r.type === 'empty');
  const hasUnexpectedExt = remappedResults.some(r => r.type === 'unexpected_extension');
  const hasDuplicates = remappedResults.some(r => r.type === 'duplicate');
  const hasTooLarge = remappedResults.some(r => r.type === 'too_large');
  const hasMissingMetadata = remappedResults.some(r => r.type === 'no_extension' || r.type === 'invalid_date');

  if (hasEmptyFiles) {
    suggestedActions.push('Eliminar archivos vacíos o agregarles contenido relevante');
  }
  if (hasUnexpectedExt) {
    suggestedActions.push('Revisar archivos con extensiones no esperadas y moverlos o renombrarlos');
  }
  if (hasDuplicates) {
    suggestedActions.push('Eliminar duplicados probables conservando solo una copia');
  }
  if (hasTooLarge) {
    suggestedActions.push('Considerar comprimir o mover archivos muy grandes a almacenamiento externo');
  }
  if (hasMissingMetadata) {
    suggestedActions.push('Agregar extensiones a archivos sin extensión o revisar fechas de modificación');
  }

  // Warnings
  if (warnings.length > 0) {
    const warningItems = warnings.map(r => `${r.file}: ${r.message}`);
    sections.push({
      title: 'Advertencias',
      severity: 'warning',
      items: warningItems,
    });
  }

  // Infos
  if (infos.length > 0) {
    const infoItems = infos.map(r => `${r.file}: ${r.message}`);
    sections.push({
      title: 'Información',
      severity: 'info',
      items: infoItems,
    });
  }

  return {
    summary: {
      total: results.length,
      errors: errors.length,
      warnings: warnings.length,
      infos: infos.length,
    },
    sections,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : ['No se detectaron problemas que requieran acción'],
  };
}
