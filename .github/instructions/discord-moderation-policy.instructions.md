---
name: Discord Moderation Policy
description: "Use when implementing or editing Discord moderation logic, blocked words config, warning behavior, or moderation tests. Ensures consistent policy across agents."
applyTo: "src/**,data/negative-words.json,test/**,.env.example"
---
# Discord Moderation Policy

- Matching mode must stay exact-token by default, not substring matching.
- Every blocked-word change must preserve JSON schema compatibility with [data/negative-words.json](../../data/negative-words.json).
- Moderation flow order:
  1. Detect violation
  2. Delete violating message
  3. Send warning to user
  4. Log moderation action
- Respect exemptions from env config (channel and role).
- Keep warning message configurable through environment variables.
- Any policy or schema change must include or update tests in [test/moderation.test.js](../../test/moderation.test.js).
- Avoid adding unrelated bot features in moderation-focused tasks.
