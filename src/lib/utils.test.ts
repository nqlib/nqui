import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles conditional classes', () => {
    const conditional = true
    const result = cn('base', conditional && 'conditional')
    expect(result).toBe('base conditional')
  })

  it('handles falsy values', () => {
    const includeFalse = false
    const result = cn('base', includeFalse && 'false', null, undefined, 0)
    expect(result).toBe('base')
  })
})
