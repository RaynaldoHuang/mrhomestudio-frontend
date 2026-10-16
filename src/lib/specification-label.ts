export function specificationLabel(name: string): string {
  const text = name.trim().toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
