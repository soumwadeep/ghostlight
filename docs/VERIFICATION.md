# Verification

Everything below was run against this repository. Commands are reproducible.

## Environment

| | |
| --- | --- |
| Machine | Apple Silicon Mac, macOS 27 (darwin, arm64) |
| Browser | Google Chrome 156, headless, launched with `--enable-unsafe-webgpu` |
| Node | v24.22.0 · npm 11.12.0 |
| Tooling | Playwright 1.64 (system Chrome channel), Vitest 5 |

A regular desktop Chrome or Edge session behaves the same; the flag is only needed in this headless
harness.

## Static checks

```
npm run typecheck   → pass (tsc -b, no errors)
npm test            → 21 tests passed (5 files)
npm run build       → pass
                      dist/ + service worker (PWA precache ~1.4 MB, model excluded and runtime-cached)
```

Test coverage: prompt parsing (including field labels repeated inside the body), candle-mode
weaving, retrieval and refusals, keepsake escaping, slug/escape/count utilities.

## Live model run

`npm run verify:gemma` drives the real UI: it creates an archive through the studio, selects Gemma
on the weave screen, and waits for the model to download, load, and write.

| Step | Result |
| --- | --- |
| Model | `gemma-2-2b-it-q4f16_1-MLC` (Gemma 2 · 2B IT) |
| Shards | 42 parameter files, ~1.4 GB |
| Download | ~2 minutes on an ~8 MB/s connection (7.1 MB/s observed) |
| Load from cache (2nd run) | ~40 s |
| Weave | 6 memories → a 3-paragraph remembrance in **13.6 s** on-device |
| Ask (grounded) | *"What did she say when the power went out?"* → **1.9 s**, citation: **The saying**, source label **Gemma · grounded in the archive** |

### Raw model output (first clean run)

> **The tin and the song** — *She knew which button was which.*
>
> The blue tin held a world of possibilities. In the dim kitchen, she'd disappear for hours, humming
> the sitar's mournful strains as she meticulously sorted through the buttons…
>
> *(This was an early run with a looser prompt. It invented "the sitar" — which is exactly why the
> shipped prompt now assigns each paragraph to specific memories, forbids first person, and why the
> reading says out loud that the memories are the source of truth. A later run began
> "The kitchen's pressure cooker echoed with a small argument. She squeezed lime into the dal. A
> blue tin of sewing buttons sat on the counter, smelling of thread and Vicks.")*

### Grounded refusal (no model call)

| Question | Result |
| --- | --- |
| What was her mother's name? | `The flame has no memory of that.` |
| What did she say about the rain? | `The flame has no memory of that.` |
| Who was her mother? | `The flame has no memory of that.` |
| Who was she? | Name card: `Asha Sen — your grandmother (1938–2020).` |

### Other checks

| Check | Result |
| --- | --- |
| Keepsake export | 321 KB single HTML file · **0 `<script>` tags** · portrait embedded as a data URL · opens from `file://` with no network |
| Escaping | A name/answer containing `<script>` and `onerror=` is escaped in the keepsake (unit test) |
| Archive round trip | Export all → import the same file → "Imported 1 ofrenda." |
| PWA | Installable; app shell precached; model chunk excluded from precache and cached on first use |
| Mystery archive | `/ofrenda/does-not-exist` shows a calm missing state; the demo offers a restore button |
| Mobile (390 px) | No horizontal overflow on `/`, `/ofrenda/ruma-das`, `/archive`, `/about`, `/studio` |

## Known upstream issue

WebLLM 0.2.86's prebuilt `gemma3-1b-it-q4f16_1-MLC` record cannot load:

```
Only one of context_window_size and sliding_window_size can be positive.
Got: context_window_size: 4096, sliding_window_size: 512
```

The suggested config fix (`sliding_window_size: -1`) loads the model but produces garbage, because
Gemma 3 interleaves global layers with 512-token sliding-window layers
([mlc-ai/web-llm#873](https://github.com/mlc-ai/web-llm/issues/873)).

Ghostlight therefore ships **Gemma 2 2B**, which loads and writes correctly. The model id is one
line in `src/lib/ai/webllm.ts`; when the Gemma 3 build is fixed, the swap is trivial.

## Honest caveat

A 2 billion parameter model is small. Across runs it produced clean, faithful paragraphs — but it
can occasionally reach for a detail that isn't in the archive. That is why:

- the six memories are always visible next to the remembrance,
- the reading states the archive is the source of truth,
- **candle mode** exists as the strict option that never rewrites your words,
- the ask path is grounded *before* the model is called and refuses when the archive is silent.

## Screenshots

- `docs/screenshots/gemma-live.png` — a remembrance written on-device by Gemma 2, with the source
  note and the header badge reading "Gemma · lit".
- `docs/screenshots/gemma-ask.png` — a grounded answer with its citation, answered by the model in
  1.9 s.