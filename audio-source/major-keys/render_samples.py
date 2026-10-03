"""Render the three auditions independently of the NEKO DISCO website.

Usage: python source/render_samples.py [05|06|07]
Each composition has a two-bar introduction, eight-bar hook, two-bar break,
seven-bar return, and one-bar melodic ending with an effects tail.
"""
from pathlib import Path
import json
import sys
import numpy as np
from scipy.io import wavfile
import synth as s
from scores import TRACKS

OUT = Path(__file__).resolve().parent.parent


def render(track):
    bpm, style = track['bpm'], track['style']
    beat = 60 / bpm
    bar_seconds = 4 * beat
    duration = 20 * bar_seconds + track['tail']
    s.initialize(duration, track['seed'])
    score = []
    kick_times = []

    def swing(value):
        # Only the second sixteenth in each eighth-note pair is delayed.
        step = round(value * 4)
        return value + (track['swing'] if abs(value*4-step) < .01 and step%2 else 0)

    def play(role, note, length, at, gain, pan=0):
        patch = 'bell' if role=='bells' else 'chord' if role=='chords' else role
        s.add(role, s.voice(note, length*beat, patch, style), at, gain, pan)
        score.append({'part': role, 'midi': note, 'seconds': round(at, 5),
                      'duration_beats': length, 'gain': round(gain, 4)})

    print(f"Rendering {track['id']} / {track['title']}: {bpm} BPM, {duration:.2f} s", flush=True)
    for bar, chord_name in enumerate(track['progression']):
        root, voicing = track['harmony'][chord_name]
        at = bar * bar_seconds
        intro = bar < 2
        is_break = bar in (10, 11)
        ending = bar == 19
        reprise = 12 <= bar < 19
        next_name = track['progression'][min(bar+1, 19)]
        next_root = track['harmony'][next_name][0]

        # Four-on-the-floor pulse; each break deliberately opens up space.
        if ending or bar == 10:
            kicks = [0]
        elif bar == 11:
            kicks = [0, 2, 3]
        else:
            kicks = [0, 1, 2, 3]
        for b in kicks:
            when = at + b*beat
            x = s.kick()
            if style=='funk':
                x *= np.exp(-np.arange(len(x))/s.SR/1.1)
            s.add('kick', x, when, .73)
            kick_times.append(when)

        if not ending:
            clap_beats = [3] if bar==10 else [1, 3]
            for b in clap_beats:
                x = s.clap()
                if style=='dream':
                    x = s.filt(x, 6700)
                s.add('clap', x, at+b*beat+.004, .23 if not is_break else .12)

            for step in range(8):
                if bar==10 and step%2==0:
                    continue
                opened = step%2==1 and not is_break
                if style=='dream':
                    opened = opened and step in (3, 7)
                pan = -.23 if step%2 else .25
                gain = (.108 if opened else .056)*(1 if step%2 else .73)
                s.add('hats', s.hat(opened), at+step*.5*beat+s.RNG.uniform(-.0015,.0025), gain, pan)

            if not intro and not is_break:
                if style=='funk':
                    for step in range(16):
                        s.add('hats', s.shaker(), at+swing(step*.25)*beat,
                              .042 if step%2 else .025, -.52 if step%2 else .41)
                    for b, note, pan in [(.75,57,-.40),(2.25,62,.42),(3.75,57,-.30)]:
                        s.add('percussion',s.percussion(note),at+swing(b)*beat,.115,pan)
                else:
                    for step in ([3,7,11,15] if style=='pop' else [7,15]):
                        s.add('hats',s.hat(),at+step*.25*beat+.006,.027,-.44)
                    for b,note,pan in [(1.75,73,-.42),(3.25,78,.45)]:
                        s.add('percussion',s.percussion(note),at+b*beat,.077 if style=='dream' else .096,pan)

            if bar in (1,9,11,17,18):
                fill = [3.25,3.5,3.75] if bar==11 else [3.5,3.75]
                for i,b in enumerate(fill):
                    if style=='funk':
                        s.add('percussion',s.tom(55-i*3),at+swing(b)*beat,.16+i*.025,(-.25,.25,-.1)[i])
                    else:
                        s.add('clap',s.clap(True),at+b*beat,.055+i*.023,(-.14,.14)[i%2])
        if bar in (0,2,6,12,16,19):
            s.add('fx',s.cymbal(),at,.055 if not ending else .034,-.18)

        # Bass patterns are separately written for each track's groove.
        if ending:
            bass_events = [(0,root,1.8,1)]
        elif is_break:
            bass_events = [(0,root,1.3,.65)]
            if style=='funk' and bar==11:
                bass_events += [(2.5,root,.22,.8),(3,root+7,.22,.7),(3.5,next_root-1,.23,.75)]
        elif 'bass_pattern' in track:
            bass_events = [(b,root+offset,length,velocity) for b,offset,length,velocity in track['bass_pattern']]
        elif style=='pop':
            bass_events = [(0,root,.50,1),(.75,root+12,.18,.76),(1.5,root,.31,.94),
                           (2.25,root+7,.21,.75),(2.75,root,.28,.91),
                           (3.5,root+12,.19,.79),(3.75,next_root-1,.17,.67)]
        elif style=='funk':
            bass_events = [(0,root,.28,1),(.375,root+12,.10,.40),(.75,root+12,.19,.8),
                           (1.25,root+7,.16,.64),(1.5,root,.32,.95),
                           (2.25,root,.18,.84),(2.75,root+12,.21,.77),
                           (3.25,root+7,.15,.68),(3.5,root,.17,.8),(3.75,next_root-1,.17,.64)]
            if bar%2:
                bass_events[3]=(1.25,root+10,.16,.64)
        else:
            bass_events = [(0,root,.69,1),(.875,root+12,.23,.67),(1.5,root,.47,.91),
                           (2.5,root,.37,.85),(3.25,root+7,.25,.72),(3.75,next_root,.19,.67)]
        for b,note,length,velocity in bass_events:
            play('bass',note,length,at+swing(b)*beat,.37*velocity)

        # Different accompaniment identities: polysynth, clav, electric keys.
        if intro:
            chord_events = [(0,.82,1.12),(1.5,.28,.79),(2.5,.38,.91),(3.5,.23,.8)]
        elif is_break or ending:
            chord_events = [(0,3.1,.8 if ending else .57)]
        elif 'chord_pattern' in track:
            chord_events = track['chord_pattern']
        elif style=='pop':
            chord_events = [(.5,.31,1),(1.5,.27,.82),(2.5,.38,.95),(3.5,.27,.82)]
        elif style=='funk':
            chord_events = [(.25,.18,.83),(1,.20,.90),(1.75,.19,.68),
                            (2.5,.27,1),(3.25,.17,.62),(3.75,.17,.77)]
        else:
            chord_events = [(.5,.90,.89),(2.5,.9,.79)]
        for b,length,velocity in chord_events:
            for i,note in enumerate(voicing):
                strum=0 if chord_name==track.get('black_key_chord',{}).get('name') else i*.004
                play('chords',note,length,at+swing(b)*beat+strum,
                     .071*velocity*np.sqrt(4/len(voicing)),float(np.linspace(-.55,.55,len(voicing))[i]))

        pad_gain = .037 if style=='dream' else .013 if style=='funk' else .020
        if is_break:
            pad_gain *= 1.6
        for i,note in enumerate(voicing):
            s.add('pad',s.pad_note(note,(3.85 if ending else 3.65)*beat),at,pad_gain)

        if bar in track['lead_bars']:
            phrase = track['phrases'][track['lead_bars'][bar]]
            for b,note,length,velocity in phrase:
                gain = .218 if style=='pop' else .235 if style=='funk' else .21
                play('lead',note,length,at+swing(b)*beat,gain*velocity)
                # Reprise gains a discreet layer, preserving the melodic line.
                if reprise and b in (0,.25,1.5):
                    if style=='pop':
                        play('bells',note+12,.20,at+b*beat+.011,.037*velocity,.35)
                    elif style=='funk':
                        play('lead',note-12,length,at+swing(b)*beat+.008,.031*velocity,-.18)
                    else:
                        play('lead',note-12,length,at+b*beat+.006,.026*velocity)

        # Flowing arpeggios form the third track's signature texture.
        if style=='dream' and not ending:
            arp_notes = [voicing[0]+12,voicing[2]+12,voicing[1]+12,voicing[3]+12]
            steps = range(8) if intro or is_break else range(16)
            step_len = .5 if intro or is_break else .25
            for step in steps:
                note = arp_notes[step%4]
                gain = .074 if is_break else .046 if not intro else .057
                play('arp',note,.22,at+step*step_len*beat,gain*(.82 if step%2 else 1),[-.38,.38][step%2])
        elif is_break:
            for step in range(8):
                note = voicing[[0,2,1,3][step%4]]+12
                role = 'arp' if style=='funk' else 'bells'
                play(role,note,.20,at+swing(step*.5)*beat,.092 if style=='pop' else .075,[-.35,.35][step%2])
        if bar==1:
            for b,note in track['intro_pickup']:
                play('arp' if style=='funk' else 'bells',note,.2,at+swing(b)*beat,.091,-.18)
            # Different, brief lift into each hook. The melody already starts
            # at beat one, so this is a response rather than an empty build-up.
            if track.get('intro_kind')=='rising-spark':
                for step,note in enumerate([voicing[0],voicing[1],voicing[2],voicing[3]]):
                    play('bells',note+24,.14,at+(3+step*.25)*beat,.052,(-.32,.32)[step%2])
            elif track.get('intro_kind')=='black-key-hit':
                for step,note in enumerate([73,75,78,80,82]):
                    play('bells',note,.14,at+(2.5+step*.25)*beat,.052,(-.3,.3)[step%2])
        if style=='pop' and bar in (3,5,7,13,15,17):
            for b,note in [(3.25,voicing[1]+24),(3.75,voicing[2]+24)]:
                play('bells',note,.14,at+b*beat,.034,.38)

    # Restrained sweep bridges the break; it is never on the entire time.
    t=s.times(bar_seconds*1.5)
    noise=s.filt(s.RNG.normal(0,1,len(t)),[1300,6500],'bandpass')
    noise*=np.linspace(0,1,len(t))**2*np.minimum(t/.02,1)
    noise[-int(.02*s.SR):]*=np.linspace(1,0,int(.02*s.SR))
    s.add('fx',noise,10.5*bar_seconds,.040 if style!='funk' else .025)

    print(f"Mixing {track['title']}",flush=True)
    mix, stem_stats=s.master(beat,kick_times,style)
    assert mix.shape==(int(duration*s.SR),2)
    assert np.isfinite(mix).all()
    wavfile.write(OUT/f"{track['file']}-premaster.wav",s.SR,mix.astype(np.float32))
    metadata={
        'title':track['title'],'audition':track['id'],'bpm':bpm,'key':track['key'],
        'description_ja':track['description_ja'],'duration_seconds':round(duration,3),
        'sample_rate':s.SR,'seed':track['seed'],'swing_delay_beats':track['swing'],
        'sections':[{'name':'intro','seconds':[0,round(2*bar_seconds,3)]},
                    {'name':'hook','seconds':[round(2*bar_seconds,3),round(10*bar_seconds,3)]},
                    {'name':'break','seconds':[round(10*bar_seconds,3),round(12*bar_seconds,3)]},
                    {'name':'return','seconds':[round(12*bar_seconds,3),round(19*bar_seconds,3)]},
                    {'name':'ending','seconds':[round(19*bar_seconds,3),round(duration,3)]}],
        'chords':track['progression'],'voicings':track['harmony'],
        'phrases':track['phrases'],'lead_bars_zero_based':track['lead_bars'],
        'intro_kind':track.get('intro_kind'),'black_key_chord':track.get('black_key_chord'),
        'premaster_peak_dbfs':round(20*np.log10(np.max(np.abs(mix))),2),
        'premaster_rms_dbfs':round(20*np.log10(np.sqrt(np.mean(mix**2))),2),
        'stereo_correlation':round(float(np.corrcoef(mix.T)[0,1]),3),
        'stem_rms_dbfs':stem_stats,'pitched_events':score,
    }
    (OUT/'source'/f"score-{track['id']}.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in metadata.items() if k in
        ['title','bpm','duration_seconds','premaster_peak_dbfs','premaster_rms_dbfs','stem_rms_dbfs','stereo_correlation']},indent=2),flush=True)


if __name__=='__main__':
    for track in TRACKS:
        if len(sys.argv)==1 or track['id'] in sys.argv[1:]:
            render(track)
