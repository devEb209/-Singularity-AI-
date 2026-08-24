# TITKO — Thesis-Optimized Texture K

The UES “K” is a **reconstructed material representation**, not a conventional 16K/32K GPU bitmap.

- Stored payload is a small material graph (id, mineral, seed, virtualK).
- Sampling uses band-limited procedural functions; D-O15 picks resolution from device tier.
- `virtualK` (16384 or 32768) is the reconstruction *target*, never allocated as an image.
- Higher octave counts increase measured spatial variance versus a coarse preview.

`POST /api/v1/ues/titko/compile`
