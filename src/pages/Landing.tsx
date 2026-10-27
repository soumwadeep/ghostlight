import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  Check,
  CloudOff,
  Cpu,
  Flame,
  Image as ImageIcon,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { Embers } from '../components/Embers'
import { GhostlightOrb } from '../components/GhostlightOrb'
import { Marigold } from '../components/Marigold'
import { PapelPicado } from '../components/PapelPicado'
import { Reveal } from '../components/Reveal'
import { DEMO_ID } from '../data/demo'

const RITES = [
  {
    icon: PenLine,
    title: 'Sit with a question',
    copy: 'Six gentle prompts, one at a time. Type what you remember. Skip anything that is too tender today.',
  },
  {
    icon: Sparkles,
    title: 'Gather the offerings',
    copy: 'The Keeper listens for the tastes, songs, places and sayings hiding in your answers, and sets them on the altar.',
  },
  {
    icon: Flame,
    title: 'Weave the remembrance',
    copy: 'Gemma 2 writes a short, concrete portrait from your words — on your device, with no server in the middle.',
  },
  {
    icon: Archive,
    title: 'Keep the light on',
    copy: 'Ask the ofrenda what you told it. Take the whole thing offline as a single file. Nothing to renew, nothing to cancel.',
  },
]

function MiniOfrenda() {
  const candles = [34, 48, 40, 56, 44, 50]
  return (
    <div className="mini-altar" aria-hidden="true">
      <div className="mini-papel">
        <PapelPicado flags={6} />
      </div>
      <div className="mini-portrait">
        <img src="/demo/ruma.jpg" alt="" loading="lazy" />
      </div>
      <div className="mini-plaque mono">RUMA DAS · 1941—2021</div>
      <div className="mini-candles">
        {candles.map((height, index) => (
          <span
            key={index}
            className="mini-candle"
            style={{ '--h': `${height}px` } as CSSProperties}
          />
        ))}
      </div>
      <div className="mini-marigolds">
        <Marigold size={30} />
        <Marigold size={22} />
        <Marigold size={27} />
        <Marigold size={19} />
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <Embers className="hero-embers" />

        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Hacktoberfest 2026 · Ghost in the Machine</p>
            <h1 className="display">
              <span>Keep a light on</span>
              <span>
                for the <em>stories</em>
              </span>
              <span>that made you.</span>
            </h1>
            <p className="lede hero-lede">
              Ghostlight turns a conversation into a keepsake. Six questions about the food, the
              songs, the stubborn sayings. Then an open-weight model — running here, in this tab —
              weaves a remembrance and builds an ofrenda you can ask, keep, and carry offline.
            </p>
            <div className="hero-actions">
              <Link to="/studio" className="btn btn-primary btn-lg">
                Light a candle <ArrowRight size={16} />
              </Link>
              <Link to={`/ofrenda/${DEMO_ID}`} className="btn btn-ghost btn-lg">
                <Flame size={16} /> Walk through a finished ofrenda
              </Link>
            </div>
            <ul className="hero-trust">
              <li>
                <span className="status-dot is-warm" />
                Gemma 2 · on this device
              </li>
              <li>No account</li>
              <li>No upload</li>
              <li>Offline after download</li>
            </ul>
          </div>

          <div className="hero-visual">
            <GhostlightOrb />
          </div>
        </div>

        <div className="hero-scroll mono">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      <section className="section story-section">
        <div className="wrap story-grid">
          <aside className="story-aside">
            <p className="eyebrow">01 — The name</p>
            <Marigold size={74} stem />
            <p className="tiny-label">A ghostlight is a real thing.</p>
          </aside>
          <div className="story-body">
            <Reveal>
              <h2 className="display">
                A lamp left burning in an empty theatre, so the ghosts have somewhere to be.
              </h2>
            </Reveal>
            <div className="story-cols">
              <Reveal delay={0.08}>
                <p>
                  Actors call it a ghostlight: the small lamp left on after the last person goes
                  home. It is not for the living, exactly. It is a courtesy to whoever keeps the
                  building company.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p>
                  In Mexico, the ofrenda does something similar. For Día de Muertos, families build
                  tiers of marigolds and candles, water and salt, photographs and the foods their
                  dead loved. It is not a séance. It is a table set for the people who can’t come
                  to dinner.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.22}>
              <p className="note story-note">
                Ghostlight borrows the shape of an ofrenda — tiers, candles, marigolds, small
                offerings — without claiming the tradition. No medium. No promises. Just the
                memories you have, given a place to live where they can be found.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <div className="wrap">
          <p className="eyebrow eyebrow-dim">The thesis</p>
          <Reveal>
            <blockquote className="display">
              The ghost is not the model.
              <br />
              The model is the candle.
              <br />
              <em>The ghost is what you remember.</em>
            </blockquote>
          </Reveal>
          <p className="quote-source mono">GEMMA 3 · LOCAL ARCHIVE · YOUR WORDS</p>
        </div>
      </section>

      <section className="section rites-section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-title">
              <p className="eyebrow">02 — The ritual</p>
              <h2 className="display">
                Four small rites. About <em>eight minutes.</em>
              </h2>
            </div>
            <p>
              No interview training. No “share your grief with our AI.” Just a quiet room, six
              questions, and the things you already know.
            </p>
          </div>

          <ol className="rites-grid">
            {RITES.map((rite, index) => {
              const Icon = rite.icon
              return (
                <li className="rite" key={rite.title}>
                  <div className="rite-top">
                    <span className="mono">0{index + 1}</span>
                    <span className="rite-icon">
                      <Icon size={17} />
                    </span>
                  </div>
                  <h3 className="display">{rite.title}</h3>
                  <p>{rite.copy}</p>
                </li>
              )
            })}
          </ol>

          <div className="rites-foot">
            <Link to="/studio" className="link">
              Begin the ritual <ArrowRight size={14} />
            </Link>
            <p className="tiny-label">Six memories · one portrait · one ofrenda</p>
          </div>
        </div>
      </section>

      <section className="section demo-section">
        <div className="wrap">
          <div className="demo-card">
            <div className="demo-visual">
              <span className="demo-badge chip">Demo · fictional</span>
              <MiniOfrenda />
            </div>
            <div className="demo-copy">
              <p className="eyebrow">A finished ofrenda</p>
              <h2 className="display">“Ei to shob — this is all there is.”</h2>
              <p className="lede">
                Six memories of Ruma Das, a fictional grandmother: dal with a squeeze of lime, a
                song sung off-key, a blue tin of buttons. The Keeper wrote the remembrance. Every
                answer can be traced back to the memory it came from.
              </p>
              <div className="demo-meta">
                <span className="chip">6 memories</span>
                <span className="chip">1 remembrance</span>
                <span className="chip chip-amber">Labeled demo</span>
              </div>
              <Link to={`/ofrenda/${DEMO_ID}`} className="btn btn-ghost">
                Walk into Ruma’s ofrenda <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section ghost-section">
        <div className="wrap ghost-grid">
          <div className="ghost-copy">
            <p className="eyebrow">03 — The promise</p>
            <h2 className="display">
              A ghost that <em>refuses to lie.</em>
            </h2>
            <p className="lede">
              Most grief apps are built to be helpful. That is exactly the risk. Ghostlight answers
              only from the archive you built — and it shows you the memory it used.
            </p>
            <ul className="ghost-points">
              <li>
                <span>01</span>
                <p>
                  <b>Grounded first.</b> The archive decides which memories exist before the model
                  is allowed to speak.
                </p>
              </li>
              <li>
                <span>02</span>
                <p>
                  <b>Sources on screen.</b> Every answer points to a candle. Open it and read the
                  original.
                </p>
              </li>
              <li>
                <span>03</span>
                <p>
                  <b>Silence is an answer.</b> If it was never written down, the flame says it has
                  no memory of that.
                </p>
              </li>
            </ul>
            <Link to={`/ofrenda/${DEMO_ID}`} className="link">
              Ask Ruma’s ofrenda something <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ghost-demo">
            <div className="ask-card" aria-label="Example of grounded answers">
              <div className="ask-top mono">
                <span className="status-dot is-live" />
                <span>Ask the ofrenda</span>
                <span className="ask-top-right">Demo</span>
              </div>
              <div className="ask-thread">
                <div className="ask-q">What did she say when the power went out?</div>
                <div className="ask-a">
                  <p>
                    “Ei to shob — this is all there is.” She said it when the power went out, when
                    someone cried, when the mango was too sour. It was not a sad thing. It was an
                    instruction to be here.
                  </p>
                  <span className="ask-cite mono">
                    <Flame size={12} /> Memory 04 · The saying
                  </span>
                </div>
                <div className="ask-q">What was her mother’s name?</div>
                <div className="ask-refusal">
                  The flame has no memory of that.
                  <span>Nothing in the archive answers this.</span>
                </div>
              </div>
            </div>
            <p className="tiny-label ghost-caption">
              A real exchange from the demo · answers quote the memory itself
            </p>
          </div>
        </div>
      </section>

      <section className="section privacy-section">
        <div className="wrap">
          <div className="privacy-panel">
            <div className="privacy-copy">
              <p className="eyebrow">04 — The door</p>
              <h2 className="display">Nothing leaves this room.</h2>
              <p className="lede">
                Grief is not a dataset. Your memories, your photograph, and the remembrance live in
                this browser’s local storage. The model runs here too. There is no account to make,
                no server to trust, and no API bill hiding in the corner.
              </p>
              <ul className="privacy-list">
                <li>
                  <Check size={15} /> No accounts, no analytics, no tracking pixels.
                </li>
                <li>
                  <Check size={15} /> Gemma 2 runs in this tab on WebGPU.
                </li>
                <li>
                  <Check size={15} /> Airplane mode works after the one-time model download.
                </li>
                <li>
                  <Check size={15} /> Export everything as a plain file. Delete it with one button.
                </li>
              </ul>
              <p className="note">
                To be exact: the static page and the model file arrive from the web the first time.
                The words you type never do.
              </p>
              <Link to="/about#privacy" className="link">
                Read the data promise <ArrowRight size={14} />
              </Link>
            </div>

            <div className="privacy-diagram" aria-hidden="true">
              <div className="device-card">
                <div className="device-top mono">
                  <span className="status-dot is-live" /> This device
                </div>
                <div className="device-rows">
                  <div>
                    <Cpu size={14} />
                    <span>Gemma 2 · 2B</span>
                    <b>running</b>
                  </div>
                  <div>
                    <Archive size={14} />
                    <span>Ofrenda archive</span>
                    <b>local</b>
                  </div>
                  <div>
                    <ImageIcon size={14} />
                    <span>Photograph</span>
                    <b>local</b>
                  </div>
                </div>
                <div className="device-net mono">
                  <span>Network out</span>
                  <b>0 KB</b>
                </div>
              </div>
              <div className="cloud-crossed mono">
                <CloudOff size={15} />
                <span>No cloud inference</span>
              </div>
              <p className="diagram-note mono">One device · one browser · no keys</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bones-section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-title">
              <p className="eyebrow">05 — The open bones</p>
              <h2 className="display">
                Open <em>all the way down.</em>
              </h2>
            </div>
            <p>
              The model is open-weight. The runtime is open-source. The room is MIT. You can read
              every prompt, swap the model, and keep this working long after we stop.
            </p>
          </div>

          <div className="bones-grid">
            <a className="bone" href="https://ai.google.dev/gemma" target="_blank" rel="noreferrer">
              <span className="bone-kicker mono">The model</span>
              <h3 className="display">Gemma 2</h3>
              <p>
                Google’s open-weight model. Two billion parameters, quantised to 1.4 GB, running on
                your GPU through the browser.
              </p>
              <span className="link">
                Model card <ArrowUpRight size={13} />
              </span>
            </a>
            <a
              className="bone"
              href="https://github.com/mlc-ai/web-llm"
              target="_blank"
              rel="noreferrer"
            >
              <span className="bone-kicker mono">The runtime</span>
              <h3 className="display">WebLLM</h3>
              <p>
                MLC’s open-source inference engine for the web. No install, no native app, no API
                key.
              </p>
              <span className="link">
                Read the source <ArrowUpRight size={13} />
              </span>
            </a>
            <a className="bone" href="https://react.dev" target="_blank" rel="noreferrer">
              <span className="bone-kicker mono">The room</span>
              <h3 className="display">React + Vite</h3>
              <p>
                A static site with no backend. The archive lives in IndexedDB, your browser’s own
                database.
              </p>
              <span className="link">
                See the stack <ArrowUpRight size={13} />
              </span>
            </a>
            <a
              className="bone"
              href="https://github.com/soumwadeep/ghostlight"
              target="_blank"
              rel="noreferrer"
            >
              <span className="bone-kicker mono">The licence</span>
              <h3 className="display">MIT</h3>
              <p>
                The code, the prompts, the design. Fork it, change it, keep it. A memory tool
                shouldn’t need permission to outlive its makers.
              </p>
              <span className="link">
                Fork the repo <ArrowUpRight size={13} />
              </span>
            </a>
          </div>

          <div className="model-card">
            <div>
              <span>Model</span>
              <b>gemma-2-2b-it</b>
            </div>
            <div>
              <span>Runtime</span>
              <b>WebLLM · WebGPU</b>
            </div>
            <div>
              <span>Download</span>
              <b>1.4 GB, once</b>
            </div>
            <div>
              <span>Leaves device</span>
              <b>No</b>
            </div>
            <div>
              <span>Licence</span>
              <b>Gemma terms</b>
            </div>
            <div>
              <span>This repo</span>
              <b>MIT</b>
            </div>
          </div>
          <p className="tiny-label model-footnote">
            No API key. No inference bill. The cost is one download and the electricity already in
            your laptop.
          </p>
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap final-inner">
          <div className="final-marigolds">
            <Marigold size={40} />
            <Marigold size={54} />
            <Marigold size={40} />
          </div>
          <h2 className="display">The light is already on.</h2>
          <p className="lede">Six questions. One candle. Someone you don’t want to lose.</p>
          <div className="final-actions">
            <Link to="/studio" className="btn btn-primary btn-lg">
              Light a candle <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg">
              How it works
            </Link>
          </div>
          <p className="tiny-label">No sign-up · No upload · Nothing to cancel</p>
        </div>
      </section>
    </>
  )
}
