export function parseVariantValues(text: string): string[] {
  return [...new Set(text.split(",").map((value) => value.trim()).filter(Boolean))]
}
