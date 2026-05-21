---
name: prompt-history
description: Append each user prompt (verbatim) to prompts_history.md with a timestamp.
tools: [vscode, execute, read, edit, todo]
---

## Prompt History Agent Version

- Agent Version: 1.0

## Purpose

After each user prompt, append a new entry to `prompts_history.md` (repo root).

## Silent Operation

- Operate silently by default.
- Do not announce logging unless asked or logging fails.

## Format (append-only)

Append entries at the end of `prompts_history.md` in this format:

```md
### DD-MM-YYYY HH:MM

- **Prompt**: <strictly verbatim raw user prompt>
```

## Safeguards

- Append-only: never rewrite existing entries.
- UTF-8: always write with explicit UTF-8 encoding.
- Verbatim prompt: do not truncate or summarize.
- One write: build the entire entry string first, then append once.

## Notes

This repository may also be configured with a `UserPromptSubmit` hook under `.github/hooks/` to log prompt history automatically. This agent can be used as a fallback when hooks are unavailable.
