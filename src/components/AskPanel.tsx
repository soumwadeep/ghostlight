import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Flame, Lock } from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import type { AskAnswer, ChapterId, Ofrenda } from '../types'
import { askOfrenda } from '../lib/ai/ask'
import { useModel } from '../lib/model'
import { cx, uid } from '../lib/utils'

interface Exchange {
  id: string
  question: string
  answer: AskAnswer
}

function pronouns(person: Ofrenda['person']): { subject: string; object: string } {
  const subject = person.pronoun.split(/[/\s]+/)[0]?.toLowerCase() || 'they'
  const object =
    subject === 'she'
      ? 'her'
      : subject === 'he'
        ? 'him'
        : subject === 'they'
          ? 'them'
          : subject === 'it'
            ? 'it'
            : subject
  return { subject, object }
}

function exampleQuestions(ofrenda: Ofrenda): string[] {
  const { subject, object } = pronouns(ofrenda.person)
  const answered = new Set(
    ofrenda.entries
      .filter((entry) => !entry.skipped && entry.answer.trim())
      .map((entry) => entry.id),
  )
  const examples: string[] = []
  if (answered.has('kitchen')) examples.push(`What did ${subject} cook?`)
  if (answered.has('saying')) examples.push(`What did ${subject} always say?`)
  if (answered.has('place')) examples.push(`Where do you see ${object} most clearly?`)
  if (answered.has('small')) examples.push('What was the small thing?')
  if (examples.length < 3 && answered.has('unfinished')) {
    examples.push('What do you wish you had asked?')
  }
  if (examples.length === 0) examples.push(`Who was ${subject}?`)
  return examples.slice(0, 3)
}

function sourceLabel(answer: AskAnswer): string {
  if (answer.basis === 'name-card') return 'From the name card'
  if (answer.source === 'gemma') return 'Gemma · grounded in the archive'
  if (answer.source === 'ollama') return 'Ollama · grounded in the archive'
  return 'Memory search · no model'
}

export function AskPanel({
  ofrenda,
  onCitation,
}: {
  ofrenda: Ofrenda
  onCitation: (chapter: ChapterId) => void
}) {
  const model = useModel()
  const [question, setQuestion] = useState('')
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)
  const examples = exampleQuestions(ofrenda)
  const engineReady = model.gemma.status === 'ready'
  const usingGemma = model.preference === 'gemma' && engineReady
  const usingOllama = model.preference === 'ollama' && Boolean(model.ollama.model)
  const engineLabel = usingGemma
    ? 'Gemma is lit · answers grounded'
    : usingOllama
      ? `Ollama ready · ${model.ollama.model}`
      : 'Memory search · no model needed'
  const answered = ofrenda.entries.filter(
    (entry) => !entry.skipped && entry.answer.trim(),
  ).length

  useEffect(() => {
    const thread = threadRef.current
    if (thread) {
      thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })
    }
  }, [exchanges, pending])

  const submit = async (value: string) => {
    const text = value.replace(/\s+/g, ' ').trim()
    if (!text || pending) return
    setQuestion('')
    setError('')
    setPending(text)
    try {
      const answer = await askOfrenda(text, ofrenda, {
        engine: model.preference,
        ollamaModel: model.ollama.model,
      })
      setExchanges((previous) =>
        [...previous, { id: uid(), question: text, answer }].slice(-4),
      )
    } catch {
      setError('The flame could not answer just now. Try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="ask-section" id="ask">
      <div className="wrap ask-layout">
        <div className="ask-intro">
          <p className="eyebrow">The ofrenda answers</p>
          <h2 className="display">
            Ask it something <em>small.</em>
          </h2>
          <p className="lede">
            The archive decides what is true. The model only says it gently. Every answer is drawn
            from these {answered} memories, and the memory that holds it is always shown.
          </p>
          <ul className="ask-rules">
            <li>
              <span>01</span> No answer is invented. If it wasn’t written down, the flame says so.
            </li>
            <li>
              <span>02</span> Citations open the original memory, in your own words.
            </li>
            <li>
              <span>03</span> Nothing is uploaded, including the question you are about to ask.
            </li>
          </ul>
          <div className="ask-engine">
            <span className={cx('status-dot', (usingGemma || usingOllama) && 'is-live')} />
            <span className="mono">{engineLabel}</span>
          </div>
        </div>

        <div className="ask-console">
          <div className="ask-console-top">
            <span className="mono ask-console-title">
              <Flame size={13} /> Ask the ofrenda
            </span>
            <span className="mono ask-console-meta">
              <Lock size={10} /> Local only
            </span>
          </div>

          <div className="ask-thread" ref={threadRef} aria-live="polite">
            {exchanges.length === 0 && !pending && (
              <div className="ask-blank">
                <p className="display">
                  “The flame has no memory of that.”
                </p>
                <p>
                  That is what it says when the archive is silent. Try a question it can answer —
                  something you wrote down.
                </p>
              </div>
            )}

            {exchanges.map((exchange) => (
              <article className="ask-exchange" key={exchange.id}>
                <div className="ask-bubble-q">{exchange.question}</div>
                <div
                  className={cx(
                    'ask-answer-card',
                    !exchange.answer.grounded && 'is-refusal',
                  )}
                >
                  <div className="ask-answer-top">
                    <span className="mono">{sourceLabel(exchange.answer)}</span>
                    {exchange.answer.latencyMs ? (
                      <span className="mono">
                        {(exchange.answer.latencyMs / 1000).toFixed(1)}s
                      </span>
                    ) : null}
                  </div>
                  <p className="ask-answer-text">{exchange.answer.answer}</p>
                  {exchange.answer.citations.length > 0 && (
                    <div className="ask-cites">
                      {exchange.answer.citations.map((chapterId) => {
                        const chapter = CHAPTERS.find((item) => item.id === chapterId)
                        if (!chapter) return null
                        return (
                          <button
                            key={chapterId}
                            type="button"
                            onClick={() => onCitation(chapterId)}
                          >
                            <Flame size={11} /> {chapter.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {!exchange.answer.grounded && (
                    <p className="ask-refusal-note mono">
                      Not in the archive · nothing added
                    </p>
                  )}
                </div>
              </article>
            ))}

            {pending && (
              <article className="ask-exchange">
                <div className="ask-bubble-q">{pending}</div>
                <div className="ask-answer-card is-pending">
                  <span className="flame-loader ask-loader" />
                  <p className="mono">Reading the archive…</p>
                </div>
              </article>
            )}
          </div>

          {error && (
            <p className="field-help error" role="alert">
              {error}
            </p>
          )}

          <div className="ask-examples">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="chip"
                onClick={() => void submit(example)}
                disabled={Boolean(pending)}
              >
                {example}
              </button>
            ))}
          </div>

          <form
            className="ask-form"
            onSubmit={(event) => {
              event.preventDefault()
              void submit(question)
            }}
          >
            <div className="ask-input-wrap">
              <Flame size={16} className="ask-input-flame" />
              <input
                className="input"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={`What did ${pronouns(ofrenda.person).subject} say about the rain?`}
                aria-label="Ask the ofrenda a question"
                maxLength={240}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!question.trim() || Boolean(pending)}
            >
              Ask <ArrowUpRight size={15} />
            </button>
          </form>

          <p className="ask-note tiny-label">
            Answers are limited to this archive. Sources are always shown.
          </p>
        </div>
      </div>
    </section>
  )
}
