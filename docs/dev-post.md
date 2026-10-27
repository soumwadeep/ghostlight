# DEV submission draft

> **This file is a draft for you to publish.** Edit it, make it yours, and replace every bracketed
> placeholder — especially the personal moment in *"The moment it landed."* That part is the one
> judges will remember, and it has to be true and in your voice.
>
> Required tags for the challenge: `#devchallenge` `#hf26challenge`
>
> Images to upload to DEV (in this order): `docs/screenshots/ofrenda.png`,
> `docs/screenshots/landing.png`, `docs/screenshots/studio.png`,
> `docs/screenshots/gemma-live.png`, `docs/screenshots/gemma-ask.png`,
> `docs/screenshots/keepsake.png`.

---

# Ghostlight: a local-first ofrenda for the stories you can't lose

**[REPLACE THIS PARAGRAPH WITH YOUR OWN — a real, specific sentence about the person you thought of
while building this. Example shape, not to be used as-is: "My grandmother died on a Tuesday in
October, and the first thing I lost was not her. It was the smell of her kitchen." One or two
sentences, one concrete image. Do not generalize.]**

I could still remember the facts. Her name, her dates, the names of her children. The facts were
safe. It was the small things that were going: the taste of the dal with lime squeezed in at the
end, the song she sang off-key on Sundays, the blue tin of buttons she could sort in the dark.

So I built a room for the small things. It's called **Ghostlight**, and it's my entry for this
week's Hacktoberfest prompt, *Ghost in the Machine*.

## What I built

Ghostlight is a remembrance studio. It asks you six questions about someone you carry — the
kitchen, the song, the place, the saying, the small thing, the unfinished thing — and turns your
answers into three things:

1. **A remembrance.** A short, concrete portrait written from your words.
2. **An ofrenda.** A tiered altar of six candles, marigolds, water and the offerings hiding in your
   answers. Click a lit candle to read the memory behind it.
3. **A keepsake.** A single HTML file that opens offline, in twenty years, with no app and no
   internet.

![The finished ofrenda](docs/screenshots/ofrenda.png)

Everything runs in the browser. An open-weight **Gemma 2** model (2B, about 1.4 GB, downloaded
once) runs through **WebGPU** using **WebLLM**. There is no backend, no account, no analytics, and
no cloud inference. After the model is cached, the room works with the Wi-Fi off.

## The theme: the ghost is not the model

A **ghostlight** is the lamp a theatre leaves burning after everyone has gone home, so the ghosts
have somewhere to be. An **ofrenda** is the table a family sets for Día de Muertos for the people
who can't come to dinner. This week sits right between Halloween and Día de Muertos, when the line
between past and present feels thin, so Ghostlight borrows both shapes with respect.

The phrase I kept coming back to while building it:

> **The ghost is not the model. The model is the candle. The ghost is what you remember.**

That sentence is not decoration. It decided the architecture. Most "AI memory" tools put the model
in the middle: it holds the memory, so when the company changes the model, or the price, or the
policy, the memory goes with it. Ghostlight inverts that. **The archive is the source of truth. The
model is a small, replaceable candle that makes it visible.** If the model disappears tomorrow, the
ofrenda and the keepsake are still there, word for word.

## Why open innovation matters here

This is the part I cared about most, because I don't think "private AI" should be a settings toggle.

**Grief is not a dataset.** If the remembrance is written by a cloud API, then the thing I said
about my grandmother's kitchen is now a request that crossed someone's servers, logged under someone's
retention policy, and possibly shaped someone's future model. Local inference changes the shape of
the promise: the story never becomes someone's request, so it can never become someone's training
data. That is structural, not a checkbox.

**Permanence.** A closed model can be improved, repriced, restricted, or shut down. A 1.4 GB file on
my laptop can't be deprecated. And because the archive exports as plain JSON, as a self-contained
HTML keepsake, and as a folder of my own words, nothing in Ghostlight depends on a service staying
alive.

**Cost nothing to run.** No tokens, no meter, no bill. The cost is one download and the electricity
already in the machine.

