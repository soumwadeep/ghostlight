import { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Code2,
  Coins,
  Cpu,
  Download,
  Flame,
  Lock,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Marigold } from '../components/Marigold'
import { createDemoOfrenda } from '../data/demo'
import { buildAskMessages, buildWeaveMessages } from '../lib/ai/prompts'
import { GEMMA_LABEL, GEMMA_MODEL_ID, GEMMA_SIZE_LABEL } from '../lib/ai/webllm'

const TOC = [
  { id: 'what', label: 'In plain words' },
  { id: 'machine', label: 'The machine' },
  { id: 'privacy', label: 'The data promise' },
  { id: 'model', label: 'The model' },
  { id: 'prompts', label: 'The prompts' },
  { id: 'open', label: 'Why open weights' },
  { id: 'not', label: 'What it is not' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'credits', label: 'Credits' },
]

const FLOW = [
  { title: 'Your words', note: 'Six answers. Typed, or skipped.' },
  { title: 'The archive', note: 'IndexedDB. On this device.' },
  { title: 'Memory search', note: 'The archive decides what is true.' },
  { title: 'Gemma 2', note: '2B parameters, through WebGPU.' },
  { title: 'The remembrance', note: 'A short portrait from your details.' },
]

const GLOSSARY = [
  {
    term: 'Ghostlight',
    definition:
      'The lamp a theatre leaves burning after everyone goes home, so the ghosts have somewhere to be. Here, the name of the room.',
  },
  {
    term: 'Ofrenda',
    definition:
      'A tiered altar built for Día de Muertos with photographs, candles, marigolds, water and the foods a person loved.',
  },
  {
    term: 'Día de Muertos',
    definition:
      'A Mexican tradition of remembering the dead on 1 and 2 November. The ofrenda is an invitation, not a séance.',
  },
  {
    term: 'Open weights',
    definition:
      'A model whose trained parameters can be downloaded and run by anyone. Gemma is open-weight; its licence still has terms.',
  },
  {
    term: 'Local inference',
    definition:
      'Running the model on your own hardware instead of sending your words to a company’s server.',
  },
  {
    term: 'WebGPU',
    definition:
      'The browser API that lets a web page use your graphics card for computation. It is what makes a model this size possible in a tab.',
  },
  {
    term: 'WebLLM',
    definition:
      'MLC’s open-source engine for running language models in the browser. It downloads the weights once and caches them.',
  },
  {
    term: 'Grounding (retrieval)',
    definition:
      'Finding the relevant memories in the archive first, then letting the model answer only from those. It is why the flame can refuse.',
  },
  {
    term: 'IndexedDB',
    definition:
      'The browser’s local database. Your archive lives here, not on a server. Clearing site data deletes it.',
  },
  {
    term: 'Papel picado',
    definition:
      'Cut tissue paper used in Mexican celebrations. The banners on the altar are a digital echo of it.',
  },
]

const COMPARE = [
  ['Model quality', 'Frontier scale', 'Small, on purpose'],
  ['Works offline', 'No', 'Yes, after one download'],
  ['Your answers leave the device', 'Usually', 'Never'],
  ['Cost per remembrance', 'Metered', 'Zero'],
  ['You can read the prompt', 'Rarely', 'Yes, on this page'],
  ['Survives the service', 'Until it changes', 'The archive and file are yours'],
]

const demo = createDemoOfrenda()
const weaveMessages = buildWeaveMessages(demo)
const askMessages = buildAskMessages(demo, 'What did she say when the power went out?')

