"""MOON SUGAR: an original CANDY PAWS synth-pop hook in B major.

A two-bar hit-and-answer introduction, eight-bar melodic hook, two-bar
breathing space, seven-bar return, and a one-bar tonic ending. All pitched
material is diatonic; the lead's new rising call has a descending answer.
"""

TRACK = {
    'id': '08',
    'title': 'MOON SUGAR',
    'file': 'MOON-SUGAR-demo-08',
    'style': 'pop',
    'bpm': 128,
    'tail': 2.2,
    'seed': 2026100308,
    'description_ja': '月明かりに弾ける甘いシンセポップ。冒頭から光るヒットと返答、口ずさめる上昇フック、四つ打ちのナイトクラブ・グルーヴ。',
    'key': 'B major',
    'swing': 0.0,
    'intro_kind': 'hit-and-answer',
    'harmony': {
        # Chord tones only. The bass supplies the root to rootless voicings.
        'Bmaj9': (35, [58, 61, 63, 66]),
        'B6': (35, [59, 63, 66, 68]),
        'D#m7': (39, [54, 58, 61, 63]),
        'Emaj9': (40, [56, 59, 63, 66]),
        'C#m7': (37, [56, 59, 61, 64]),
        'G#m7': (44, [54, 59, 63, 68]),
        'E6': (40, [56, 59, 61, 64]),
        'F#7sus4': (42, [54, 59, 61, 64]),
        'F#7': (42, [54, 58, 61, 64]),
        'Emaj7': (40, [56, 59, 63, 64]),
        'B6/9': (35, [54, 56, 61, 63]),
    },
    'progression': [
        'Bmaj9', 'F#7',
        # I6 - iii7 - IVmaj9 - ii7 - vi7 - IV6 - Vsus - V7.
        'B6', 'D#m7', 'Emaj9', 'C#m7',
        'G#m7', 'E6', 'F#7sus4', 'F#7',
        'Emaj7', 'F#7',
        'B6', 'D#m7', 'Emaj9', 'C#m7',
        'G#m7', 'E6', 'F#7',
        'B6/9',
    ],
    'phrases': {
        # An immediate tonic stamp, two answering fragments, and air between
        # them. The second bar answers on V, resolving into the main hook.
        'hit': [
            (0, 83, .62, 1.00), (.75, 78, .22, .92),
            (1.25, 75, .44, .90), (2.25, 83, .35, .99),
            (2.75, 80, .22, .87), (3.25, 78, .49, .93),
        ],
        'intro_answer': [
            (0, 82, .56, .98), (.75, 78, .27, .91),
            (1.25, 76, .47, .88), (2.25, 73, .35, .86),
            (2.75, 78, .24, .94), (3.5, 82, .34, .99),
        ],
        # The new, singable call is D# - F# - G# - F# - D# - C# - B.
        # A broad first note and the leap onto G# distinguish it rhythmically
        # and melodically from the earlier SODA COMET audition.
        'call': [
            (0, 75, .64, 1.00), (.75, 78, .30, .92),
            (1.25, 80, .60, .98), (2, 78, .40, .92),
            (2.5, 75, .45, .90), (3.25, 73, .18, .83),
            (3.5, 71, .43, .97),
        ],
        # The complementary answer falls, bounces, and lands on iii's root.
        'answer': [
            (0, 78, .56, .98), (.75, 75, .30, .89),
            (1.25, 73, .43, .88), (2, 75, .45, .93),
            (2.5, 70, .45, .89), (3.25, 73, .18, .85),
            (3.5, 75, .43, .95),
        ],
        # Preserve the call's contour and rhythm while moving its landing
        # to E, keeping the strong beats on IV's G# and B chord tones.
        'call_iv': [
            (0, 80, .64, 1.00), (.75, 83, .30, .93),
            (1.25, 85, .60, .98), (2, 83, .40, .93),
            (2.5, 80, .45, .90), (3.25, 78, .18, .85),
            (3.5, 76, .43, .97),
        ],
        'answer_ii': [
            (0, 76, .56, .98), (.75, 73, .30, .89),
            (1.25, 71, .43, .88), (2, 73, .45, .93),
            (2.5, 68, .45, .88), (3.25, 71, .18, .85),
            (3.5, 73, .43, .96),
        ],
        'answer_iv': [
            (0, 83, .56, .99), (.75, 80, .30, .90),
            (1.25, 78, .43, .87), (2, 80, .45, .94),
            (2.5, 76, .45, .89), (3.25, 78, .18, .86),
            (3.5, 80, .43, .96),
        ],
        # On the suspended dominant, the call resolves to its B suspension;
        # the following answer replaces B with A#, exposing the dominant.
        'call_sus': [
            (0, 73, .64, .99), (.75, 78, .30, .93),
            (1.25, 80, .60, .97), (2, 78, .40, .94),
            (2.5, 76, .45, .91), (3.25, 73, .18, .85),
            (3.5, 71, .43, .96),
        ],
        'answer_v': [
            (0, 82, .56, .99), (.75, 78, .30, .92),
            (1.25, 76, .43, .88), (2, 78, .45, .94),
            (2.5, 73, .45, .90), (3.25, 76, .18, .86),
            (3.5, 82, .43, .98),
        ],
        # Quiet, authored lead responses leave room for the break's bells.
        'break_iv': [
            (0, 80, .92, .69), (1.5, 78, .38, .62),
            (2.5, 76, .70, .68), (3.5, 75, .29, .64),
        ],
        'break_v': [
            (0, 78, .90, .69), (1.5, 76, .40, .63),
            (2.5, 73, .63, .68), (3.5, 82, .32, .81),
        ],
        # Same recognisable opening; its last two notes now lift to high B.
        'call_return': [
            (0, 75, .64, 1.00), (.75, 78, .30, .93),
            (1.25, 80, .60, .99), (2, 78, .40, .93),
            (2.5, 75, .45, .91), (3.25, 78, .18, .88),
            (3.5, 83, .43, 1.00),
        ],
        'cadence': [
            (0, 82, .59, 1.00), (.75, 80, .20, .88),
            (1, 78, .34, .94), (1.5, 76, .40, .89),
            (2, 73, .40, .87), (2.5, 78, .30, .94),
            (3, 80, .22, .91), (3.5, 82, .43, .99),
        ],
        'end': [
            (0, 83, 1.25, 1.00), (1.5, 78, .35, .90),
            (2, 75, .35, .86), (2.5, 71, 1.15, .97),
        ],
    },
    'lead_bars': {
        0: 'hit', 1: 'intro_answer',
        2: 'call', 3: 'answer', 4: 'call_iv', 5: 'answer_ii',
        6: 'call', 7: 'answer_iv', 8: 'call_sus', 9: 'answer_v',
        10: 'break_iv', 11: 'break_v',
        12: 'call_return', 13: 'answer', 14: 'call_iv', 15: 'answer_ii',
        16: 'call', 17: 'answer_iv', 18: 'cadence',
        19: 'end',
    },
    'intro_pickup': [(3.25, 73), (3.75, 82)],
    'ending_root': 35,
    # Root, octave and perfect fifth remain diatonic for every chord root.
    # This replaces the renderer's default chromatic next-root approach.
    'bass_pattern': [
        (0, 0, .36, 1.00), (.75, 12, .18, .76),
        (1.5, 0, .28, .95), (2, 0, .34, .99),
        (2.75, 7, .19, .80), (3.25, 12, .17, .74),
        (3.5, 0, .29, .93),
    ],
    'chord_pattern': [
        (.5, .25, .92), (1.25, .17, .66), (1.5, .25, .85),
        (2.5, .26, .93), (3.25, .17, .69), (3.5, .25, .87),
    ],
}
