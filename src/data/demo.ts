import type { Ofrenda } from '../types'

export const DEMO_ID = 'ruma-das'

export function createDemoOfrenda(): Ofrenda {
  const stamp = '2026-10-27T07:30:00.000Z'

  return {
    version: 1,
    id: DEMO_ID,
    createdAt: stamp,
    updatedAt: stamp,
    isDemo: true,
    tone: 'warm',
    person: {
      name: 'Ruma Das',
      relation: 'grandmother',
      years: '1941–2021',
      pronoun: 'she/her',
      photo: '/demo/ruma.jpg',
    },
    entries: [
      {
        id: 'kitchen',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'food',
          label: 'Dal with lime',
          note: 'The lime was the whole point.',
        },
        answer:
          'Dal with a squeeze of lime at the end, and the pressure cooker going off like a small argument. She said the lime was the whole point. If the dal was too hot, she would add a spoon of cold water and look at you like she had solved winter.',
      },
      {
        id: 'song',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'song',
          label: 'Purano shei diner kotha',
          note: 'Sundays, on the transistor, a little too loud.',
        },
        answer:
          'Rabindra Sangeet on the old transistor every Sunday, always a little too loud. She sang “Purano shei diner kotha” off-key and dared anyone to correct her. Nobody did.',
      },
      {
        id: 'place',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'place',
          label: 'The terrace at dusk',
          note: 'Tulsi, pigeons, one window going dark at a time.',
        },
        answer:
          'The terrace at dusk. She watered the tulsi and complained about the pigeons. From up there you could see the whole neighbourhood going dark, one window at a time.',
      },
      {
        id: 'saying',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'saying',
          label: '“Ei to shob”',
          note: 'This is all there is — not a sigh, an instruction.',
        },
        answer:
          '“Ei to shob — this is all there is.” She said it when the power went out, when someone cried, when the mango was too sour. It was not a sad thing. It was an instruction to be here.',
      },
      {
        id: 'small',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'object',
          label: 'The blue button tin',
          note: 'She knew every button by touch, even in the dark.',
        },
        answer:
          'A blue tin of sewing buttons. She knew which button belonged to which shirt, even after twenty years, even in the dark. The tin smelled of thread and Vicks.',
      },
      {
        id: 'unfinished',
        skipped: false,
        updatedAt: stamp,
        artifact: {
          kind: 'moment',
          label: 'Before she was everyone’s mother',
          note: 'The question is still on the terrace.',
        },
        answer:
          'I never asked her what she wanted to be before she was everyone’s mother. I keep thinking she would have laughed and said something about the mango tree.',
      },
    ],
    remembrance: {
      title: 'The Lime at the End',
      epitaph: 'This is all there is, and it was enough.',
      source: 'demo',
      modelLabel: 'Written for the demo',
      createdAt: stamp,
      body: `Ruma Das kept her kingdom small and exact: a kitchen, a terrace, and a blue tin of buttons. In the kitchen the pressure cooker went off like a small argument, and the dal was never finished until she squeezed a lime over it. She said the lime was the whole point. When the power went out — and it always did — she would say, “Ei to shob, this is all there is,” not as a surrender but as an instruction.

On Sundays the transistor carried Rabindra Sangeet over the terrace, and she sang “Purano shei diner kotha” a little off-key, daring anyone to correct her. At dusk she watered the tulsi and complained about the pigeons while the neighbourhood went dark, one window at a time.

Nobody knows which button belonged to which shirt now. She knew, even in the dark. She could find the right one by touch, the way she found the right word for every grief: here, eat something, sit down.

We never asked what she wanted to be before she was everyone’s mother. The question is still on the terrace, waiting with the pigeons. This is what we have. It is enough to keep the light on.`,
    },
  }
}
