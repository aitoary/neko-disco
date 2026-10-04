"""Original procedural synth voices shared by the three audition tracks.
Derived from the approved-direction MEOWLIGHT audition; no audio samples.
"""
from pathlib import Path
import json
import math
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
TRACK_NAMES = ['kick', 'clap', 'hats', 'percussion', 'bass', 'chords', 'pad', 'lead', 'bells', 'arp', 'fx']

def initialize(seconds, seed):
    global N, RNG, STEMS
    N = int(seconds * SR)
    RNG = np.random.default_rng(seed)
    STEMS = {name: np.zeros((N, 2), np.float64) for name in TRACK_NAMES}


def hz(note):
    return 440.0 * 2 ** ((note - 69) / 12)


def times(seconds):
    return np.arange(max(1, int(seconds * SR)), dtype=np.float64) / SR


def filt(x, freq, kind='lowpass', order=2):
    return signal.sosfilt(signal.butter(order, freq, kind, fs=SR, output='sos'), x, axis=0)


def envelope(t, hold, attack=.008, decay=.12, sustain=.6, release=.10):
    attack_env = np.minimum(t / max(attack, .0001), 1)
    sustain_env = sustain + (1 - sustain) * np.exp(-np.maximum(t - attack, 0) / decay)
    e = attack_env * sustain_env
    release_mask = t >= hold
    held_level = min(hold / max(attack, .0001), 1) * (sustain + (1 - sustain) * math.exp(-max(hold - attack, 0) / decay))
    e[release_mask] = held_level * np.exp(-(t[release_mask] - hold) / max(release / 5, .001))
    if len(e) > 64:
        e[-64:] *= np.linspace(1, 0, 64)
    return e


def add(track, x, at, gain=1.0, pan=0.0):
    start = int(round(at * SR))
    if start < 0:
        x = x[-start:]
        start = 0
    length = min(len(x), N - start)
    if length <= 0:
        return
    if x.ndim == 1:
        angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        stereo = np.column_stack((x[:length] * np.cos(angle), x[:length] * np.sin(angle)))
    else:
        stereo = x[:length]
    STEMS[track][start:start + length] += gain * stereo


def analog(note, length, voice):
    """Band-limited oscillators; envelopes also vary harmonic brightness."""
    if voice == 'bass':
        release = .09
        t = times(length + release)
        f = hz(note)
        cut = 380 + 1650 * np.exp(-t / .042)
        phase = 2 * np.pi * f * t
        x = .53 * np.sin(phase)
        for h in range(1, min(21, int(16000 / f))):
            color = 1.0 if h % 2 else .64
            x += color * np.sin(phase * h + .07 * h) * np.exp(-h * f / cut) / h * .43
        e = envelope(t, length, .003, .08, .55, release)
        return np.tanh(x * 1.35) * e * .85
    if voice == 'chord':
        release = .17
        t = times(length + release)
        f = hz(note)
        cut = 1100 + 3100 * np.exp(-t / .09)
        x = np.zeros(len(t))
        for cents, weight in [(-5.0, .52), (5.0, .48)]:
            phase = 2 * np.pi * f * 2 ** (cents / 1200) * t
            offset = RNG.uniform(0, 2 * np.pi)
            for h in range(1, min(17, int(15000 / f))):
                x += weight * np.sin(phase * h + offset) / h * np.exp(-(h * f / cut) ** 1.25)
        x += .15 * np.sin(2 * np.pi * f * t + 1.8 * np.exp(-t / .09) * np.sin(2 * np.pi * 2 * f * t))
        return x * envelope(t, length, .008, .085, .40, release) * .7
    if voice == 'lead':
        release = .13
        t = times(length + release)
        f = hz(note)
        vibrato = .003 * np.sin(2 * np.pi * 5.1 * t) * np.minimum(t / .16, 1)
        cut = 1300 + 3300 * np.exp(-t / .09)
        x = np.zeros(len(t))
        for cents, weight in [(-3, .42), (3, .42), (0, .16)]:
            phase = 2 * np.pi * f * 2 ** (cents / 1200) * t + vibrato
            for h in range(1, min(16, int(16000 / f))):
                harmonic = .9 if h % 2 else .24
                x += weight * harmonic * np.sin(h * phase) / h * np.exp(-(h * f / cut) ** 1.35)
        x += .18 * np.sin(2 * np.pi * f * t + 1.1 * np.exp(-t / .07) * np.sin(4 * np.pi * f * t))
        return np.tanh(x * 1.15) * envelope(t, length, .007, .09, .65, release)
    if voice == 'bell':
        t = times(length + .52)
        f = hz(note)
        mod = 1.3 * np.exp(-t / .07) * np.sin(2 * np.pi * f * 2 * t)
        x = np.sin(2 * np.pi * f * t + mod) + .24 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t / .07)
        return x * np.minimum(t / .003, 1) * np.exp(-t / .16) * .7
    raise ValueError(voice)


