# SNB Physical Intelligence + Universal Tool Ecosystem

## Canonical principle

Singularity Neural Bunker may eventually coordinate compatible physical robots, but it does not possess proven consciousness, feelings or subjective experience. Words such as motivation, frustration or autonomous decision describe computational state, priorities and control policies only.

Knowledge and execution are distinct:

```text
KNOWING HOW ≠ HAVING THE HARDWARE, AUTHORIZATION AND VERIFIED ABILITY TO EXECUTE
```

## Release boundary

Physical execution is explicitly deferred to advanced versions. The current backend enforces:

```env
PHYSICAL_EXECUTION_ENABLED=false
```

`physical.robot.execute` exists only as a future-disabled manifest. It has no handler and cannot send commands. Changing the feature flag alone is not sufficient: future activation also requires a certified runtime, Digital Twin, simulator, sensor validation, independent safety controller, emergency stop, communication-loss behavior and hardware-specific approval.

## Future physical pipeline

```text
Human objective
 → interpretation
 → environment and robot state
 → Task Graph
 → motion planning
 → Digital Twin
 → simulation
 → collision/balance/joint-limit verification
 → human/safety approval
 → robot controller
 → continuous sensor feedback
 → correction or safe stop
 → independent completion verification
```

Animation and motion-capture data can become abstract movement knowledge, but can never be sent directly to motors. Retargeting, mechanical compatibility, simulation and live perception are mandatory boundaries.

## Adaptive cooperation

Future plans can assign nodes to the human, robot or both. Instructions must account for materials, tools, skills, mechanical limits, environment and safety. Physical observations are evidence, not automatically correct learning data; they require filtering, validation and compatibility review.

## Universal Tool Manifest

Every tool declares:

- stable ID, name and semantic version;
- description, category and capabilities;
- input and output contracts;
- permissions (`read`, `write`, `execute`, `external`, `physical`, `irreversible`);
- risk;
- dependencies and limits;
- compatible environments and hardware;
- authentication requirements;
- deterministic verifier;
- operational status.

## Policy Engine

The current policy engine distinguishes low-risk execution from write, external, physical and irreversible actions. Elevated actions require explicit approval. Future-disabled and physical tools are denied regardless of user text.

## Active deterministic tools

- `core.math.aggregate` — sum, product, average, minimum and maximum;
- `core.text.metrics` — characters, bytes, words, lines and SHA-256;
- `core.json.inspect` — required-key structural verification;
- `core.file.verify` — filesystem SHA-256 against the authorized stored manifest.

No arbitrary shell, network or filesystem write tool is active.

## Execution receipts

Every attempt is persisted with user, tool/version, context, input, policy, output/error, verification and timestamps. The server signs the canonical execution record with HMAC-SHA256. Receipt verification is available through the API. A receipt proves what this backend recorded; it does not prove an external physical event without future hardware attestation.

## Circuit breakers

Tool failures are persisted per resource. Three repeated failures open the circuit for sixty seconds. After cooldown, one half-open probe is allowed. A success closes/reset the circuit; another failure reopens it.

## Deterministic verification

The active tools do not ask an LLM whether they succeeded:

- math is recomputed;
- text metrics and hash are recomputed;
- JSON structure is independently checked;
- file content is rehashed and compared with stored size/checksum.

## APIs

```text
GET  /api/v1/tools
GET  /api/v1/tools/executions
GET  /api/v1/tools/executions/:id
POST /api/v1/tools/:id/execute
POST /api/v1/tools/executions/:id/verify-receipt
```

## Required before any physical beta

1. Robot Hardware Manifest and signed firmware identity
2. URDF/SDF-like body model and calibrated Digital Twin
3. Joint, velocity, force, thermal and battery constraints
4. Simulation with reproducible scenarios
5. Collision and stability verification
6. Independent safety controller outside the LLM path
7. Hardware emergency stop
8. Watchdog and communication-loss safe state
9. Geofencing and human-presence rules
10. Operator authentication and scoped authorization
11. Sensor integrity and stale-data detection
12. Append-only hardware command/telemetry receipts
13. Staged lab testing and safety review
14. Legal, insurance and product-safety assessment
15. No self-expansion of physical privileges

Until all applicable gates are satisfied, the SNB can explain, design and simulate physical systems but cannot claim or perform real-world control.
