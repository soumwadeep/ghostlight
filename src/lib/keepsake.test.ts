import { describe, expect, it } from 'vitest'
import { buildKeepsakeHtml } from './keepsake'
import { createDemoOfrenda } from '../data/demo'
import type { Ofrenda } from '../types'

describe('buildKeepsakeHtml', () => {
  it('produces a self-contained file and escapes every user string', async () => {
    const base = createDemoOfrenda()
    const evil: Ofrenda = {
      ...base,
      id: 'evil',
      isDemo: false,
      person: {
        ...base.person,
        name: '<script>alert(1)</script>',
        relation: 'a "friend" & <b>tester</b>',
        photo: 'data:image/png;base64,AAAA',
      },
      entries: base.entries.map((entry) =>
        entry.id === 'kitchen'
          ? {
              ...entry,
              answer: '<img src=x onerror=alert(1)> & "quoted"',
              artifact: { kind: 'food', label: '<b>Dal</b>' },
            }
          : entry,
      ),
      remembrance: {
        title: '<b>Title</b>',
        epitaph: '<i>Epitaph</i>',
        body: '<script>bad()</script>\n\nA second paragraph & more.',
        source: 'demo',
        createdAt: new Date().toISOString(),
      },
    }

    const html = await buildKeepsakeHtml(evil)
    expect(html).not.toMatch(/<script/i)
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;quoted&quot;')
    expect(html).toContain('data:image/png;base64,AAAA')
    expect(html).toContain('This file is yours')
    expect(html).toContain('<!doctype html>')
  })

  it('works without a remembrance', async () => {
    const base = createDemoOfrenda()
    const html = await buildKeepsakeHtml({ ...base, remembrance: null, isDemo: false })
    expect(html).toContain('6 memories kept')
    expect(html).not.toContain('The Lime at the End')
  })
})
