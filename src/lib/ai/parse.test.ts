import { describe, expect, it } from 'vitest'
import { parseWeave } from './parse'

const body =
  'Ruma kept her kingdom small and exact: a kitchen, a terrace, and a blue tin of buttons. In the kitchen the pressure cooker went off like a small argument, and the dal was never finished until she squeezed a lime over it. She said the lime was the whole point. When the power went out she would say, this is all there is, not as a surrender but as an instruction. On Sundays the transistor carried a song over the terrace. At dusk she watered the tulsi and complained about the pigeons while the neighbourhood went dark. We never asked what she wanted to be before she was everyone else. This is what we have, and it is enough to keep the light on.'

describe('parseWeave', () => {
  it('parses the three fields', () => {
    const parsed = parseWeave(`TITLE: The Lime at the End\nEPITAPH: This is all there is.\nBODY: ${body}`)
    expect(parsed.title).toBe('The Lime at the End')
    expect(parsed.epitaph).toBe('This is all there is.')
    expect(parsed.body).toContain('Ruma kept her kingdom')
  })

  it('handles markdown labels and quotes', () => {
    const parsed = parseWeave(
      `**TITLE:** “The Lime at the End”\n**EPITAPH:** “This is all there is.”\n**BODY:** ${body}`,
    )
    expect(parsed.title).toBe('The Lime at the End')
    expect(parsed.epitaph).toBe('This is all there is.')
    expect(parsed.body.startsWith('Ruma')).toBe(true)
  })

  it('strips field labels repeated inside the body', () => {
    const parsed = parseWeave(
      `TITLE: Blue Tin\nEPITAPH: Buttons for every shirt.\nBODY: The tin held a scent of thread.\n\nBODY: The song played on the old transistor, a little too loud. She sang off-key. At dusk the terrace went quiet, one window at a time, and the neighbourhood slept.`,
    )
    expect(parsed.body).not.toMatch(/BODY/i)
    expect(parsed.body).toContain('The tin held a scent of thread.')
    expect(parsed.body).toContain('The song played on the old transistor')
  })

  it('falls back when the labels are missing', () => {
    const parsed = parseWeave(`The Lime at the End\n\n${body}`)
    expect(parsed.title.length).toBeGreaterThan(0)
    expect(parsed.body).toContain('Ruma kept her kingdom')
  })

  it('rejects an empty or too-short page', () => {
    expect(() => parseWeave('   ')).toThrow(/empty/i)
    expect(() => parseWeave('TITLE: Tiny\nBODY: too short')).toThrow(/too little/i)
  })

  it('rejects an assistant disclaimer', () => {
    expect(() => parseWeave(`As an AI, I cannot write this.\n${body}`)).toThrow(/out of character/i)
  })
})
