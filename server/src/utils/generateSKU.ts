export function generateSKU(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  const randomChars = (length: number, charset: string): string =>
    Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');

  const partLetters = randomChars(3, letters);
  const partDigits = randomChars(3, digits);

  return `${partLetters}${partDigits}`;
}
