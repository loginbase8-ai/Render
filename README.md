# Bridge Short — GitHub Actions parallel render

"The Bridge That Fell for a Song" — Remotion 4.0.340, 1080x1920, 30 fps, 2025 frames (67.5 s).

Frames 0–579 are already rendered locally. This repo renders only the
remaining frames 580–2024, one 30-frame (1-second) unit per Actions job,
all in parallel. Each job uploads its mp4 as an artifact
`bridge-<start>-<end>`. Download all artifacts, then concatenate in order
and mux `audio/mix.wav` (kept locally) to make the full film.

Run: Actions tab > "Render bridge short (parallel)" > Run workflow.
