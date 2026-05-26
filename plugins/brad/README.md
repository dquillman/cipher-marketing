# Brad — Cowork Marketing Plugin (scaffold, gated)

> **Status:** Scaffold only. **Do not install** until the multi-product gate (2026-06-15) — see project memory `project_multi_product_marketing.md`.

Packages the Brad orchestrator + drafter + grader + brand voice + lessons loop as a single Cowork plugin that can be installed per product (CipherExam, Migraine Tracker, TraderQ, Admin-Core).

## What this plugin will bundle

```
brad/
├── plugin.json                  # Cowork plugin manifest (skills + agents + connectors)
├── README.md                    # this file
├── agents/
│   ├── brad.md                  # orchestrator (parameterized over {product})
│   └── post-performance-grader.md
├── skills/
│   ├── draft-week-posts/
│   ├── weekly-performance-report/
│   └── {product}-context/       # product-specific SSOT (cipherexam, migraine, traderq, admin-core)
└── connectors/
    └── canva-mcp.json           # already-configured Canva MCP server reference
```

The key design choice: `{product}-context` is a **slot**, not a hardcoded reference. Each install supplies its own product context file. The orchestrator, drafter, and grader read the slot — they don't hardcode "CipherExam."

## What changes when you go from product-specific to plugin

| Today (CipherExam-specific) | After plugin packaging |
|---|---|
| `~/.claude/agents/brad.md` references CipherExam by name | `agents/brad.md` reads `{{product.name}}` from plugin config |
| `~/.claude/skills/cipher-exam-context/` is the only context skill | `skills/{product}-context/` — instantiated per product at install time |
| `site/data/brand-voice.md` lives in `cipher-marketing` repo | Brand voice file path is `{{product.repoRoot}}/site/data/brand-voice.md`, resolved per product |
| `site/data/posts.json` and `grading-lessons.md` paths hardcoded | Same — resolved via `{{product.dataRoot}}` |
| `site/data/competitors.json` is CipherExam-specific | Per-product competitor file |
| Hook taxonomy (worked-question, exam-trap, etc.) is exam-prep specific | Hook taxonomy moves into the product context file; the drafter reads it from there |
| Cipher Exam benchmarks block in `posts.json` | Per-product benchmarks block in the per-product `posts.json` |

## Why this is gated until 2026-06-15

Per project memory `project_multi_product_marketing.md`:

> design new features product-agnostic; phased gate after CipherExam Week 1–4 (~2026-06-15)

The 2026-06-15 gate exists because:

1. CipherExam Week 1–4 will produce the **first ~25 graded posts** — enough signal to lock the durable patterns BEFORE generalizing them to other products. Generalizing too early means baking in CipherExam-only assumptions (e.g., "Wed posts beat Fri" might be PMP-audience-specific, not universal).
2. The hook taxonomy needs to prove itself across multiple weeks before being parameterized. If a hook fails universally, dropping it is easier than templating it.
3. Multiple products diluting attention before CipherExam validates the playbook = no product gets enough signal to course-correct.

## Pre-2026-06-15 work (safe to do)

These are **non-blocking** — they harden the current CipherExam-only system in ways that make the eventual plugin extraction cleaner. None of them risk premature generalization.

- [x] Brand-voice rubric extracted to `site/data/brand-voice.md` (done 2026-05-25)
- [x] Grader explicitly reads brand-voice.md as rubric input (done 2026-05-25)
- [x] Canva MCP integration step added to drafter (done 2026-05-25)
- [ ] Move all hardcoded `G:\Users\daveq\cipher-marketing\` paths in skills/agents to a single `CIPHER_MARKETING_ROOT` constant — touch one file to retarget
- [ ] Inventory which fields in `posts.json` are exam-prep-specific (examFocus, hook) vs universal (channel, scheduled, copy) — informs the schema split
- [ ] Pick a second product to slot in first (recommendation: **Admin-Core**, since it already has a marketing surface and is operationally simple)

## Post-2026-06-15 work (when gate clears)

1. Create `plugins/brad/plugin.json` Cowork manifest
2. Move `~/.claude/agents/{brad,post-performance-grader}.md` → `plugins/brad/agents/`
3. Move `~/.claude/skills/{draft-week-posts,weekly-performance-report}/` → `plugins/brad/skills/`
4. Parameterize all `{product}` references — search every skill/agent file for "CipherExam" and replace with `{{product.name}}` template tokens
5. Build a `{product}-context` template skill that new product installs copy
6. Test install on Product #2 (Admin-Core?) end-to-end before extending to #3 and #4
7. If the install works cleanly: deprecate the standalone `~/.claude/agents/brad.md` in favor of the plugin install

## Why we're scaffolding now instead of waiting

Two reasons:

1. **The video pattern is now standard.** Anthropic packages marketing capabilities as Cowork plugins; the longer Brad stays as a one-off `~/.claude/agents/brad.md`, the more it diverges from the conventions Anthropic users + future Claude sessions expect.
2. **Concrete deferral hook.** Having this scaffold + README means when 2026-06-15 hits, the gate-clear conversation can be 2 messages, not 20. The decision shape is already written down.

If by 2026-06-15 the CipherExam playbook is still producing surprises week-over-week, **delay the extraction**. The plugin only makes sense when the underlying system is stable.
