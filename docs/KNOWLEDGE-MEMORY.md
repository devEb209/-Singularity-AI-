# SNB Versioned Knowledge Memory

Knowledge memory adds immutable content history and active-version retrieval above the original memory records.

## Lifecycle

```text
create v1 → revise v2 → supersede v1
                     ├→ invalidate with reason
                     └→ expire by retention policy
```

Every version has a SHA-256 content hash, monotonically increasing version, previous-version link, reason, state, valid-from and optional valid-until timestamp. Revision plus base-memory projection update occurs in one SQLite transaction. Identical revisions are rejected.

## Search

The deterministic V1 search uses normalized unigram and bigram similarity combined with importance and exact project scope. It searches only active, non-expired versions, can include user-global memories, and never crosses tenants. The response declares that embeddings are not used. `ContextEngine` applies the same active-version and expiry boundary before Master Intelligence context compression.

## API

```text
POST /api/v1/knowledge-memory
POST /api/v1/knowledge-memory/:id/revisions
POST /api/v1/knowledge-memory/versions/:id/invalidate
GET  /api/v1/knowledge-memory/:id/lineage
GET  /api/v1/knowledge-memory/search?q=...&projectId=...&includeGlobal=true
```

This is an operational semantic-lexical/versioning core, not a claim of embedding-based semantic understanding. Embeddings, hierarchical summarization and measured long-context preservation remain advanced work.
