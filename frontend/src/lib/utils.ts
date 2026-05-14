/**
 * Utility for conditional class names.
 * Simple implementation to avoid external dependencies like clsx or tailwind-merge.
 */
export function cn(...inputs: (string | number | boolean | undefined | null | {[key: string]: boolean | undefined | null})[]): string {
  return inputs
    .flat()
    .filter((input): input is string | number => typeof input === 'string' || typeof input === 'number')
    .join(' ');
}
