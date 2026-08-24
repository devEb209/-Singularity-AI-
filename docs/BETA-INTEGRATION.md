# SNB Beta Integration Layer

This milestone replaces major frontend mock surfaces with authenticated persistent API data.

## Real-data surfaces

- Home Core health and recent projects
- Account project/file/model counts
- Projects list, create, archive and search
- Artifact/file list, MIME categories, upload, authenticated download and delete
- Conversation history and stored messages
- Mission list, progress, task detail, event stream, pause, resume and cancel
- Memory Fabric list, kinds, create, filter and delete
- Activity/audit ledger
- Tool Registry and deterministic execution
- Model Router catalog and benchmark campaigns

## Recovery

A React Error Boundary isolates unrecoverable render failures. It explicitly states that no action was assumed complete and that persistent backend state remains. API actions provide visible errors rather than silent success.

## Beta dashboard

`GET /api/v1/dashboard` returns tenant-scoped counts, Core status, uptime, physical-execution gate, Puter catalog summary and worker availability. It contains no admin secrets.

## Remaining mock-heavy surfaces

The following visual labs are still high-fidelity prototypes until their provider/tool adapters exist:

- Code Studio editor/build preview
- Canvas persistence and collaboration
- Image, video, audio and 3D generation
- Deep Research source execution
- Fork/Agent marketplace installation backend
- Frontier simulations and Digital Twin execution
- Integration connectors
- Settings persistence and full account providers

These surfaces must remain labeled as unavailable/simulated when connected to Beta users; visual existence is not operational capability.
