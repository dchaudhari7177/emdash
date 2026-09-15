---
"emdash": patch
---

Fixes `emdash seed --no-content` still applying content entries, bylines, and taxonomy terms, and `emdash plugin publish --no-wait` still waiting for the audit. Both flags were declared under their `no-` names, which the CLI parser never sets; they are now declared as `--content` and `--wait` (on by default), so the `--no-` forms work as documented.