**Control.** I can read every prompt (they're rendered verbatim on the "How it works" page), change
the tone, swap the model for another open-weight one, or fork the whole room under MIT. The people
in the archive shouldn't need permission to keep it.

| | A closed API | Ghostlight |
| --- | --- | --- |
| Model quality | Frontier scale | Small, on purpose |
| Works offline | No | Yes, after one download |
| Your answers leave the device | Usually | Never |
| Cost per remembrance | Metered | Zero |
| You can read the prompt | Rarely | Yes, in the app |
| Survives the service | Until it changes | The archive and file are yours |

There's a real tradeoff in that table, and I'll name it: **a frontier model writes more beautifully.**
A 2B model is plainer. I chose the smaller candle because the room has to stay mine. Open innovation
wins here not by beating the biggest model, but by making a promise the biggest model can't: the door
stays closed, and the light stays on after the company that made the model is gone.

## How it works

The studio is six rites, one question at a time. You type. You can skip. Nothing is graded.

![The studio](docs/screenshots/studio.png)

Then the Keeper gathers the tastes, songs, places and objects hiding in your answers, and the weave
screen asks who writes it: **Gemma 2**, running in the tab; **candle mode**, which arranges your own
sentences and never rewrites them; or a local **Ollama** model, if you already run one.

On the demo machine, the model downloaded 1.4 GB in about two minutes, loaded through WebGPU, and
wrote a three-paragraph remembrance from six memories in 13.6 seconds. On the ofrenda page, you can
ask it things.

![Ask the ofrenda, grounded in the archive](docs/screenshots/gemma-ask.png)

Two different jobs, two different rules:

- **Weaving** is creative but constrained. The prompt forbids first person, forbids inventing an
  instrument, person, place or object, and assigns each paragraph to specific memories so none get
  dropped.
- **Answering** is strict. Retrieval runs first over the archive. If nothing matches, the model is
  never called and the flame says: *"The flame has no memory of that."* If something matches, the
  model may only rephrase it, and the citation is attached by the app, not chosen by the model.
  Asking *"What was her mother's name?"* gets a refusal, because the archive never held it.

That's the "ghost that refuses to lie" bit, and it's the part I'm most proud of. The magic isn't the
model being clever. It's the architecture being honest.

## The honest part

I want to be straight about the seams.

**A 2B model can reach.** Across runs it wrote clean, faithful paragraphs, but once it added a sitar
that wasn't in the memories. So the app says the quiet part out loud: the six memories are shown next
to the remembrance, candle mode exists as the strict option, and the reading tells you the archive is
the source of truth.

**Gemma 3 1B doesn't load in the current WebLLM.** I started with the newer, smaller Gemma 3 1B. Its
prebuilt WebLLM record fails to load, and the suggested config fix produces garbage
([mlc-ai/web-llm#873](https://github.com/mlc-ai/web-llm/issues/873)). So I ship Gemma 2 2B, which
runs correctly, and left the model id as a single line in the source for the day the Gemma 3 build is
fixed. That's what "swap models" actually looks like in practice, and it's a big part of why the open
pieces matter.

**No microphone, on purpose.** A local-first remorse tool that quietly ships your voice to a browser
vendor is not local-first. I left dictation out and typed the whole thing by hand.

## The moment it landed

**[THIS IS YOUR SECTION. Replace it entirely.]** Describe the one moment the project became real —
the first time you read a remembrance the model wrote from your own answers, or the first time it
refused a question because the archive was silent, or the moment you watched someone else find the
candle that held their memory. One specific scene, in your own words. If nothing has landed yet,
describe the exact detail that made you keep going. Avoid summarizing the project here; tell the
scene.

## What I'd tell another builder

If you're building something tender with an open model, three things:

1. **Ground before you generate.** Let the archive decide what is true, then let the model decide how
   to say it. Retrieval isn't a limitation; it's what makes the output trustworthy enough to show
   someone grieving.
2. **Name the limits in the interface.** My best design decision was writing *"small models can
   reach; the memories are the source of truth"* in the reading itself, instead of pretending the
   model is perfect. Honesty in the UI is a feature.
3. **Keep the archive runnable without the model.** Candle mode isn't a fallback for weak hardware.
   It's the guarantee that the room outlives the candle.

## What's next

- A live demo on **Render**, and a `.tech` domain. [Once deployed, add both links here.]
- Deeper grounding: highlighting which memory each sentence came from.
- A printable keepsake layout, and a way for a family to add memories together.
- Watching the Gemma family: when Gemma 3's WebLLM build is fixed, swapping back is one line.

## Links

- **Source:** https://github.com/soumwadeep/ghostlight (MIT; the prompts are in the repo)
- **Live demo:** [add your Render URL]
- **Verification:** the environment, timings and raw model output are written up in
  [`docs/VERIFICATION.md`](https://github.com/soumwadeep/ghostlight/blob/main/docs/VERIFICATION.md)
- **Built with:** Gemma 2 (Google DeepMind, open weights) · WebLLM (MLC AI) · React + Vite ·
  IndexedDB · WebGPU. [If you deployed on Render: "Hosted on Render." If you claimed the free
  `.tech` domain: "Live at yourdomain.tech."]

The demo archive in the screenshots is fictional: Ruma Das is not a real person, the portrait was
generated for the project, and the memories were written by me. Yours never leaves your browser.

`#devchallenge` `#hf26challenge`