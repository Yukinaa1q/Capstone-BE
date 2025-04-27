export function paymentFormula(
  P: number,
  S: number,
  D: number,
  al: number,
): number {
  if (D <= 0) {
    throw new Error('Duration in months must be greater than 0');
  }
  if (al < 0 || al > 1) {
    throw new Error('Tutor percentage must be between 0 and 1');
  }
  const result = (P * S * al) / D;
  return result;
}
