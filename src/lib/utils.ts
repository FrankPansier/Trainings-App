// src/lib/utils.ts
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
export function generateId() {
  return crypto.randomUUID()
}

export function getNow() {
  return new Date().toISOString()
}
