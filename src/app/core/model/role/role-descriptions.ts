export const ROLE_DESCRIPTIONS = {
  EQUALY_MASTER_ADMIN: "Administrador Master Equaly",
  MASTER_ADMIN: "Administrador Master",
  COMMON_ADMIN: "Administrador",
  MASTER_EVENT_OPENER: "Atendente Master",
  COMMON_EVENT_OPENER: "Atendente",
  MASTER_QUALITY_INSPECTOR: "Responsável de Qualidade Master",
  COMMON_QUALITY_INSPECTOR: "Responsável de Qualidade",
  COMMON_RNC_REPORTER: "Responsável por RNC",
} as const;

export function describeRole(role: string): string {
  return (ROLE_DESCRIPTIONS as Record<string, string>)[role] ?? role;
}
