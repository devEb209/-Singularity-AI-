# SNB Research Swarm

## Eligibility

A model is eligible only when the canonical Puter metadata explicitly contains a numeric `costs.web_search` field (or an explicit `web_search: true` capability). Provider name and model reputation are not used as substitutes.

## Beta flow

```text
Question
 → backend exact-model plan (2–8 researchers, default 4)
 → live Puter discovery validation
 → parallel web_search tool calls
 → partial failure collection
 → URL/citation extraction and deduplication
 → exact-model critical synthesizer
 → convergence/conflict/unknown analysis
 → client-reported execution receipts
 → Evidence Graph sources + UNKNOWN claim
 → user-visible synthesis and clickable sources
```

The default policy is `explicit-web-search-metadata-unranked-beta`. Quality ranking will replace deterministic rotation after trusted research benchmarks exist.

## Trust boundaries

- Search execution occurs in the authenticated user’s browser through Puter User-Pays.
- SNB validates every provider/model ID against live discovery and the canonical catalog.
- Reports remain `client-reported`, not provider-attested.
- URLs found in structured annotations or cited response text are persisted as context sources.
- A URL’s existence does not prove that it supports a claim.
- Therefore the question is stored as `UNKNOWN`; contextual links do not automatically promote it to `KNOWN`.
- Users must open citations, and future source-fetch verifiers will validate accessibility/content/freshness.

## Parallelism and limits

Research calls execute concurrently with `Promise.allSettled`. At least two researchers must succeed. The pool is limited to eight to respect legitimate user quotas and avoid waste. Failures are preserved and exact-model fallback information is recorded.

## No fake web research

If Puter authentication, explicit eligible models or enough successful searches are unavailable, the operation fails visibly. It does not fall back to model memory while claiming that the web was searched.
