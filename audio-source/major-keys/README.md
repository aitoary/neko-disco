# NEKO DISCO — Major-key auditions 08–10

Original scores and procedural synthesizer for MOON SUGAR (B major, 128 BPM),
STAR POP EXPRESS (Db major, 126 BPM), and SUGAR SATELLITE (Gb major, 124 BPM).
Each is 20 bars plus an effects tail, approximately 40 seconds. These are audition
clips with endings, not seamless loops. No sampled recordings or borrowed melodies.

Reproduce with Python 3, NumPy, SciPy and FFmpeg (including libmp3lame):

    python validate_scores.py
    python render_samples.py
    python export_samples.py

Run inside this directory. The renderer places WAV/MP3 output in its parent.
The reference MP3s served by the Site are in public/music-samples/.
Score and validation JSON capture note events, requested scale membership,
voicings, sections, seeds, loudness and MP3 format checks. Verification does not
represent audible listening; the user selects the preferred musical result.
