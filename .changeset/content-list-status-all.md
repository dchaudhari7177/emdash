---
"emdash": patch
---

Fixes `GET /_emdash/api/content/{collection}?status=all` returning an empty list. `all` now lists every status, as omitting `status` does and as the admin list already means by it.
