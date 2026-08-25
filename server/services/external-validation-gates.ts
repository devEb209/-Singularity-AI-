/** Non-blocking deployment/optional-target gates excluded from V1 product completion. */
export const externalValidationGates=[
{id:'github-product-oauth',area:'optional integration',requires:'Per-user GitHub authorization',reason:'Cannot authorize a user account internally.'},
{id:'target-engine-exports',area:'optional UES exports',requires:'Installed Unity/Unreal/Godot/Roblox tooling',reason:'UES own runtime does not depend on these optional targets.'},
{id:'gpu-av-validation',area:'deployment hardware',requires:'GPU/codec/WebRTC-capable host',reason:'CPU/SVG transport remains available; hardware validation is deployment-specific.'},
{id:'public-deployment',area:'deployment',requires:'Domain, DNS, TLS and SMTP',reason:'Local/self-hosted V1 does not require a public domain or mail provider.'},
{id:'remote-storage',area:'deployment',requires:'Optional S3-compatible account',reason:'Verified local artifact storage is operational.'},
{id:'isolated-arbitrary-code',area:'optional execution',requires:'Container/microVM boundary',reason:'V1 validates code and keeps arbitrary/plugin code execution disabled.'},
{id:'connected-browser-matrix',area:'release validation',requires:'Chromium/browser binaries',reason:'E2E specs exist; unit/integration/build gates remain executable locally.'},
] as const
