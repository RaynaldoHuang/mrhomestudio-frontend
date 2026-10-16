export function formatRupiahInput(raw: string, selectionStart = raw.length) {
  const allDigits = raw.replace(/\D/g, "")
  const digits = allDigits.replace(/^0+(?=\d)/, "")
  const text = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const digitsBeforeCaret = Math.max(0, raw.slice(0, selectionStart).replace(/\D/g, "").length - (allDigits.length - digits.length))
  let caret = 0
  let count = 0
  while (caret < text.length && count < digitsBeforeCaret) {
    if (/\d/.test(text[caret])) count++
    caret++
  }

  return { text, amount: Number(digits), caret }
}
