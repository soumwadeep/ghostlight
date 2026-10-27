import type { Chapter } from '../types'

export const CHAPTERS: Chapter[] = [
  {
    id: 'kitchen',
    rite: 'Rite 01',
    label: 'The kitchen',
    prompt: 'What did their kitchen smell like?',
    detail: 'A dish only they could make — even if you never got the recipe.',
    helper: 'Write what you remember. The smell is a door.',
    placeholder:
      'Dal with a squeeze of lime at the end. The pressure cooker going off like a small argument…',
    kind: 'food',
  },
  {
    id: 'song',
    rite: 'Rite 02',
    label: 'The song',
    prompt: 'What song brings them back?',
    detail: 'It could be a bhajan, a film song, something they hummed off-key.',
    helper: 'No need for the title. A line, a radio, a Sunday is enough.',
    placeholder: 'Rabindra Sangeet on the transistor, always a little too loud…',
    kind: 'song',
  },
  {
    id: 'place',
    rite: 'Rite 03',
    label: 'The place',
    prompt: 'Where do you see them most clearly?',
    detail: 'A chair, a terrace, a road, the back of a shop.',
    helper: 'Start with the place. The rest will follow.',
    placeholder:
      'The terrace at dusk. Tulsi, pigeons, the neighbourhood going dark one window at a time…',
    kind: 'place',
  },
  {
    id: 'saying',
    rite: 'Rite 04',
    label: 'The saying',
    prompt: 'What did they always say?',
    detail: 'In their own words, in any language. The annoying advice counts.',
    helper: 'You can transliterate. Keep the sound of it.',
    placeholder: '“Ei to shob — this is all there is.”',
    kind: 'saying',
  },
  {
    id: 'small',
    rite: 'Rite 05',
    label: 'The small thing',
    prompt: 'What tiny thing was theirs alone?',
    detail: 'A tin of buttons, the way they folded a newspaper, an extra pinch of salt.',
    helper: 'The smaller it is, the more it will hold.',
    placeholder:
      'A blue tin of sewing buttons. She knew which one belonged to which shirt, even in the dark…',
    kind: 'object',
  },
  {
    id: 'unfinished',
    rite: 'Rite 06',
    label: 'The unfinished thing',
    prompt: 'What do you wish you had asked?',
    detail: 'This one is allowed to be hard. Skip it if you need to.',
    helper: 'There is no right answer. Only the question you still carry.',
    placeholder: 'What she wanted to be, before she was everyone’s mother…',
    kind: 'moment',
  },
]

export const TONES: { id: 'warm' | 'poetic' | 'plain'; label: string; hint: string }[] = [
  { id: 'warm', label: 'Warm', hint: 'Close, plain, a hand on the shoulder.' },
  { id: 'poetic', label: 'Poetic', hint: 'More image, a little more air.' },
  { id: 'plain', label: 'Plainspoken', hint: 'No flourish. Just what happened.' },
]

export const ARTIFACT_LABEL: Record<Chapter['kind'], string> = {
  food: 'A taste',
  song: 'A song',
  place: 'A place',
  saying: 'A saying',
  object: 'An object',
  moment: 'An unfinished thing',
}
