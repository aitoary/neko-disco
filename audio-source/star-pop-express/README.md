# STAR POP EXPRESS — full and loop v1

D-flat major, 126 BPM. Approved demo09 melody and patches are retained.
Full: 4-bar intro + 64-bar arrangement + 4-bar outro + 2.4-second release.
Body: exactly 5,376,000 stereo frames at 44.1kHz, 256 beats / 64 bars.
One-shot intro releases over the first body bar. The Web Audio preview schedules
both sources on one audio clock, then loops the body without decoder padding.

Reproduce (Python 3, NumPy, SciPy, FFmpeg/libmp3lame):

    python render_full.py --output-dir /absolute/output/path

The full WAV is an intermediate master. Public deliverables: full MP3,
body PCM16 WAV, and intro PCM16 WAV used by the loop preview.
The renderer uses four identical guard bars on either side, tests periodic
filter/effect state, and uses memoryless peak control before PCM conversion.
No fade, appended tail, or MP3 encoder delay occurs in the body WAV.
verification.json records frame counts, splice checks, pitch classes and loudness.
These signal and score checks are not an audible listening claim.
