export function generateCustomID(
  prefix: string,
  number: number,
  length = 4,
): string {
  const paddedNumber = number.toString().padStart(length, '0'); // Ensures leading zeros
  return `${prefix.toUpperCase()}${paddedNumber}`;
}
