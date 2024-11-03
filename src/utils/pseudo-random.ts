const FULL_ALPHANUMERIC_RADIX = 36
const GENERATED_ID_MAX_LENGTH = 5

export const generatePseudoRandomId = () =>
  (Math.random() + 1).toString(FULL_ALPHANUMERIC_RADIX).substring(2, GENERATED_ID_MAX_LENGTH + 2)
