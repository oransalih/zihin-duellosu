export function validateSecret(secret: string): { valid: boolean; error?: string } {
  if (secret.length !== 4) {
    return { valid: false, error: 'Sayi 4 haneli olmali' };
  }
  if (!/^\d{4}$/.test(secret)) {
    return { valid: false, error: 'Sadece rakam girilmeli' };
  }
  const digits = new Set(secret.split(''));
  if (digits.size !== 4) {
    return { valid: false, error: 'Rakamlar tekrar etmemeli' };
  }
  return { valid: true };
}

export function validateGuess(guess: string): { valid: boolean; error?: string } {
  if (guess.length !== 4) {
    return { valid: false, error: 'Tahmin 4 haneli olmali' };
  }
  if (!/^\d{4}$/.test(guess)) {
    return { valid: false, error: 'Sadece rakam girilmeli' };
  }
  const digits = new Set(guess.split(''));
  if (digits.size !== 4) {
    return { valid: false, error: 'Rakamlar tekrar etmemeli' };
  }
  return { valid: true };
}
