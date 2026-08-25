# Universal Capability Expansion

The Singularity is modeled as a composable capability ecosystem, not a menu of unrelated features.

## Canonical scope

- 150 original systems remain registered separately.
- 380 new capability nodes are registered from the Universal Capability Expansion.
- 19 new domain clusters each contain exactly 20 capabilities.
- Total canonical product nodes currently tracked: 530.
- Universal Problem Solver, Universal Creation Engine and Universal Domain Discovery operate as connective architecture rather than duplicate feature counters.
- 14 additional domains are registered as `discovery`, not falsely marked as implemented: geosciences, meteorology, oceanography, transport, aviation, observational astronomy, cultural preservation, assistive technology, public governance, economics, industrial maintenance, physical product design, emergency management and communities.

## Domains

1. Scientific intelligence
2. Responsible medicine and health
3. Universal engineering
4. Extreme mathematics
5. Physics
6. Chemistry
7. Biology
8. Agriculture
9. Physical construction and fabrication
10. Robotics
11. Ethical cybersecurity
12. Data science
13. Education
14. Architecture and urbanism
15. Logistics
16. Sustainability
17. Computers
18. Communication, music and language
19. Law and administration/business

## Domain Graph

Every capability has:

- stable ID (`uc-001` through `uc-380`);
- exact name;
- parent domain;
- implementation status;
- domain safety policy.

Safety policies are not generic disclaimers:

- `standard` — normal verification rules;
- `safety-review` — physical/scientific execution requires risk review and human validation;
- `high-stakes-informational` — medical/legal output is educational and requires evidence, uncertainty and professional review;
- `authorized-only` — cybersecurity operations require explicit authorization.

## Universal Problem Solver

`POST /api/v1/problem-solver/analyze` converts a natural-language problem into:

- known domain candidates;
- confidence per domain;
- matching capability nodes;
- multidisciplinary classification;
- safety notices;
- an eight-stage task graph;
- model policy and catalog coverage.

The standard graph is:

```text
Understand
  → Research
  → Model
  → Simulate
  → Design
  → Execute
  → Verify
  → Deliver
```

The graph is adapted with domain IDs, capability context and human approval gates.

## Universal Creation Engine compilation

`POST /api/v1/problem-solver/compile` compiles a recognized problem directly into a persistent Mission Engine DAG. The homepage composer uses this endpoint and opens Mission Control after successful compilation.

## Universal Domain Discovery

If no known domain matches, the system does not pretend to know. It returns:

- `domain-discovery-required`;
- an unverified proposed profile;
- seed terms from the request;
- decomposition and benchmark steps;
- an approval requirement before compilation.

A new domain can become canonical only after profile definition, specialist composition and benchmark validation.

## All 879 Puter models

All exact models remain in the catalog and evaluation universe. Domain decomposition does not hardcode model names. For each task node:

1. capabilities/modalities define eligibility;
2. benchmark evidence defines tier per skill;
3. router creates a candidate pool;
4. health and policy filters remove unsafe/unavailable candidates;
5. fallback walks the ranked pool.

An unranked model remains available for controlled benchmark campaigns, not silently promoted to production. “Use all models” means evaluate and retain all models for the roles where evidence supports them, not execute 879 calls for every task.
