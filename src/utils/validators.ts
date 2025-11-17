export function validateEmail(email: string): { valid: boolean; error?: string } {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'Email is required' };
  if (!re.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address) return { valid: false, error: 'Address is required' };
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid Ethereum address' };
  }
  return { valid: true };
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL' };
  }
}

export function validateAmount(amount: string | number): { valid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  return { valid: true };
}

export function validateAmountWithMax(
  amount: string | number,
  maxAmount: string | number
): { valid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const max = typeof maxAmount === 'string' ? parseFloat(maxAmount) : maxAmount;

  const amountValidation = validateAmount(amount);
  if (!amountValidation.valid) return amountValidation;

  if (num > max) {
    return { valid: false, error: `Amount cannot exceed ${max}` };
  }

  return { valid: true };
}

export function validateForm(data: Record<string, any>, schema: Record<string, (value: any) => { valid: boolean; error?: string }>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(data[key]);
    if (!result.valid) {
      errors[key] = result.error || 'Invalid value';
    }
  }

  return errors;
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function validateChainId(chainId: number): { valid: boolean; error?: string } {
  const validChains = [1, 137, 56, 250, 42161, 43114, 1088, 8453, 7000, 11155111];
  if (!validChains.includes(chainId)) {
    return { valid: false, error: 'Invalid chain ID' };
  }
  return { valid: true };
}

export function validateHash(hash: string): { valid: boolean; error?: string } {
  if (!hash) return { valid: false, error: 'Hash is required' };
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash' };
  }
  return { valid: true };
}
