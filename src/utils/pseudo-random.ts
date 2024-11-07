export const generatePseudoRandomId = (generatedIdLength = 5) => {
  const fullAlphanumericRadix = 36
  return Array(generatedIdLength)
    .fill(undefined)
    .map(() => ((Math.random() * fullAlphanumericRadix) | 0).toString(fullAlphanumericRadix))
    .join('')
}
