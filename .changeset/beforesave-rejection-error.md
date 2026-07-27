---
"emdash": patch
---

Surface a `content:beforeSave` hook rejection as a structured API error instead of an unhandled 500. A trusted plugin throwing from `content:beforeSave` (the documented "throw to cancel" mechanism) now returns `{ success: false, error: { code: "BEFORE_SAVE_REJECTED", message } }` from `handleContentCreate`/`handleContentUpdate`, so the route responds with a 4xx carrying the hook's message rather than letting the exception escape uncaught.
