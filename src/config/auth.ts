// Config central para URLs y políticas de autenticación
export const APP_ORIGIN = ((): string => {
  if (typeof window !== 'undefined') return window.location.origin;
  // fallback build-time (Vite inyecta import.meta.env)
  const envOrigin = (import.meta as any).env?.VITE_APP_ORIGIN; // opcional
  return envOrigin || 'http://localhost:5173';
})();

export const EMAIL_CONFIRM_CALLBACK = `${APP_ORIGIN}/auth/confirm`;
export const PASSWORD_RESET_CALLBACK = `${APP_ORIGIN}/auth/password-reset`;

// Política de complejidad de contraseñas (ajustable)
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSymbol: true,
};

export function assessPasswordStrength(pwd: string) {
  const { minLength, requireUpper, requireLower, requireNumber, requireSymbol } = PASSWORD_POLICY;
  const tests = {
    length: pwd.length >= minLength,
    upper: !requireUpper || /[A-Z]/.test(pwd),
    lower: !requireLower || /[a-z]/.test(pwd),
    number: !requireNumber || /[0-9]/.test(pwd),
    symbol: !requireSymbol || /[^A-Za-z0-9]/.test(pwd),
  };
  const passed = Object.values(tests).filter(Boolean).length;
  const total = Object.keys(tests).length;
  const score = passed / total;
  let label: string;
  if (score === 1) label = 'Muy fuerte';
  else if (score >= 0.75) label = 'Fuerte';
  else if (score >= 0.5) label = 'Aceptable';
  else if (score > 0.25) label = 'Débil';
  else label = 'Muy débil';
  return { score, label, tests };
}
