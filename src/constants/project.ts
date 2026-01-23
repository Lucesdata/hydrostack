/**
 * Tipos de proyecto legacy (para compatibilidad)
 */
export const PROJECT_TYPES = [
    'Agua potable rural',
    'Agua potable urbano',
    'Potabilización privada',
    'Desalinización',
    'Tratamiento aguas residuales',
    'Tratamiento industrial'
] as const;

export type ProjectType = typeof PROJECT_TYPES[number];

/**
 * Estados posibles de un proyecto
 */
export const PROJECT_STATUSES = [
    'Borrador',
    'En diseño',
    'Completado',
    'Archivado'
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];

/**
 * Categorías de usuario en el registro
 */
export const USER_CATEGORIES = [
    'Comunidad',
    'Acueducto rural',
    'Profesional técnico',
    'Empresa / proveedor',
    'Entidad / ONG'
] as const;

export type UserCategory = typeof USER_CATEGORIES[number];
