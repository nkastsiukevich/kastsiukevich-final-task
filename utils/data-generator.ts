import { randomUUID } from 'node:crypto';

export function generateUniqueEmail(prefix = 'ikea-autotest'): string {
  return `${prefix}-${randomUUID()}@example.com`;
}