def pad_note(note, length):
    t = times(length + .75)
    f = hz(note)
    channels = []
    for cents, phase_offset in [(-5, .2), (5, 1.1)]:
        phase = 2 * np.pi * f * 2 ** (cents / 1200) * t + phase_offset + .025 * np.sin(2 * np.pi * .7 * t)
        x = np.zeros(len(t))
        for h in range(1, 9):
            x += np.sin(phase * h) / h ** 1.65 * np.exp(-h * f / 1600)
        channels.append(x)
    stereo = np.column_stack(channels)
    return stereo * envelope(t, length, .24, .42, .75, .75)[:, None]


def kick():
    t = times(.48)
    f = 48 + 109 * np.exp(-t / .022) + 20 * np.exp(-t / .1)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t / .105)
    top = .11 * np.sin(phase * 2) * np.exp(-t / .035)
    click = filt(RNG.normal(0, 1, len(t)), [2000, 7500], 'bandpass') * np.exp(-t / .0035) * .11
    return np.tanh((body + top + click) * 1.4) * np.minimum(t / .0008, 1)


def clap(soft=False):
    t = times(.30)
    noise = filt(RNG.normal(0, 1, len(t)), [900, 8000], 'bandpass')
    e = np.zeros(len(t))
    for offset, weight in [(0, .7), (.011, .8), (.023, 1.0)]:
        age = t - offset
        e += weight * np.exp(-np.maximum(age, 0) / .008) * (age >= 0)
    e += .65 * np.exp(-np.maximum(t - .033, 0) / .047) * (t >= .033)
    snare = .33 * np.sin(2 * np.pi * 185 * t) * np.exp(-t / .04)
    return (noise * e + snare) * (.6 if soft else 1.0) * np.minimum(t / .0008, 1)


def hat(opened=False):
    duration = .29 if opened else .083
    t = times(duration)
    noise = filt(RNG.normal(0, 1, len(t)), [6500, 15000], 'bandpass')
    metal = sum(np.sin(2 * np.pi * f * t) for f in [4271, 5987, 8011]) / 3
    decay = .065 if opened else .015
    return (.85 * noise + .1 * metal) * np.exp(-t / decay) * np.minimum(t / .0007, 1)


def percussion(note=74):
    t = times(.17)
    phase = 2 * np.pi * (hz(note) * t + 12 * .006 * (1 - np.exp(-t / .006)))
    x = np.sin(phase + 1.1 * np.sin(phase * 1.48) * np.exp(-t / .01))
    return x * np.exp(-t / .028) * np.minimum(t / .002, 1)


def cymbal():
    t = times(1.25)
    x = filt(RNG.normal(0, 1, len(t)), [4100, 14500], 'bandpass')
    return x * np.minimum(t / .003, 1) * np.exp(-t / .24)