export default function About() {
  useEffect(() => {
    document.title = 'How it works — Ghostlight'
    return () => {
      document.title = 'Ghostlight — keep a light on for the stories that made you'
    }
  }, [])

  return (
    <div className="about-page">
      <header className="about-hero wrap">
        <div className="about-hero-copy">
          <p className="eyebrow">How it works</p>
          <h1 className="display">
            A small room, built to <em>outlast the tab.</em>
          </h1>
          <p className="lede">
            Ghostlight is a remembrance studio for someone you carry. Six questions, an archive, a
            short remembrance written by an open-weight model on your own device, and an ofrenda
            you can ask, keep, and take offline. No account. No server. No copy of the person you
            love in someone else’s database.
          </p>
          <div className="about-hero-actions">
            <Link to="/studio" className="btn btn-primary">
              Light a candle <ArrowRight size={15} />
            </Link>
            <Link to="/ofrenda/ruma-das" className="btn btn-ghost">
              See a finished ofrenda
            </Link>
          </div>
        </div>
        <div className="about-hero-side">
          <Marigold size={54} stem />
          <div className="about-facts">
            <div>
              <b>0</b>
              <span>accounts</span>
            </div>
            <div>
              <b>{GEMMA_SIZE_LABEL}</b>
              <span>downloaded once</span>
            </div>
            <div>
              <b>0 B</b>
              <span>of your story uploaded</span>
            </div>
          </div>
          <p className="tiny-label">One static page · one local archive · one file to keep</p>
        </div>
      </header>

      <div className="wrap about-layout">
        <nav className="about-toc" aria-label="On this page">
          <span className="mono about-toc-title">On this page</span>
          {TOC.map((item, index) => (
            <a key={item.id} href={`#${item.id}`}>
              <span className="mono">{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="about-content">
          <section className="about-section" id="what">
            <div className="about-section-head">
              <p className="eyebrow">01 — In plain words</p>
              <h2 className="display">You bring the memory. The room holds it.</h2>
            </div>
            <div className="about-body">
              <p>
                A ghostlight is the lamp a theatre leaves burning after everyone has gone home. An
                ofrenda is the table a family sets for the people who can’t come to dinner.
                Ghostlight borrows both shapes: six candles, a portrait, a few offerings, and a
                quiet place for the details you don’t want to lose.
              </p>
              <p>
                The six questions are deliberately small: the kitchen, the song, the place, the
                saying, the small thing, the unfinished thing. You type. You can skip. The Keeper
                gathers what you kept and asks a small model to write a short portrait. Then it
                builds the altar. Nothing is graded, and nothing is sent anywhere.
              </p>

              <ol className="plain-steps">
                <li>
                  <span className="mono">01</span>
                  <div>
                    <h3>Answer six questions</h3>
                    <p>
                      A dish, a song, a place, a saying. The smaller the detail, the more it holds.
                      Skip anything that is too tender today.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="mono">02</span>
                  <div>
                    <h3>The Keeper gathers the offerings</h3>
                    <p>
                      It pulls out the tastes, songs, places and objects hiding in your words, and
                      remembers which answer each came from.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="mono">03</span>
                  <div>
                    <h3>A candle is lit</h3>
                    <p>
                      Choose a tone. Gemma writes a short remembrance from your words, or candle
                      mode arranges them itself. The ofrenda opens. You can ask it what you told
                      it.
                    </p>
                  </div>
                </li>
              </ol>

              <blockquote className="thesis-callout">
                The ghost is not the model. The model is the candle.{' '}
                <em>The ghost is what you remember.</em>
              </blockquote>

              <p className="note">
                The ofrenda is a living tradition from Mexico. Ghostlight borrows its shape with
                respect — the tiers, the marigolds, the water — without claiming to be the
                tradition. There are no religious claims here, and no medium.
              </p>
            </div>
          </section>

          <section className="about-section" id="machine">
            <div className="about-section-head">
              <p className="eyebrow">02 — The machine</p>
              <h2 className="display">A static page, with no server in the middle.</h2>
            </div>
            <div className="about-body">
              <p>
                Ghostlight is React and Vite, served as static files. There is no backend, no
                database service, no auth provider and no API key. The archive is IndexedDB. The
                model is a {GEMMA_SIZE_LABEL} open-weight file that WebLLM runs through WebGPU.
                The only download is the model; the only upload is the file you choose to export.
              </p>

              <div className="machine-download mono">
                <span>Open web</span>
                <Download size={13} />
                <span>the model file · {GEMMA_SIZE_LABEL} · once</span>
              </div>

              <div className="machine">
                <div className="machine-top">
                  <span className="mono">
                    <Lock size={11} /> Inside your browser
                  </span>
                  <span className="mono machine-zero">0 bytes out</span>
                </div>
                <div className="flow">
                  {FLOW.map((step, index) => (
                    <Fragment key={step.title}>
                      <div className="flow-node">
                        <span className="mono">0{index + 1}</span>
                        <b>{step.title}</b>
                        <small>{step.note}</small>
                      </div>
                      {index < FLOW.length - 1 && (
                        <span className="flow-arrow" aria-hidden="true">
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </Fragment>
                  ))}
                </div>
                <div className="machine-foot mono">
                  <span>No account · no API key · no analytics</span>
                  <span>The archive survives without the model</span>
                </div>
              </div>

              <div className="stack-row">
                <span className="chip">React 19</span>
                <span className="chip">Vite</span>
                <span className="chip">WebLLM</span>
                <span className="chip">Gemma 2 · 2B</span>
                <span className="chip">WebGPU</span>
                <span className="chip">IndexedDB</span>
                <span className="chip">MIT</span>
              </div>

              <p>
                Why the browser? Because the smallest promise we could make was: it works on the
                laptop you already have, with the Wi-Fi off. And because you can view source.
              </p>

              <p className="note">
                The page itself comes from a static host. That host can see that someone loaded
                the page and the model file. It never sees the answers, the photograph, or the
                questions you ask the ofrenda.
              </p>

              <ul className="file-links">
                <li>
                  <a
                    href="https://github.com/soumwadeep/ghostlight/blob/main/src/lib/ai/prompts.ts"
                    target="_blank"
                    rel="noreferrer"
                  >
                    src/lib/ai/prompts.ts <ArrowUpRight size={12} />
                  </a>
                  <span>Every instruction sent to the model.</span>
                </li>
                <li>
                  <a
                    href="https://github.com/soumwadeep/ghostlight/blob/main/src/lib/ai/retrieval.ts"
                    target="_blank"
                    rel="noreferrer"
                  >
                    src/lib/ai/retrieval.ts <ArrowUpRight size={12} />
                  </a>
                  <span>The archive’s own memory search and refusal logic.</span>
                </li>
                <li>
                  <a
                    href="https://github.com/soumwadeep/ghostlight/blob/main/src/lib/keepsake.ts"
                    target="_blank"
                    rel="noreferrer"
                  >
                    src/lib/keepsake.ts <ArrowUpRight size={12} />
                  </a>
                  <span>The self-contained HTML keepsake.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="about-section" id="privacy">
            <div className="about-section-head">
              <p className="eyebrow">03 — The data promise</p>
              <h2 className="display">Nothing leaves this room. Here is the fine print.</h2>
            </div>
            <div className="about-body">
              <p>
                Local-first is a promise with edges. These are ours, written plainly so you can
                hold us to them.
              </p>

              <div className="data-grid">
                <div className="data-card data-out">
                  <h3 className="mono">Leaves this device</h3>
                  <ul>
                    <li>
                      <span className="data-icon">
                        <Download size={13} />
                      </span>
                      <div>
                        <b>A request for the page</b>
                        <p>A static host sees the usual web request. No memory is inside it.</p>
                      </div>
                    </li>
                    <li>
                      <span className="data-icon">
                        <Download size={13} />
                      </span>
                      <div>
                        <b>One model download</b>
                        <p>
                          {GEMMA_SIZE_LABEL} from an open CDN, once. WebLLM caches it in this
                          browser.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="data-card data-in">
                  <h3 className="mono">Never leaves this device</h3>
                  <ul>
                    <li>
                      <span className="data-icon">
                        <Check size={13} />
                      </span>
                      <div>
                        <b>Your six answers</b>
                        <p>They live in IndexedDB and in the file you export.</p>
                      </div>
                    </li>
                    <li>
                      <span className="data-icon">
                        <Check size={13} />
                      </span>
                      <div>
                        <b>Your photograph</b>
                        <p>Resized in a canvas, stored locally. Never uploaded.</p>
                      </div>
                    </li>
                    <li>
                      <span className="data-icon">
                        <Check size={13} />
                      </span>
                      <div>
                        <b>Your questions to the ofrenda</b>
                        <p>Searched and answered in the tab. Not logged anywhere.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <ul className="privacy-rules">
                <li>
                  <Lock size={13} /> No account, no email, no analytics, no tracking pixels.
                </li>
                <li>
                  <Lock size={13} /> No microphone. Browser speech APIs often send audio to a
                  vendor; this room ships with typing only.
                </li>
                <li>
                  <Lock size={13} /> Clearing this browser’s site data deletes the archive. Export
                  what you can’t lose.
                </li>
                <li>
                  <Lock size={13} /> Delete any ofrenda with one button. The whole archive exports
                  as JSON, or as a single HTML file that works offline.
                </li>
              </ul>

              <p className="note">
                What we can’t promise: protection from a shared computer, a browser extension, or
                someone with access to your unlocked device. Local-first is not magic. It is a
                smaller perimeter, and a clearer one.
              </p>
            </div>
          </section>

          <section className="about-section" id="model">
            <div className="about-section-head">
              <p className="eyebrow">04 — The model</p>
              <h2 className="display">A small model, with a small job.</h2>
            </div>
            <div className="about-body">
              <p>
                Gemma 2 2B is not asked to be wise. It is asked to arrange your details into a
                short, concrete remembrance, and to rephrase a memory you already wrote. The
                archive does the remembering; the model does the sentences.
              </p>

              <dl className="model-spec">
                <div>
                  <dt>Model</dt>
                  <dd>{GEMMA_LABEL}</dd>
                </div>
                <div>
                  <dt>Identifier</dt>
                  <dd>{GEMMA_MODEL_ID}</dd>
                </div>
                <div>
                  <dt>Parameters</dt>
                  <dd>2 billion</dd>
                </div>
                <div>
                  <dt>Quantisation</dt>
                  <dd>q4f16 · ~{GEMMA_SIZE_LABEL}</dd>
                </div>
                <div>
                  <dt>Runtime</dt>
                  <dd>WebLLM · WebGPU</dd>
                </div>
                <div>
                  <dt>Licence</dt>
                  <dd>Gemma Terms of Use</dd>
                </div>
              </dl>

              <p className="note">
                A version note: WebLLM 0.2.86’s prebuilt Gemma 3 1B build currently cannot load
                (upstream issue <a className="about-inline-link" href="https://github.com/mlc-ai/web-llm/issues/873" target="_blank" rel="noreferrer">#873</a>),
                so Ghostlight ships Gemma 2 2B. The model id is one line in the source. It needs a
                desktop-class WebGPU browser and roughly 2 GB of free graphics memory; on smaller
                devices, candle mode still works.
              </p>

              <div className="about-two-col">
                <div>
                  <h3 className="display">Why so small?</h3>
                  <p>
                    A two-billion-parameter model fits in a browser and answers in seconds on a
                    laptop GPU. A frontier model writes more beautifully. We chose the smaller
                    candle because the room has to stay yours.
                  </p>
                </div>
                <div>
                  <h3 className="display">And if it isn’t there?</h3>
                  <p>
                    Candle mode arranges your own sentences into the remembrance. No download, no
                    model, no waiting. The archive is complete without it. The model is the
                    candle, not the ghost.
                  </p>
                </div>
              </div>

              <div className="ollama-block" id="ollama">
                <div className="ollama-copy">
                  <h3 className="display">Use a bigger local model</h3>
                  <p>
                    If you already run Ollama, Ghostlight can use any model you have pulled. The
                    request goes to your machine, never to a cloud.
                  </p>
                  <pre className="terminal">
                    <code>{`ollama pull gemma3:4b
OLLAMA_ORIGINS=* ollama serve`}</code>
                  </pre>
                  <p className="note">
                    In the studio, choose Ollama and scan. This bridge is intended for local
                    development: a hosted HTTPS page may not be allowed to call{' '}
                    <code>http://127.0.0.1</code>. If it can’t, the app falls back to memory
                    search — never to a remote API.
                  </p>
                  <a
                    className="link"
                    href="https://github.com/ollama/ollama"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ollama docs <ArrowUpRight size={13} />
                  </a>
                </div>
                <div className="ollama-note">
                  <Cpu size={26} />
                  <p className="mono">LOCAL ONLY</p>
                  <p>
                    The model id lives in one file. Fork the room and swap it for another
                    open-weight model whenever you like.
                  </p>
                </div>
              </div>

              <p className="note">
                Model files are downloaded by WebLLM from the mlc-ai repositories on Hugging
                Face. The request contains no archive data.
              </p>
            </div>
          </section>

          <section className="about-section" id="prompts">
            <div className="about-section-head">
              <p className="eyebrow">05 — The prompts</p>
              <h2 className="display">No secret sauce.</h2>
            </div>
            <div className="about-body">
              <p>
                Most of the behaviour lives in a few lines of plain language. These are the actual
                messages sent to the model for the demo archive. Read them, disagree with them,
                fork them.
              </p>

              <details className="prompt-details">
                <summary>
                  <span className="mono">01</span>
                  <span>The weaving prompt</span>
                  <span className="mono prompt-summary-meta">2 messages</span>
                </summary>
                <div className="prompt-body">
                  {weaveMessages.map((message, index) => (
                    <div className="prompt-message" key={index}>
                      <span className="prompt-role mono">{message.role}</span>
                      <pre>{message.content}</pre>
                    </div>
                  ))}
                </div>
              </details>

              <details className="prompt-details">
                <summary>
                  <span className="mono">02</span>
                  <span>The grounded answer prompt</span>
                  <span className="mono prompt-summary-meta">2 messages</span>
                </summary>
                <div className="prompt-body">
                  {askMessages.map((message, index) => (
                    <div className="prompt-message" key={index}>
                      <span className="prompt-role mono">{message.role}</span>
                      <pre>{message.content}</pre>
                    </div>
                  ))}
                </div>
              </details>

              <p className="note">
                Small models sometimes ignore instructions. That is why the app also refuses
                before the model is called: retrieval decides what exists, the model only
                rephrases it, and every citation points to a candle. If the archive is silent, the
                flame says so.
              </p>
            </div>
          </section>

          <section className="about-section" id="open">
            <div className="about-section-head">
              <p className="eyebrow">06 — Why open weights</p>
              <h2 className="display">The open pieces are not a checkbox.</h2>
            </div>
            <div className="about-body">
              <p>
                They are the reason the privacy and permanence promises can be made at the same
                time. A closed model can be improved, repriced, restricted or shut down. A file on
                your laptop can’t be deprecated.
              </p>

              <div className="why-grid">
                <div className="why-card">
                  <Lock size={18} />
                  <h3>Privacy is structural</h3>
                  <p>
                    The story never becomes someone’s training data because it never becomes
                    someone’s request. Local inference is a smaller perimeter, not a policy
                    promise.
                  </p>
                </div>
                <div className="why-card">
                  <Clock size={18} />
                  <h3>Permanence</h3>
                  <p>
                    The archive survives without the model, and the keepsake is a plain HTML file.
                    You can open it in twenty years, on a machine that has never heard of Gemma.
                  </p>
                </div>
                <div className="why-card">
                  <Coins size={18} />
                  <h3>Cost nothing to run</h3>
                  <p>
                    No tokens, no meter, no bill. The cost is one {GEMMA_SIZE_LABEL} download and
                    the electricity already in your laptop.
                  </p>
                </div>
                <div className="why-card">
                  <SlidersHorizontal size={18} />
                  <h3>Control, all the way down</h3>
                  <p>
                    Swap the model, read the prompt, change the tone, fork the room under MIT. The
                    people in the archive should not need permission to keep it.
                  </p>
                </div>
              </div>

              <table className="compare">
                <caption className="sr-only">A closed API compared with Ghostlight</caption>
                <thead>
                  <tr>
                    <th scope="col"> </th>
                    <th scope="col">A closed API</th>
                    <th scope="col">Ghostlight</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, closed, open]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td>{closed}</td>
                      <td className="is-us">{open}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p>
                There is a tradeoff, and it is written in the table: a frontier model writes more
                beautifully. We chose the smaller candle because the room has to stay yours. Open
                innovation wins here not by beating the biggest model, but by making a promise the
                biggest model can’t: the door stays closed, and the light stays on after the
                company that made the model is gone.
              </p>
            </div>
          </section>

          <section className="about-section" id="not">
            <div className="about-section-head">
              <p className="eyebrow">07 — What it is not</p>
              <h2 className="display">A tool, not a medium.</h2>
            </div>
            <div className="about-body">
              <ul className="not-list">
                <li>
                  <X size={14} />
                  <div>
                    <b>It does not talk to the dead.</b>
                    <p>There is no séance here, no voice cloning, no claim of contact.</p>
                  </div>
                </li>
                <li>
                  <X size={14} />
                  <div>
                    <b>It does not invent memories.</b>
                    <p>
                      Answers are retrieved from the archive first. If the answer isn’t there, the
                      flame says it has no memory of that.
                    </p>
                  </div>
                </li>
                <li>
                  <X size={14} />
                  <div>
                    <b>It does not upload, train on, or sell the archive.</b>
                    <p>No analytics, no accounts, no server. The file you export is the copy.</p>
                  </div>
                </li>
                <li>
                  <X size={14} />
                  <div>
                    <b>It does not replace grief counselling or a family’s own rituals.</b>
                    <p>
                      It is a place to put words. If you are grieving, be gentle with yourself.
                    </p>
                  </div>
                </li>
                <li>
                  <X size={14} />
                  <div>
                    <b>It does not require a death.</b>
                    <p>
                      Make one for someone alive you don’t want to forget. The questions work
                      either way.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="about-section" id="glossary">
            <div className="about-section-head">
              <p className="eyebrow">08 — Glossary</p>
              <h2 className="display">The words we use, plainly.</h2>
            </div>
            <dl className="glossary">
              {GLOSSARY.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="about-section" id="credits">
            <div className="about-section-head">
              <p className="eyebrow">09 — Credits</p>
              <h2 className="display">Built in the open, with thanks.</h2>
            </div>
            <div className="about-body">
              <p>
                Made for the <b>Hacktoberfest 2026 DEV Challenge — Ghost in the Machine</b>. The
                demo archive is fictional: Ruma Das is not a real person, the portrait was
                generated for this project, and the memories were written by the builders. The
                finished demo remembrance is a hand-written target, not a model output.
              </p>
              <p>
                With Gemma 2 by Google DeepMind, WebLLM by MLC AI, React and Vite, Lucide icons,
                and the open-source typefaces Fraunces, Instrument Sans and IBM Plex Mono. The
                ofrenda is a living tradition from Mexico; this project borrows its shape with
                respect and is not a substitute for it.
              </p>
              <p className="note">
                Ghostlight is not affiliated with Google, MLC AI, or the Hacktoberfest organizers.
                The source is MIT. The words are yours.
              </p>
              <div className="about-links">
                <a
                  className="link"
                  href="https://github.com/soumwadeep/ghostlight"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={14} /> The source on GitHub
                </a>
                <a
                  className="link"
                  href="https://ai.google.dev/gemma"
                  target="_blank"
                  rel="noreferrer"
                >
                  Gemma <ArrowUpRight size={13} />
                </a>
                <a
                  className="link"
                  href="https://github.com/mlc-ai/web-llm"
                  target="_blank"
                  rel="noreferrer"
                >
                  WebLLM <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="final-cta about-cta">
        <div className="wrap final-inner">
          <div className="final-marigolds">
            <Marigold size={36} />
            <Marigold size={50} />
            <Marigold size={36} />
          </div>
          <h2 className="display">The light is already on.</h2>
          <p className="lede">Six questions. One candle. Someone you don’t want to lose.</p>
          <div className="final-actions">
            <Link to="/studio" className="btn btn-primary btn-lg">
              Light a candle <ArrowRight size={16} />
            </Link>
            <Link to="/ofrenda/ruma-das" className="btn btn-ghost btn-lg">
              Walk through the demo
            </Link>
          </div>
          <p className="tiny-label">
            <Flame size={11} /> No sign-up · No upload · Nothing to cancel
          </p>
        </div>
      </section>
    </div>
  )
}
