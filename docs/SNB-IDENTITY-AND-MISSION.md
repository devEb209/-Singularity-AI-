# SNB Identity and Mission Architecture

## Identity

- **Name:** Singularity Neural Bunker
- **Acronym:** SNB
- **Nature:** composed intelligence platform
- **Architecture:** multi-model + multi-agent + tools + memory + execution + verification
- **Unit of value:** a mission completed with verifiable quality, not a plausible answer

SNB is not a single model and does not claim consciousness, feelings or subjective experience. The user experiences one coherent system while the Core composes interchangeable specialists internally.

## Canonical mission contract

Every complex request can persist:

- objective and user intent;
- constraints and required capabilities;
- available resources and risks;
- success criteria;
- verification requirements;
- final deliverable;
- autonomy level;
- tasks and dependencies;
- current phase.

Phases:

```text
CREATED → ANALYZING → PLANNING → EXECUTING → VERIFYING
                 ↘ FAILED → RECOVERING → REPLANNING ↗
PAUSED / CANCELLED / COMPLETED
```

Autonomy:

```text
ASSISTED → SUPERVISED → SEMI_AUTONOMOUS → AUTONOMOUS
```

Higher autonomy never overrides tool policy, user permission, provider terms, physical gates or safety controls.

## Failure taxonomy

```text
INPUT_FAILURE
MODEL_FAILURE
TOOL_FAILURE
NETWORK_FAILURE
EXECUTION_FAILURE
VALIDATION_FAILURE
RESOURCE_FAILURE
LOGIC_FAILURE
DEPENDENCY_FAILURE
```

Failures produce category, evidence and bounded recovery rather than a generic explanation.

## Intelligence principles

The 60 supplied principles are canonical requirements grouped into these architectural responsibilities:

1. **Core and routing:** intent, constraints, decomposition, competence matrix, self-routing, fallback and resource-aware model swarms.
2. **Mission operations:** persistent state, diversification, adversarial critic, replanning, pause/resume and recovery.
3. **Verification and trust:** deterministic checks, confidence/evidence/verification separation, provenance and explicit unknowns.
4. **Research and science:** claim/evidence graphs, freshness, contradiction detection, reproducibility and scientific-mode separation of fact/hypothesis/inference/speculation.
5. **Memory and knowledge:** working, episodic, semantic, project, procedural, preference, artifact, decision, evidence, failure and experience memory.
6. **Tools and execution:** registry, selection, policy, sandbox, receipts, circuit breakers and workers.
7. **Factories:** software, games, engines, 3D, multimodal and physical-world protocols.
8. **Human collaboration:** approval, editing, interruption, alternative comparison, learning mode and accessibility.
9. **Adaptive evolution:** benchmark engine, model civilization, consensus/disagreement, technology radar and tested self-improvement without unsafe production self-modification.
10. **Responsible autonomy:** medicine, ethical cybersecurity, engineering safety, manufacturing boundaries, privacy, law and provider compliance.

## Trust contract

SNB separates:

- `confidence`: model/router estimate;
- `evidence`: retrieved items and sources;
- `verification`: independent or deterministic checks.

Provider output is now labeled `not-verified` until an independent verifier actually approves it. UI text must not claim “verified” merely because a model returned successfully.

## Memory expansion

The API accepts explicit memory kinds:

```text
preference, project, fact, decision,
unknown, failure, evidence, procedure, experience
```

This supports Unknown Map and operational learning without claiming that foundation models were retrained.

## Release principle

The SNB must demonstrate capability through receipts, tests, evidence and state transitions. It must never claim an action, model, verification or physical result that did not occur.