def voice(note, length, role, style):
    """Patch selection changes envelopes and spectra as well as voicing."""
    if role == 'bass' and style == 'pop':
        return analog(note, length, 'bass')
    if role == 'chord' and style == 'pop':
        return analog(note, length, 'chord')
    if role == 'bell':
        return analog(note, length, 'bell')

    f = hz(note)
    release = .24 if style == 'dream' else .10
    if role == 'arp':
        release = .25
    t = times(length + release)
    phase = 2 * np.pi * f * t

    if role == 'bass':
        if style == 'funk':
            # A little pitch scoop and a bright pluck, then a round sustain.
            phase += 2 * np.pi * f * .035 * .006 * (1-np.exp(-t/.006))
            cutoff = 380 + 3800 * np.exp(-t/.038)
            x = .70 * np.sin(phase)
            for h in range(2, 19):
                x += .72 / h * np.sin(h*phase+.08*h) * np.exp(-h*f/cutoff)
            x += .095*np.sin(phase+2.8*np.exp(-t/.014)*np.sin(phase*3))
            return np.tanh(x*1.23)*envelope(t,length,.0018,.07,.38,release)*.84
        x = .72*np.sin(phase)+.23*np.sin(phase*2)+.09*np.sin(phase*3)
        x += .12*np.sin(phase+1.6*np.exp(-t/.06)*np.sin(phase))
        return x*envelope(t,length,.006,.12,.68,release)

    if role == 'chord' and style == 'funk':
        # Short clavinet-like FM attack, with a moving resonant emphasis.
        decay = np.exp(-t/.065)
        x = np.sin(phase+2.0*decay*np.sin(phase*2))
        x += .24*np.sin(phase*3)*np.exp(-t/.045)
        x += .14*np.sin(phase*5)*np.exp(-t/.034)
        return x*envelope(t,length,.002,.055,.14,release)*.73

    if role == 'chord' and style == 'dream':
        # Soft electric keys, with the tine transient blended into sine body.
        x = .76*np.sin(phase+1.0*np.exp(-t/.12)*np.sin(phase*2))
        x += .16*np.sin(phase*3)*np.exp(-t/.20)
        x += .10*np.sin(phase*.9992+.2)
        return x*envelope(t,length,.006,.4,.39,release)*.78

    if role == 'arp':
        cut = 1150+2900*np.exp(-t/.042)
        x = .65*np.sin(phase+1.0*np.exp(-t/.06)*np.sin(phase*2))
        for h in range(2, 8):
            x += .45*np.sin(h*phase)/h*np.exp(-h*f/cut)
        return x*envelope(t,length,.003,.08,.12,release)*.7

    if role == 'lead':
        if style == 'pop':
            cut = 1850+2200*np.exp(-t/.07)
            x = np.zeros(len(t))
            for cents, weight in [(-4,.42),(4,.42),(0,.16)]:
                p = phase*2**(cents/1200)
                for h in range(1, min(13, int(17000/f))):
                    color = 1 if h%2 else .21
                    x += weight*color*np.sin(h*p)/h*np.exp(-(h*f/cut)**1.5)
            x += .28*np.sin(phase+1.6*np.exp(-t/.045)*np.sin(phase*2))
            return np.tanh(x*1.05)*envelope(t,length,.004,.105,.51,release)
        if style == 'funk':
            # Trumpet-like polysynth: the filter swells, then closes quickly.
            cut = 1050+2600*(1-np.exp(-t/.011))*np.exp(-t/.13)
            x = np.zeros(len(t))
            for cents, weight in [(-3,.55),(3,.45)]:
                p = phase*2**(cents/1200)
                for h in range(1, min(15, int(15000/f))):
                    x += weight*np.sin(h*p)*(.85 if h%2 else .52)/h*np.exp(-(h*f/cut)**1.35)
            x += .14*np.sin(phase+1.4*np.exp(-t/.045)*np.sin(phase*2))
            return np.tanh(x*1.4)*envelope(t,length,.013,.08,.39,release)
        # Airy, wider lead with longer phrasing and an understated triangle.
        channels=[]
        for cents, offset in [(-4,.02),(4,-.02)]:
            # Frequency modulation is integrated, so vibrato depth is in cents.
            frequency=f*2**((cents+4*np.sin(2*np.pi*5*t)*np.minimum(t/.3,1))/1200)
            p=2*np.pi*np.cumsum(frequency)/SR+offset
            x=.72*np.sin(p)
            for h in range(2,min(10,int(14000/f))):
                x+=.44*np.sin(h*p)/h**1.35*np.exp(-h*f/2500)
            x+=.13*np.sin(p+1.1*np.exp(-t/.09)*np.sin(p*2))
            channels.append(x)
        return np.column_stack(channels)*envelope(t,length,.014,.2,.64,release)[:,None]*.77
    raise ValueError((role, style))


def shaker():
    t=times(.095)
    noise=filt(RNG.normal(0,1,len(t)),[4200,14000],'bandpass')
    return noise*np.sin(np.minimum(t/.016,1)*np.pi/2)*np.exp(-t/.018)


