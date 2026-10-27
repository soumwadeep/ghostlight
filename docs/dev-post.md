<!--
PUBLISHING CHECKLIST (this comment will not render on DEV)

1. Cover image: upload public/og.png, or paste this URL if the field accepts one:
   https://cdn.jsdelivr.net/gh/soumwadeep/ghostlight@main/public/og.png
2. Title: "Ghostlight: a ghost that refuses to lie"
3. Tags (DEV allows 4): #devchallenge #hf26challenge #opensource #webgpu
   (the first two are required by the challenge template)
4. The inline images already use public, absolute CDN URLs — no upload needed. Cover: see step 1.
5. Fill the two bracketed spots:
   - Demo section: your Render URL (deploy first, see README) or your screen recording link
   - "The Spirit of It": one true sentence about the person you thought of, if you want it
6. Prize Categories: delete the Render and .tech bullets if you did not deploy/claim them.
7. Optional: save this session with DevRelay and embed it in My Agent Session.
8. Everything else is factual and verified (see docs/VERIFICATION.md).
-->

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

# Ghostlight: a ghost that refuses to lie

![The finished ofrenda: six candles, a portrait, marigolds, water, and the offerings from the answers](https://cdn.jsdelivr.net/gh/soumwadeep/ghostlight@main/docs/screenshots/ofrenda.png)

## What I Built

**Ghostlight is a remembrance studio that runs entirely in your browser.** You answer six small questions about someone you carry — the kitchen, the song, the place, the saying, the small thing, the unfinished thing — and it turns your words into three things:

1. **A remembrance.** A short, concrete portrait written from your answers.
2. **An ofrenda.** A tiered altar of six candles, marigolds, water, cut paper and the offerings hiding in your answers, inspired by Día de Muertos. Click a lit candle or an offering to read the memory behind it.
3. **A keepsake.** A single HTML file with the portrait, the remembrance and every memory inside. It opens offline, needs no app, and contains no scripts.

Everything runs on your own machine. An open-weight **Gemma 2** model writes the remembrance through **WebGPU**, and the archive lives in **IndexedDB**. There is no backend, no account, no analytics, and no cloud inference. Uploaded: zero bytes.

I read "Ghost in the Machine" two ways, and both are in the build.

The first is the traditional one: this is a tool for the dead, built on the nights when the veil is supposed to be thin. Día de Muertos is not a séance; it is a table set for the people who can't come to dinner. I borrowed the shape of that table — tiers, candles, cempasúchil, a glass of water for the journey — with as much respect as I could, and I explain every element in plain language on the page so nobody has to already know the tradition to understand the room.

The second reading is the one that decided the architecture: **the ghost is not the model.** It is the archive. The model is just the candle that makes it visible. Most "AI memory" projects put the model in the middle, so when the company changes the model, the price, or the policy, the memory goes with it. Ghostlight inverts that. The archive is the source of truth, the model is small and replaceable, and there is a mode that keeps your words exactly as you wrote them, with no model at all.

That last part matters more than any feature list, so the tagline became a rule:

> **The ghost is not the model. The model is the candle. The ghost is what you remember.**

The demo archive in these screenshots is fictional. Ruma Das is not a real person: the portrait was generated for the project, the six memories were written by me, and the finished demo remembrance is a hand-written target rather than a model output. Your archive never leaves your browser.

## Demo

**Live demo:** [your Render URL here — the repo ships a one-click `render.yaml` blueprint, see Code below]

**If you'd rather not click a link, the whole thing runs locally in about a minute:**

```bash
git clone https://github.com/soumwadeep/ghostlight.git
cd ghostlight
npm install
npm run dev
```

Then open <http://localhost:5173> and choose one of two honest options on the weave screen:

- **Summon Gemma 2 · ~1.4 GB.** Runs in the tab through WebGPU, downloaded once, then cached. After that the room works with the Wi-Fi off.
- **Candle mode.** No download, no model, instant. It arranges your own sentences into the remembrance and never rewrites them.

There is also a **60-second video demo** you can record yourself if you prefer (four shots are enough): walk through the finished demo ofrenda, click a candle to read a memory, ask a question it can answer, then ask one it can't — and watch the flame refuse.

## Code

{% embed https://github.com/soumwadeep/ghostlight %}

The parts worth reading:

- [`src/lib/ai/prompts.ts`](https://github.com/soumwadeep/ghostlight/blob/main/src/lib/ai/prompts.ts) — every instruction sent to the model, including the grounding rules. No hidden prompt.
- [`src/lib/ai/retrieval.ts`](https://github.com/soumwadeep/ghostlight/blob/main/src/lib/ai/retrieval.ts) — the archive's own memory search and the refusal logic.
- [`src/lib/keepsake.ts`](https://github.com/soumwadeep/ghostlight/blob/main/src/lib/keepsake.ts) — the self-contained HTML keepsake, with every user string escaped.
- [`docs/VERIFICATION.md`](https://github.com/soumwadeep/ghostlight/blob/main/docs/VERIFICATION.md) — the environment, timings, and the raw model output from a real run.

MIT licensed. React 19, Vite 8, TypeScript, `motion`, `idb-keyval`, `vite-plugin-pwa`, and no backend of any kind.

## How I Built It

The open-source AI is not decoration here. It is the only way the project's promise can be true.

**The stack:**

| Piece | What it does |
| --- | --- |
| **Gemma 2 · 2B IT** (open weights, Google DeepMind) | Writes the remembrance and rephrases grounded answers |
| **WebLLM** (Apache-2.0, MLC AI) | Runs the model in the browser via WebGPU |
| **Local inference** | The model, the archive, the photograph, and your questions never leave the device |
| **IndexedDB** | The archive. No database service, no auth provider, no API key |
| **My own pipeline** | No agent framework: a small, auditable, hand-written path from answers to a remembrance |

The data flow is deliberately boring, because boring is what you want when the data is someone's grief:

```
your six answers
   → the archive            (IndexedDB, on this device)
   → memory search          (the archive decides what is true)
   → Gemma 2 · 2B           (WebLLM + WebGPU, in the tab)
   → a remembrance          (150–200 words, three paragraphs)
   → the ofrenda + a keepsake
```

There are two AI jobs, with different rules, and the difference is the whole point.

**Weaving** is creative but constrained. The prompt forbids first person, forbids inventing an instrument, person, place, object or food, and assigns each paragraph to specific memories so none get dropped:

```
- Third person only. Never use "I", "me", "my", "we" or "our".
- Every sentence must be supported by the memories above.
- Write exactly 3 short paragraphs, separated by a blank line.
  Paragraph 1: only THE KITCHEN and THE SMALL THING.
  Paragraph 2: only THE SONG and THE PLACE.
  Paragraph 3: only THE SAYING and THE UNFINISHED THING.
- Do not repeat a phrase, an idea or an image from one paragraph in another.
```

**Answering** is strict, and it refuses *before* the model is ever called:

```ts
// The archive decides what is true. The model only says it gently.
const hit = retrieveFromArchive(question, ofrenda)
if (!hit) return { answer: 'The flame has no memory of that.', grounded: false }

// If something matched, the model may only rephrase it —
// and the app attaches the citation. The model does not choose its sources.
```

Ask *"What was her mother's name?"* and you get **"The flame has no memory of that."** No hallucination, no polite invention, no guess dressed up as memory. That single behavior changed how I designed everything else, because it let me be honest in the interface: the six memories are always shown next to the remembrance, and the reading says out loud that the archive is the source of truth.

Two more decisions I'd keep:

- **No microphone, on purpose.** Browser speech APIs often send audio to a vendor. A local-first grief tool that quietly uploads your voice is not local-first, so I shipped typing only.
- **Candle mode is not a fallback.** It is the guarantee. If the model disappears, changes, or refuses to load, the room still works and your words stay exactly as you wrote them.

**And then there was the honest bug.** I started with the newer, smaller **Gemma 3 1B**. Its prebuilt WebLLM record cannot load — it throws `Only one of context_window_size and sliding_window_size can be positive` — and the suggested config fix loads the model but produces garbage, because Gemma 3 interleaves global layers with 512-token sliding-window layers ([mlc-ai/web-llm#873](https://github.com/mlc-ai/web-llm/issues/873)). So I ship **Gemma 2 2B**, which runs correctly, and left the model id as a single line in `src/lib/ai/webllm.ts` for the day that build is fixed. That is what "you can swap models" actually looks like in practice.

**Verified, not claimed.** On a desktop Chrome with WebGPU: the model downloaded **1.4 GB in about two minutes**, wrote a three-paragraph remembrance from six memories in **13.6 seconds on-device**, and answered a grounded question in **1.9 seconds** with a citation attached. The app is a PWA, so after the first run the shell and the model are cached and it works offline. The keepsake export is a 321 KB HTML file with **zero `<script>` tags**. 21 unit tests cover parsing, candle-mode weaving, retrieval refusals, and keepsake escaping.

![A remembrance written on-device by Gemma 2, with the honesty note and the header badge reading "Gemma · lit"](https://cdn.jsdelivr.net/gh/soumwadeep/ghostlight@main/docs/screenshots/gemma-live.png)

![A grounded answer with its citation, answered by the model in 1.9s](https://cdn.jsdelivr.net/gh/soumwadeep/ghostlight@main/docs/screenshots/gemma-ask.png)

## Why Does Open Innovation Matter?

This is the part I cared about most, because "private AI" should not be a settings toggle.

**Grief is not a dataset.** If the remembrance is written by a cloud API, then the thing I said about my grandmother's kitchen is now a request that crossed someone's servers, sat under someone's retention policy, and may have shaped someone's future model. Local inference changes the shape of the promise: the story never becomes someone's request, so it can never become someone's training data. That is structural, not a checkbox.

**Permanence.** A closed model can be improved, repriced, restricted, or shut down. A 1.4 GB file on my disk cannot be deprecated. And because the archive exports as plain JSON, as a self-contained HTML keepsake, and as my own words, nothing here depends on a service staying alive. The keepsake will open in twenty years on a machine that has never heard of Gemma.

**It costs nothing to run.** No tokens, no meter, no bill. The cost is one download and the electricity already in the machine.

**Control, all the way down.** Every prompt is readable in the app and in the repo. I can change the tone, swap the model, or fork the whole room under MIT. The people in an archive should not need permission to keep it.

| | A closed API | Ghostlight |
| --- | --- | --- |
| Model quality | Frontier scale | Small, on purpose |
| Works offline | No | Yes, after one download |
| Your answers leave the device | Usually | Never |
| Cost per remembrance | Metered | Zero |
| You can read the prompt | Rarely | Yes, everything is public or in the app |
| Survives the service | Until it changes | The archive and the file are yours |

There is a real tradeoff in that table, and I'll name it: **a frontier model writes more beautifully.** A 2B model is plainer, and once it reached for a detail that wasn't in the memories. So I did three things instead of pretending: I show the six memories next to the remembrance, I ship candle mode as the strict option, and the reading says out loud *"small models can reach; the memories you kept are the source of truth."* Honesty in the interface is a feature, not a disclaimer.

Open innovation wins here not by beating the biggest model, but by making a promise the biggest model can't: the door stays closed, and the light stays on after the company that made the model is gone.

## My Agent Session

Ghostlight was built in an AI coding agent session, end to end: design, the six-rite flow, the ofrenda, the grounding pipeline, the keepsake, and the test suite. That is part of why the write-up includes a verification file with raw output instead of vibes.

[Optional: save this session with DevRelay and embed it here with the `agent_session` tag, or link the session. If you don't publish the session, replace this paragraph with a link to the build log in the repo, or delete this section — it's optional.]

## The Spirit of It

The moment it landed wasn't when the model wrote something beautiful. It was when I asked it something cruel.

I had just finished the refusal logic, and I typed a question the archive couldn't answer: **"What was her mother's name?"** The flame answered:

> **"The flame has no memory of that."**

I sat with that for a while. Every chatbot I've used is trained, at some level, to be helpful — to smooth over the gap, to offer a plausible guess, to keep the conversation going. This one refused. Not because it was broken, but because that is the only honest thing a memorial tool can say when the record is silent. If it had invented a name, the invention would have lived in my archive forever, wearing the costume of a memory.

So the feature I'm proudest of is a hole: an AI that can say *I don't know* about the person you loved. The ghostlight stays lit, and it stays truthful.

[Optional, and worth it: add one true sentence about the person you thought of while building this. A specific detail — a smell, a phrase, a small object — will do more for this section than anything else I can write.]

The demo remembrance in the screenshots is the target I was aiming at: *"Ruma Das kept her kingdom small and exact: a kitchen, a terrace, and a blue tin of buttons."* Hand-written, by me, for a fictional person. The whole project is an attempt to make a machine capable of getting closer to that without ever lying about it.

## Prize Categories

- **Best Use of Gemma** — Gemma 2 2B IT (open weights, Google DeepMind) runs locally in the browser through WebLLM and WebGPU. It is the core of both the weave and the grounded answers; the model id is a single line in the source.
- **Best Use of Render** — the app is deployed as a Render static service from the repo's `render.yaml` blueprint. [Delete this bullet if you haven't deployed yet — the deploy button in the README takes about two minutes.]
- **Best Use of a .tech Domain** — the live demo at [yourdomain.tech], claimed from the Hacktoberfest promos and pointed at the Render service. [Delete this bullet if you haven't claimed the domain.]

*Built solo, with an AI agent as the pair programmer. The demo archive is fictional; everything else is yours.*

<!-- Team Submissions: single author, no teammates to credit. -->