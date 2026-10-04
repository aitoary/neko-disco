"""SUGAR SATELLITE: original G-flat-major candy synth-pop disco.

Two-bar signature, eight-bar hook, two-bar break, seven-bar return,
and one tonic ending. C-flat is spelled as B in MIDI; every pitched
part stays within the seven notes of G-flat major.
"""


def phrase(notes, rhythm, velocities):
    return [(beat, note, length, velocity)
            for note, (beat, length), velocity in
            zip(notes, rhythm, velocities, strict=True)]


# A springing fifth and a tiny step catch make the call easy to sing.
# The answer stretches its first note, then falls by mostly small steps.
CALL = [(0, .30), (.5, .55), (1.25, .30), (2, .32),
        (2.5, .55), (3.25, .50)]
ANSWER = [(0, .65), (1, .25), (1.5, .55), (2.5, .30),
          (3, .25), (3.5, .40)]
CALL_VELOCITIES = [1.00, .94, .91, .87, .96, .91]
ANSWER_VELOCITIES = [.98, .85, .94, .85, .87, .96]


TRACK = {
    'id': '10',
    'title': 'SUGAR SATELLITE',
    'file': 'SUGAR-SATELLITE-demo-10',
    'style': 'pop',
    'bpm': 124,
    'tail': 2.2,
    'seed': 2026100310,
    'swing': 0.0,
    'key': 'Gb major / strictly diatonic; Cb written as B in MIDI',
    'scale_pitch_classes': [1, 3, 5, 6, 8, 10, 11],
    'description_ja': '跳ねる5度のフックと半音の返事。夜のディスコを照らす、甘く明るい変ト長調のシンセポップ。',
    'intro_kind': 'hit-and-answer',
    'harmony': {
        # Cbmaj9 = Cb-Eb-Gb-Bb-Db; the root sits below its bright upper shell.
        'Cbmaj9': (35, [58, 61, 63, 66]),
        'Gbmaj9': (42, [58, 61, 65, 68]),
        'Abm9': (44, [59, 63, 66, 70]),
        'Db13': (37, [59, 65, 70, 75]),
        'Ebm7': (39, [58, 61, 66, 70]),
        'Bbm7': (46, [56, 61, 65, 70]),
        'Db9': (37, [59, 63, 65, 68]),
        'Gb6/9': (42, [58, 61, 63, 68]),
    },
    'progression': [
        'Cbmaj9', 'Gbmaj9',
        # IV-I / ii-V / vi-iii / ii-V gives the hook four clear answers.
        'Cbmaj9', 'Gbmaj9', 'Abm9', 'Db13',
        'Ebm7', 'Bbm7', 'Abm9', 'Db9',
        'Cbmaj9', 'Db13',
        'Cbmaj9', 'Gbmaj9', 'Abm9', 'Db13',
        'Ebm7', 'Bbm7', 'Db9',
        'Gb6/9',
    ],
    # Octave pops punctuate the syncopated root pulses; every perfect fifth
    # here is diatonic, and there is no chromatic approach into the next bar.
    'bass_pattern': [
        (0, 0, .43, 1.00), (.75, 12, .19, .75),
        (1.25, 0, .30, .90), (2, 0, .34, .97),
        (2.75, 7, .19, .78), (3.25, 0, .28, .91),
        (3.75, 12, .15, .71),
    ],
    # A short double offbeat in the back half answers the lead's long note.
    'chord_pattern': [
        (.5, .30, .97), (1.5, .24, .81),
        (2.5, .23, .89), (3, .17, .70), (3.5, .30, 1.00),
    ],
    'phrases': {
        # Immediate high impact, then the satellite-shaped falling response.
        'signature': phrase([82, 87, 85, 83, 82, 78], CALL,
                            [1.00, 1.00, .93, .87, .95, .93]),
        'signature_answer': phrase([82, 80, 78, 77, 80, 78], ANSWER,
                                   ANSWER_VELOCITIES),
        # Eb-Bb-Cb-Bb-Gb-Eb: a fifth leap, a half-step catch, and a sweet fall.
        'satellite_call': phrase([75, 82, 83, 82, 78, 75], CALL,
                                 CALL_VELOCITIES),
        'tonic_answer': phrase([82, 80, 78, 77, 80, 78], ANSWER,
                               ANSWER_VELOCITIES),
        'minor_call': phrase([75, 82, 83, 80, 75, 73], CALL,
                             CALL_VELOCITIES),
        'dominant_answer': phrase([77, 78, 77, 75, 73, 77], ANSWER,
                                  ANSWER_VELOCITIES),
        'orbit_call': phrase([78, 85, 87, 85, 82, 78], CALL,
                             CALL_VELOCITIES),
        'soft_answer': phrase([80, 78, 77, 75, 73, 77], ANSWER,
                              ANSWER_VELOCITIES),
        'launch_answer': phrase([77, 75, 73, 71, 73, 77], ANSWER,
                                ANSWER_VELOCITIES),
        # Space between calls lets the break's bell arpeggio come forward.
        'break_ping': [(0, 83, .52, .87), (1.5, 82, .35, .81),
                       (3, 78, .62, .88)],
        'break_launch': [(0, 77, .58, .90), (1.5, 80, .33, .86),
                         (2.5, 82, .26, .89), (3, 85, .55, .98)],
        'return_call': phrase([75, 82, 83, 82, 78, 82], CALL,
                              CALL_VELOCITIES),
        'return_answer': phrase([82, 80, 78, 77, 80, 82], ANSWER,
                                ANSWER_VELOCITIES),
        'last_answer': phrase([85, 83, 82, 80, 77, 77], ANSWER,
                              [.99, .89, .95, .86, .87, .98]),
        # The leading tone resolves at beat one; the final Gb holds the tonic.
        'end': [(0, 78, .82, 1.00), (1.25, 82, .37, .89),
                (2, 80, .37, .84), (2.75, 78, 1.05, .99)],
    },
    'lead_bars': {
        0: 'signature', 1: 'signature_answer',
        2: 'satellite_call', 3: 'tonic_answer',
        4: 'minor_call', 5: 'dominant_answer',
        6: 'orbit_call', 7: 'soft_answer',
        8: 'minor_call', 9: 'launch_answer',
        10: 'break_ping', 11: 'break_launch',
        12: 'return_call', 13: 'return_answer',
        14: 'minor_call', 15: 'dominant_answer',
        16: 'orbit_call', 17: 'soft_answer',
        18: 'last_answer', 19: 'end',
    },
    'intro_pickup': [(2.75, 82), (3.25, 85), (3.75, 78)],
    'ending_root': 42,
}