def tom(note=48):
    t=times(.23)
    f=hz(note)*(1+.32*np.exp(-t/.013))
    p=2*np.pi*np.cumsum(f)/SR
    return (np.sin(p)+.13*np.sin(p*1.7))*np.exp(-t/.055)*np.minimum(t/.001,1)


def echo(x, beat, factor, wet, feedback=.32, repeats=4):
    result=np.zeros_like(x)
    filtered=filt(filt(x,350,'highpass'),4200)
    for repeat in range(1,repeats+1):
        shift=int(beat*factor*SR*repeat)
        if shift>=len(x):
            break
        y=filtered if repeat%2==0 else filtered[:,::-1]
        balance=np.array([.65,1.18]) if repeat%2 else np.array([1.18,.65])
        result[shift:]+=y[:-shift]*balance*wet*feedback**(repeat-1)
    return result


def room_ir(channel, style):
    decay=.37 if style=='dream' else .20 if style=='funk' else .245
    t=times(decay*7)
    ir=filt(RNG.normal(0,1,len(t)),4100 if channel==0 else 3700)
    ir*=np.exp(-t/decay)*np.minimum(np.maximum(t-.027,0)/.038,1)
    ir/=max(np.sqrt(np.sum(ir**2)),1e-9)
    ir*=.42
    for at,amp in [(.022,.10),(.049,.08),(.078,.06),(.119,.04)]:
        ir[int((at+channel*.004)*SR)]+=amp
    return ir


def master(beat, kick_times, style):
    for name,cut in [('pad',210),('chords',170),('lead',210),('bells',430),('clap',160),('arp',420)]:
        STEMS[name]=filt(STEMS[name],cut,'highpass')
    STEMS['bass']=filt(STEMS['bass'],3300 if style=='funk' else 2200)
    STEMS['hats']=filt(STEMS['hats'],12500)
    duck=np.ones(N)
    for at in kick_times:
        start=int(at*SR)
        curve=1-np.exp(-times(.32)/(.076 if style=='funk' else .088))
        length=min(len(curve),N-start)
        duck[start:start+length]=np.minimum(duck[start:start+length],curve[:length])
    for name,depth in [('bass',.24),('chords',.40),('pad',.51),('lead',.13),('bells',.15),('arp',.31)]:
        STEMS[name]*=(1-depth+depth*duck)[:,None]

    gains={'kick':-4.5,'clap':8,'hats':10,'percussion':8.5,'bass':.5,
           'chords':10.5,'pad':3.5,'lead':4,'bells':6.5,'arp':6.5,'fx':8.5}
    if style=='funk':
        gains.update(bass=2.7,chords=9.0,lead=4.8,pad=1.5,hats=8.5,percussion=7.5)
    if style=='dream':
        gains.update(kick=-5.0,bass=-.6,chords=6.5,pad=4.0,lead=2.5,arp=10.5,hats=8)
    for name,db in gains.items():
        STEMS[name]*=10**(db/20)

    mix=sum(STEMS.values())
    wet=.26 if style=='dream' else .13 if style=='funk' else .20
    mix+=echo(STEMS['lead'],beat,.75,wet)
    mix+=echo(STEMS['bells'],beat,.75,.25)
    mix+=echo(STEMS['arp'],beat,.75,.30 if style=='dream' else .16,.37)
    mix+=echo(STEMS['chords'],beat,.5,.065,.24,3)
    send=(STEMS['lead']*(.26 if style=='dream' else .17)+STEMS['chords']*.19+
          STEMS['pad']*.40+STEMS['bells']*.34+STEMS['arp']*.26+
          STEMS['clap']*(.18 if style=='funk' else .26)+STEMS['percussion']*.16)
    for channel in range(2):
        mix[:,channel]+=signal.fftconvolve(send[:,channel],room_ir(channel,style))[:N]
    mix=filt(filt(mix,26,'highpass'),17000)
    mix=np.tanh(mix*1.10)/1.10
    mix[:int(.009*SR)]*=np.linspace(0,1,int(.009*SR))[:,None]
    fade=int(.8*SR)
    mix[-fade:]*=np.linspace(1,0,fade)[:,None]
    peak=float(np.max(np.abs(mix)))
    if peak>.94:
        mix*=.94/peak
    return mix, {k:round(20*np.log10(max(np.sqrt(np.mean(v**2)),1e-9)),2)
                 for k,v in STEMS.items()}
