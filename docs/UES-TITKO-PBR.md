# TITKO PBR — realistic material standard, not a stored 16K image

The user can ask for any computationally representable material. TITKO compiles the request into a physical graph:

- albedo, roughness, metalness, IOR
- subsurface, anisotropy, emission
- height amplitude → reconstructed normals
- environmental wetness, wear, dust, temperature

D-O15 chooses the sample resolution from the device tier. `virtualK` 16384/32768 remains a reconstruction target.

This is **not**:

- a 16K or 32K bitmap allocated on the GPU
- a claim of photographic identity with a scanned texture
- learned super-resolution

A wet granite request must actually lower roughness versus dry granite. Energy is checked with a small Cook-Torrance/GGX sample set.

`POST /api/v1/ues/titko/compile`
