export interface PasswordChecks {
  notEmpty: boolean;
  minLength: boolean;
  maxLength: boolean;
  noSpaces: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notWeak: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  checks: PasswordChecks;
}

export const ALLOWED_SPECIAL_SYMBOLS = '@$!%*?&#^()_+-=[]{};\':",.<>|/\\~`';

export const COMMON_WEAK_PASSWORDS = [
  'password',
  'password123',
  'password123!',
  'password123@',
  'admin@123',
  'admin123',
  'admin1234',
  'admin1234!',
  '12345678',
  '123456789',
  '12345678a!',
  'qwerty123',
  'qwerty123!',
  'welcome123!',
  'changeme123!',
];

/**
 * Validates password strength according to enterprise security standards:
 * - Empty password: Password is required
 * - 8 to 64 characters in length (preferably 12+)
 * - Absolutely NO spaces or whitespace allowed anywhere in the password
 * - At least one uppercase English letter (A-Z)
 * - At least one lowercase English letter (a-z)
 * - At least one numeric digit (0-9)
 * - At least one special symbol (@ # $ % ! & * etc.)
 * - Weak passwords: Rejects common, easily guessed passwords
 */
export function validatePassword(password: string): PasswordValidationResult {
  const notEmpty = Boolean(password && password.length > 0);
  const hasSpaces = /\s/.test(password);
  const minLength = password.length >= 8;
  const maxLength = password.length <= 64;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Specifically test against standard special characters (@ # $ % ! & * etc.)
  const hasSpecial = /[@$!%*?&#^()_+\-=[\]{};':",.<>|/\\~`]/.test(password);
  const isWeak = COMMON_WEAK_PASSWORDS.includes(password.toLowerCase().trim());

  const checks: PasswordChecks = {
    notEmpty,
    minLength,
    maxLength,
    noSpaces: !hasSpaces && notEmpty,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    notWeak: !isWeak && notEmpty,
  };

  let error: string | undefined;

  if (!notEmpty) {
    error = 'Password is required.';
  } else if (hasSpaces) {
    error = 'Password cannot contain spaces or whitespace.';
  } else if (!minLength) {
    error = 'Password must be at least 8 characters long.';
  } else if (!maxLength) {
    error = 'Password must not exceed 64 characters.';
  } else if (!hasUppercase) {
    error = 'Password must contain at least one uppercase letter (A-Z).';
  } else if (!hasLowercase) {
    error = 'Password must contain at least one lowercase letter (a-z).';
  } else if (!hasNumber) {
    error = 'Password must contain at least one number (0-9).';
  } else if (!hasSpecial) {
    error = 'Password must contain at least one special character (@ # $ % ! & * etc.).';
  } else if (isWeak) {
    error = 'Password is too common or easily guessed. Please choose a stronger password.';
  }

  return {
    isValid: !error,
    error,
    checks,
  };
}

/**
 * Validates password confirmation match
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Confirm Password must match Password.' };
  }
  return { isValid: true };
}
