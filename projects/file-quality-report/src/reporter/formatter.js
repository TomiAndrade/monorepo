// Formatea los resultados del analyzer en un objeto estructurado para reporte

export function formatReport(results) {
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  const infos = results.filter(r => r.severity === 'info');

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

  // Warnings
  if (warnings.length > 0) {
    const warningItems = warnings.map(r => `${r.file}: ${r.message}`);
    sections.push({
      title: 'Advertencias',
      severity: 'warning',
      items: warningItems,
    });

    // Generar acciones sugeridas basadas en tipos de warning
    const hasEmptyFiles = warnings.some(r => r.type === 'empty');
    const hasUnexpectedExt = warnings.some(r => r.type === 'unexpected_extension');
    const hasDuplicates = warnings.some(r => r.type === 'duplicate');
    const hasTooLarge = warnings.some(r => r.type === 'too_large');
    const hasMissingMetadata = warnings.some(r => r.type === 'no_extension' || r.type === 'invalid_date');

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
