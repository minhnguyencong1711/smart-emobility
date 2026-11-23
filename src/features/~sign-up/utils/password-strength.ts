export function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!password) return { level: 0, label: 'Enter password' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;

  if (score >= 3) return { level: 3, label: 'Strong' };
  if (score >= 2 || password.length >= 8) return { level: 2, label: 'Medium' };
  return { level: 1, label: 'Weak' };
}
