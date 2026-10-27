import { describe, expect, it } from 'vitest'
import { retrieveFromArchive } from './retrieval'
import { createDemoOfrenda } from '../../data/demo'

const demo = createDemoOfrenda()

describe('retrieveFromArchive', () => {
  it('finds the saying behind the power outage', () => {
    const result = retrieveFromArchive('What did she say when the power went out?', demo)
    expect(result.kind).toBe('memory')
    if (result.kind === 'memory') expect(result.chapter.id).toBe('saying')
  })

  it('answers the person name from the name card', () => {
    const result = retrieveFromArchive('Who was she?', demo)
    expect(result.kind).toBe('profile')
    if (result.kind === 'profile') expect(result.answer).toContain('Ruma Das')
  })

  it('finds the kitchen, place and small thing', () => {
    expect(retrieveFromArchive('What did she cook?', demo)).toMatchObject({
      kind: 'memory',
      chapter: { id: 'kitchen' },
    })
    expect(retrieveFromArchive('Where do you see her most clearly?', demo)).toMatchObject({
      kind: 'memory',
      chapter: { id: 'place' },
    })
    expect(retrieveFromArchive('What was the small thing?', demo)).toMatchObject({
      kind: 'memory',
      chapter: { id: 'small' },
    })
  })

  it('finds the song on Sunday', () => {
    const result = retrieveFromArchive('What did she sing on Sundays?', demo)
    expect(result.kind).toBe('memory')
    if (result.kind === 'memory') expect(result.chapter.id).toBe('song')
  })

  it('refuses questions the archive does not answer', () => {
    expect(retrieveFromArchive('What was her mother’s name?', demo).kind).toBe('none')
    expect(retrieveFromArchive('What did she say about the rain?', demo).kind).toBe('none')
    expect(retrieveFromArchive('Who was her mother?', demo).kind).toBe('none')
  })
})
