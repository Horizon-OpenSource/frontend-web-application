// Search consistently regardless of case, accents or repeated whitespace.
export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim().replace(/\s+/g, ' ');
}
