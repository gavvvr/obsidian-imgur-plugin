import { describe, expect, it } from 'vitest'

import { generatePseudoRandomId } from '../src/utils/pseudo-random'

describe(generatePseudoRandomId, () => {
  it('generates outout of expected default length', () => {
    expect(generatePseudoRandomId()).toHaveLength(5)
  })

  it('generates outout of requested length', () => {
    expect(generatePseudoRandomId(6)).toHaveLength(6)
  })
})
